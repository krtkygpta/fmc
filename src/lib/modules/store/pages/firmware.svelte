<script lang="ts">
  // One firmware image: what it changes, how far it has been proven, and the download —
  // which waits for the reader to say they know what flashing can do.
  import { BackBtn } from "$lib/shared/components/back-btn";
  import { Badge } from "$lib/shared/components/badge";
  import { Button } from "$lib/shared/components/button";
  import { Checkbox } from "$lib/shared/components/checkbox";
  import { Icon } from "$lib/shared/components/icon";
  import { Page } from "$lib/shared/components/page";
  import { Prose } from "$lib/shared/components/prose";
  import { Skeleton } from "$lib/shared/components/skeleton";
  import { StatStrip } from "$lib/shared/components/stat-strip";
  import { fileUrl } from "$lib/shared/api";
  import { compact, day } from "$lib/shared/lib/format";
  import { DEVICES, deviceLabel } from "$lib/modules/market/lib/devices";
  import { bleModel } from "$lib/modules/device/model";
  import {
    firmwareKind,
    flashable,
    isLoader,
    recordDevice,
    testedKey,
    testedOnHardware,
  } from "../lib/firmware";
  import { FLASH_LIMITS, WATCH_UTILS_DOCS } from "../lib/links";
  import { storeModel } from "../model";
  import { t } from "../i18n";

  interface Props {
    id: string;
  }
  const { id }: Props = $props();

  const {
    $firmware: firmware,
    $firmwareLoading: loading,
    $riskAccepted: riskAccepted,
    firmwareRequested,
    riskAcceptedSet,
    flashRequested,
    downloadRequested,
    $imageSaving: imageSaving,
    $imageFetching: imageFetching,
    $imageProgress: imageProgress,
    $packageFetching: packageFetching,
    loaderInstallRequested,
    $imageErr: imageErr,
    $firmwareOnWatch: onWatch,
    $wrongWatch: wrongWatch,
  } = storeModel;
  const {
    $bleInfo: watch,
    $bleStatus: bleStatus,
    $connecting: connecting,
    $otaFlashing: flashing,
    $otaProgress: progress,
    $otaResult: result,
    $otaError: otaError,
    $wp2: wp2,
    $wp2Reading: wp2Reading,
    $installing: installing,
    $installProgress: installProgress,
    $installed: installed,
    $installError: installError,
    OTA_MIN_BATTERY,
    connectRequested,
  } = bleModel;
  const busy = $derived(
    $imageFetching || $imageSaving || $packageFetching || $flashing || $installing,
  );
  const done = $derived($result === "done" || Boolean($installed));
  // one bar for the whole job: the download, then the transfer
  const pct = $derived($imageProgress ?? $progress ?? $installProgress ?? 0);
  const loader = $derived(isLoader($firmware?.kind));
  const error = $derived($imageErr || $otaError || $installError);

  $effect(() => {
    firmwareRequested(id);
  });

  const fw = $derived($firmware);
  const kind = $derived(firmwareKind(fw?.kind));
  const onHardware = $derived(testedOnHardware(fw?.tested));
  const tested = $derived(testedKey(fw?.tested));
  const device = $derived(recordDevice(fw?.device));
  const deviceName = $derived(DEVICES.find((d) => d.value === device)?.label ?? device);
  // another watch's image: FMC only downloads it, the Install button isn't there to press
  const ota = $derived(flashable(device));
  const stats = $derived(
    fw
      ? [
          ...(fw.version ? [{ label: $t.version, value: fw.version }] : []),
          { label: $t.downloads, value: compact(fw.downloads) },
        ]
      : [],
  );
</script>

<svelte:head><title>{$t.firmwareTitle(fw?.name, deviceName)}</title></svelte:head>

<Page>
  <div class="detail">
    <BackBtn href="/firmware" />

    {#if fw}
      <div class="cover" class:bare={!fw.cover}>
        {#if fw.cover}
          <img src={fileUrl(fw, "cover")} alt="" />
        {:else}
          <Icon name={kind.icon} size={48} />
        {/if}
      </div>

      <header class="identity">
        <h1 class="type-display">{fw.name}</h1>
        {#if fw.summary}<p class="summary">{fw.summary}</p>{/if}
        <div class="badges">
          {#if !fw.published}<Badge warn>{$t.draft}</Badge>{/if}
          <Badge quiet>{$t.kinds[kind.key].label}</Badge>
          {#if tested}
            <Badge quiet={onHardware} warn={!onHardware}>
              <Icon name={onHardware ? "verified" : "warning"} size={14} />
              {$t.tested[tested]}
            </Badge>
          {/if}
          {#if deviceLabel(device)}<Badge quiet={ota} warn={!ota}>{deviceLabel(device)}</Badge>{/if}
        </div>
      </header>

      <StatStrip items={stats} />

      <!-- the whole action in one block: the warning, the tick, two buttons, one status line.
           Everything else — preconditions, the description, links — waits in "Details". -->
      <section class="act">
        {#if !ota}
          <div class="disclaimer device type-subtitle" role="note">
            <Icon name="block" size={20} />
            <span>
              {$t.onlyFor(deviceName)}
            </span>
          </div>
        {/if}
        {#if $wrongWatch}
          <p class="err" role="alert">
            {$t.wrongWatch($watch?.name ?? $t.unnamed, deviceName)}
          </p>
        {/if}
        <div class="disclaimer" role="note">
          <Icon name="warning" size={20} />
          <span>
            {$t.ownRisk}
          </span>
        </div>

        {#if fw.image}
          <label class="accept">
            <Checkbox checked={$riskAccepted} onChange={(v) => riskAcceptedSet(v)} />
            <span>{$t.acceptRisk}</span>
          </label>
        {/if}

        <div class="buttons">
          <Button
            kind="secondary"
            size="large"
            onClick={() => downloadRequested()}
            disabled={!fw.image || !$riskAccepted || busy}
          >
            <Icon name="download" size={22} />
            {$t.download}
          </Button>
          {#if !ota}
            <!-- no Install, no Connect: nothing on this page can send it to a watch -->
          {:else if !$watch}
            <Button size="large" onClick={() => connectRequested()} disabled={$connecting}>
              <Icon name="bluetooth" size={22} />
              {$connecting ? $t.connecting : $t.connect}
            </Button>
          {:else}
            <Button
              size="large"
              onClick={() => (loader ? loaderInstallRequested() : flashRequested())}
              disabled={!fw.image || !$riskAccepted || busy || done || $wrongWatch}
            >
              <Icon name="bolt" size={22} />
              {$t.install}
            </Button>
          {/if}
        </div>

        {#if $imageProgress !== null || $flashing || $installing}
          <div class="progress">
            <div class="progress-row type-caption">
              <span>{$imageProgress !== null ? $t.downloading : $t.installingOnWatch}</span>
              <span class="pct type-mono">{pct}%</span>
            </div>
            <progress max="100" value={pct}></progress>
            {#if $flashing}<p class="muted type-caption">
                {$t.keepTabOpen}
              </p>{/if}
          </div>
        {/if}

        {#if $installed}
          <p class="ok">
            <Icon name="check_circle" size={20} />
            {$t.installedOnTheWatch}
          </p>
        {/if}
        {#if $result === "done"}
          <p class="ok">
            <Icon name="check_circle" size={20} />
            {$t.sent}
          </p>
        {/if}
        {#if error}<p class="err">{error}</p>{/if}

        <!-- one quiet line: who may, what the watch runs, how it compares -->
        <p class="muted state type-caption">
          {#if $watch}
            {#if $wp2Reading}
              {$t.checkingWatch}
            {:else if $wp2 === "stock"}
              {$t.watchStock}
            {:else if $wp2}
              {$t.watchPatched($wp2.stub.version, $wp2.loader?.version)}
            {/if}
            {#if $onWatch === "update"}<Badge>{$t.updateAvailable}</Badge>{/if}
            {#if $onWatch === "installed"}<Badge quiet>{$t.installed}</Badge>{/if}
          {/if}
        </p>
      </section>

      <details class="more">
        <summary class="type-subtitle">{$t.details}</summary>
        <div class="more-body">
          {#if loader}
            <p>
              {$t.loaderHow}
            </p>
            <pre class="type-caption type-mono"><code
                >wp2apps install loader.wp2app --address &lt;address&gt;</code
              ></pre>
          {:else if ota}
            <h3 class="type-heading">{$t.beforeInstall}</h3>
            <ul class="checklist">
              <li>{$t.checkCharger(OTA_MIN_BATTERY)}</li>
              <li>{$t.checkNoApp}</li>
              <li>{$t.checkTab}</li>
            </ul>
          {/if}
          {#if $t.kinds[kind.key].hint || fw.base}
            <p class="hint">
              {$t.kinds[kind.key].hint}
              {#if fw.base}{$t.builtOn(fw.base)}{/if}
            </p>
          {/if}
          {#if fw.description}<Prose source={fw.description} />{/if}
          <div class="links">
            {#if fw.source}
              <Button kind="secondary" href={fw.source} external>
                <Icon name="code" size={20} />
                {$t.source}
              </Button>
            {/if}
            {#if fw.demo}
              <Button kind="secondary" href={fw.demo} external>
                <Icon name="play_circle" size={20} />
                {$t.emulator}
              </Button>
            {/if}
            {#if fw.video}
              <Button kind="secondary" href={fw.video} external>
                <Icon name="smart_display" size={20} />
                {$t.video}
              </Button>
            {/if}
            <Button kind="secondary" href={WATCH_UTILS_DOCS} external>
              <Icon name="menu_book" size={20} />
              {$t.flashingGuide}
            </Button>
            <Button kind="ghost" href={FLASH_LIMITS} external>{$t.limits}</Button>
          </div>
        </div>
      </details>

      <p class="dates type-caption">
        {#if fw.author}{$t.by(fw.author)} ·{/if}
        <Icon name="calendar_today" size={14} />
        {$t.updated(day(fw.updated))}
      </p>
    {:else if $loading}
      <Skeleton height="12rem" />
      <Skeleton width="60%" height="2rem" />
      <Skeleton width="85%" height="1rem" />
      <Skeleton height="4rem" />
      <Skeleton height="10rem" />
    {:else}
      <p class="empty">{$t.firmwareNotFound}</p>
    {/if}
  </div>
</Page>

<style>
  .detail {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 40rem;
    margin: 0 auto;
    padding: 1rem 1rem 2rem;
  }
  .cover {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: var(--border-radius-tile);
    color: var(--color-text);
    background:
      radial-gradient(circle, oklch(from var(--color-text) l c h / 22%) 1px, transparent 1.5px) 0
        0 / 0.625rem 0.625rem,
      oklch(from var(--color-text) l c h / 4%);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    /* without a picture it is a band, not a poster — no reason to spend a screen on a wash */
    &.bare {
      aspect-ratio: auto;
      height: 6.5rem;
    }
  }
  .identity {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  h1 {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .summary {
    margin: 0;
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .hint,
  /* a small calendar glyph leads the date */
  .dates {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.375rem;
    margin: 0;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  p {
    margin: 0;
  }
  .act {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  /* the one warning on the page: a red plate, one line */
  .disclaimer {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
    border-radius: var(--border-radius);
    color: var(--color-error);
    background: oklch(from var(--color-error) l c h / 12%);
    border: 1px solid oklch(from var(--color-error) l c h / 30%);

    :global(.icon) {
      flex: none;
    }
    /* which watch is the one thing on this plate to read first */
  }
  .accept {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
  }
  /* two buttons side by side, or Download alone across the row */
  .buttons {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    gap: 0.5rem;
  }
  .progress {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .progress-row {
    display: flex;
    justify-content: space-between;
  }
  .pct {
    font-variant-numeric: tabular-nums;
  }
  .state {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
  }
  /* everything that isn't the action, folded */
  .more {
    border-top: 1px solid oklch(from var(--color-text) l c h / 10%);

    summary {
      padding: 0.875rem 0;
      cursor: pointer;
    }
  }
  .more-body {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;

    h3 {
      margin: 0;
    }
  }
  pre {
    margin: 0;
    padding: 0.625rem 0.75rem;
    overflow-x: auto;
    border-radius: calc(var(--border-radius) / 2);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    background: oklch(from var(--color-text) l c h / 6%);
    border: 1px solid oklch(from var(--color-text) l c h / 12%);

    code {
      font: inherit;
    }
  }
  .checklist {
    margin: 0;
    padding-inline-start: 1.25rem;
  }
  .muted {
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .ok {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }
  .err {
    color: var(--color-error);
  }
  progress {
    width: 100%;
    height: 0.375rem;
    accent-color: var(--color-accent);
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    &:empty {
      display: none;
    }
  }
  .empty {
    padding: 4rem 0;
    text-align: center;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  @media (max-width: 767px) {
    .links > :global(*) {
      flex: 1 1 auto;
    }
  }
</style>
