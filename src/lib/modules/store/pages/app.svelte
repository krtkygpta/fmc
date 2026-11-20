<script lang="ts">
  // One app: what it is, the package, and how to get it onto the watch.
  import { BackBtn } from "$lib/shared/components/back-btn";
  import { Badge } from "$lib/shared/components/badge";
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { Page } from "$lib/shared/components/page";
  import { Prose } from "$lib/shared/components/prose";
  import { Skeleton } from "$lib/shared/components/skeleton";
  import { StatStrip } from "$lib/shared/components/stat-strip";
  import { fileUrl, pb } from "$lib/shared/api";
  import { compact, day } from "$lib/shared/lib/format";
  import { deviceLabel } from "$lib/modules/market/lib/devices";
  import { bleModel } from "$lib/modules/device/model";
  import { MAKE_AN_APP } from "../lib/links";
  import { storeModel } from "../model";
  import { t } from "../i18n";

  interface Props {
    id: string;
  }
  const { id }: Props = $props();

  const {
    $app: app,
    $appLoading: loading,
    $appsOnWatch: onWatch,
    appRequested,
    appDownloadUrl,
    appInstallRequested,
    $packageFetching: fetching,
    $imageErr: fetchErr,
  } = storeModel;
  const state = $derived($app ? $onWatch[$app.id] : undefined);
  const {
    $bleInfo: watch,
    $connecting: connecting,
    $wp2: wp2,
    $installing: installing,
    $installProgress: installProgress,
    $installed: installed,
    $installError: installError,
    connectRequested,
  } = bleModel;
  const busy = $derived($installing || $fetching);
  const error = $derived($fetchErr || $installError);

  $effect(() => {
    appRequested(id);
  });

  const stats = $derived(
    $app
      ? [
          ...($app.version ? [{ label: $t.version, value: $app.version }] : []),
          ...($app.abi ? [{ label: $t.appAbi, value: $app.abi }] : []),
          { label: $t.downloads, value: compact($app.downloads) },
        ]
      : [],
  );
  const shots = $derived<string[]>($app?.screenshots ?? []);
</script>

<svelte:head><title>{$t.appTitle($app?.name)}</title></svelte:head>

<Page>
  <div class="detail">
    <BackBtn href="/apps" />

    {#if $app}
      <header class="head">
        {#if $app.icon}
          <img class="app-icon" src={fileUrl($app, "icon")} alt="" />
        {:else}
          <span class="app-icon letter type-display">{$app.name.slice(0, 1).toUpperCase()}</span>
        {/if}
        <div class="identity">
          <h1 class="type-display">{$app.name}</h1>
          {#if $app.summary}<p class="summary">{$app.summary}</p>{/if}
          {#if state}
            <!-- read from the watch: the build there against this package (store.model) -->
            <div>
              {#if state === "update"}
                <Badge>{$t.updateAvailable}</Badge>
              {:else}
                <Badge quiet>{$t.installedOnYourWatch}</Badge>
              {/if}
            </div>
          {/if}
          <p class="by type-small">
            {#if $app.author}{$app.author}{/if}
            {#if $app.author && deviceLabel($app.device)}·{/if}
            {deviceLabel($app.device)}
          </p>
        </div>
      </header>

      <!-- Download and Install side by side; Install goes over the App Loader's own channel -->
      <section class="act">
        <div class="buttons">
          <Button
            size="large"
            kind="secondary"
            href={appDownloadUrl($app)}
            disabled={!$app.package}
          >
            <Icon name="download" size={22} />
            {$t.download}
          </Button>
          {#if !$watch}
            <Button size="large" onClick={() => connectRequested()} disabled={$connecting}>
              <Icon name="bluetooth" size={22} />
              {$connecting ? $t.connecting : $t.connect}
            </Button>
          {:else}
            <Button
              size="large"
              onClick={() => appInstallRequested()}
              disabled={!$app.package || busy || state === "installed"}
            >
              <Icon name={state === "update" ? "upgrade" : "install_desktop"} size={22} />
              {state === "update"
                ? $t.updateBtn
                : state === "installed"
                  ? $t.installed
                  : $t.install}
            </Button>
          {/if}
        </div>
        {#if $installing}
          <div class="progress">
            <div class="progress-row type-caption">
              <span>{$t.installingOnWatch}</span>
              <span class="pct type-mono">{$installProgress ?? 0}%</span>
            </div>
            <progress max="100" value={$installProgress ?? 0}></progress>
          </div>
        {/if}
        {#if $installed}
          <p class="ok">
            <Icon name="check_circle" size={20} />
            {$t.installedOpenApps}
          </p>
        {/if}
        {#if error}<p class="err">{error}</p>{/if}
        {#if $wp2 === "stock"}
          <p class="muted type-caption">
            {$t.stockBefore} <a href="/firmware">{$t.stockLink}</a>{$t.stockAfter}
          </p>
        {/if}
      </section>

      <StatStrip items={stats} />

      {#if shots.length}
        <div class="shots">
          {#each shots as shot (shot)}
            <img src={pb.files.getURL($app, shot)} alt={$t.shotAlt($app.name)} loading="lazy" />
          {/each}
        </div>
      {/if}

      {#if $app.description}
        <section>
          <Prose source={$app.description} />
        </section>
      {/if}

      <details class="more">
        <summary class="type-subtitle">{$t.details}</summary>
        <div class="more-body">
          <ol>
            <li>
              <span class="n type-label">1</span>
              <span>
                {$t.step1a} <a href="/firmware">{$t.step1Link}</a>
                {$t.step1b}
                <b>Apps</b>
                {$t.step1c}
              </span>
            </li>
            <li>
              <span class="n type-label">2</span>
              <span>
                {$t.step2} <code>wp2apps</code>{$t.step2Tool}
                <code class="cmd">wp2apps install app.wp2app --address …</code>
              </span>
            </li>
            <li>
              <span class="n type-label">3</span>
              <span>
                {$t.step3a} <b>Apps</b>
                {$t.step3b}
              </span>
            </li>
          </ol>
          <div class="links">
            {#if $app.source}
              <Button kind="secondary" href={$app.source} external>
                <Icon name="code" size={20} />
                {$t.source}
              </Button>
            {/if}
            <Button kind="secondary" href={MAKE_AN_APP} external>
              <Icon name="menu_book" size={20} />
              {$t.writeOwnApp}
            </Button>
          </div>
        </div>
      </details>

      <p class="dates type-caption">
        <Icon name="calendar_today" size={14} />
        {$t.updated(day($app.updated))}
      </p>
    {:else if $loading}
      <div class="head">
        <Skeleton width="5rem" height="5rem" round />
        <div class="identity">
          <Skeleton width="60%" height="1.75rem" />
          <Skeleton width="85%" height="1rem" />
        </div>
      </div>
      <Skeleton height="3rem" />
      <Skeleton height="4rem" />
      <Skeleton height="8rem" />
    {:else}
      <p class="empty">{$t.appNotFound}</p>
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
  .head {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .app-icon {
    flex: none;
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 50%;
    object-fit: cover;
    background: oklch(from var(--color-text) l c h / 8%);

    &.letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: oklch(from var(--color-text) l c h / 60%);
    }
  }
  .identity {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  h1 {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .summary {
    margin: 0;
  }
  .by {
    margin: 0;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .act {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;

    p {
      margin: 0;
    }
    a {
      color: inherit;
      text-underline-offset: 0.2em;
    }
  }
  .buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
  progress {
    width: 100%;
    height: 0.375rem;
    accent-color: var(--color-accent);
  }
  .ok {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .err {
    color: var(--color-error);
  }
  .muted {
    color: oklch(from var(--color-text) l c h / 55%);
  }
  /* watch screens, so round ones — a row that scrolls sideways, edge to edge on a phone */
  .shots {
    display: flex;
    gap: 0.75rem;
    margin-inline: -1rem;
    padding-inline: 1rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;

    img {
      flex: none;
      width: 11rem;
      aspect-ratio: 1;
      border-radius: 50%;
      object-fit: cover;
      background: oklch(0 0 0);
      scroll-snap-align: center;
    }
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  /* the manual way and the links, folded */
  .more {
    border-top: 1px solid oklch(from var(--color-text) l c h / 10%);

    summary {
      padding: 0.875rem 0;
      cursor: pointer;
    }
    ol {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      gap: 0.75rem;

      /* the command line scrolls inside its own box instead of widening the step */
      > span:last-child {
        min-width: 0;
      }
    }
    a:not(:global(.btn)) {
      color: var(--color-text);
      text-decoration-color: var(--color-accent);
      text-underline-offset: 0.2em;
    }
  }
  .more-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 0.5rem;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .n {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-on-accent);
  }
  .cmd {
    display: block;
    margin-block: 0.375rem;
    padding: 0.5rem 0.625rem;
    overflow-x: auto;
    white-space: nowrap;
    border-radius: calc(var(--border-radius) / 2);
    background: oklch(from var(--color-text) l c h / 8%);
    border: 1px solid oklch(from var(--color-text) l c h / 12%);
  }
  /* a small calendar glyph leads the date */
  .dates {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.375rem;
    margin: 0;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .empty {
    padding: 4rem 0;
    text-align: center;
    color: oklch(from var(--color-text) l c h / 55%);
  }
</style>
