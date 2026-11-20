<script lang="ts">
  // The Developer panel: a local build — an app or App Loader .wp2app, or an OTA image — onto
  // the watch without publishing it first. Pick the file once; after a rebuild, Install again.
  // Same shell as the watch panel it opens from.
  import { AdaptivePopover } from "$lib/shared/components/adaptive-popover";
  import { Button } from "$lib/shared/components/button";
  import { Checkbox } from "$lib/shared/components/checkbox";
  import { Icon } from "$lib/shared/components/icon";
  import { bleModel, devModel } from "../model";
  import { t } from "../i18n";

  const {
    $open: open,
    $build: build,
    $riskAccepted: riskAccepted,
    $error: devError,
    $reading: reading,
    panelClosed,
    pickRequested,
    installRequested,
    riskAcceptedSet,
  } = devModel;
  const {
    $bleInfo: watch,
    $wp2: wp2,
    $wp2Reading: wp2Reading,
    $installing: installing,
    $installProgress: installProgress,
    $installed: installed,
    $installError: installError,
    $otaFlashing: flashing,
    $otaProgress: otaProgress,
    $otaResult: otaResult,
    $otaError: otaError,
  } = bleModel;

  const firmware = $derived($build?.kind === "firmware");
  const busy = $derived($reading || $installing || $flashing);
  const pct = $derived($otaProgress ?? $installProgress ?? 0);
  const error = $derived($devError || $installError || $otaError);
  const apps = $derived($wp2 && $wp2 !== "stock" ? Object.entries($wp2.apps) : []);
  const time = (ms: number) => new Date(ms).toLocaleTimeString();
</script>

<AdaptivePopover open={$open} title={$t.developer} onClose={() => panelClosed()}>
  <div class="section">
    <h2 class="title type-heading">{$t.onTheWatch}</h2>
    {#if !$watch}
      <p class="desc type-caption">{$t.connectFirst}</p>
    {:else if $wp2Reading}
      <p class="desc type-caption">{$t.checkingWatch}</p>
    {:else if $wp2 === "stock"}
      <p class="desc type-caption">{$t.stockNoStub}</p>
    {:else if $wp2}
      <dl class="info">
        <div>
          <dt class="type-label">Stub</dt>
          <dd class="type-small type-mono">
            {$wp2.stub.version} · ABI 1.{$wp2.stub.abiMinor ?? "?"}
          </dd>
        </div>
        <div>
          <dt class="type-label">Loader</dt>
          <dd class="type-small type-mono">
            {$wp2.loader ? `${$wp2.loader.name} v${$wp2.loader.version}` : "—"}
          </dd>
        </div>
        {#each apps as [slot, app] (slot)}
          <div>
            <dt class="type-label">{$t.slot(slot)}</dt>
            <dd class="type-small type-mono">
              {app.name} v{app.version} · {app.crc.toString(16).padStart(8, "0")}
            </dd>
          </div>
        {/each}
      </dl>
    {/if}
  </div>

  <div class="section">
    <h2 class="title type-heading">{$t.localBuild}</h2>
    <p class="desc type-caption">{$t.localBuildDesc}</p>
    <div class="row">
      <Button kind="secondary" onClick={() => pickRequested()} disabled={busy}>
        <Icon name="folder_open" size={22} />
        {$build ? $t.anotherFile : $t.pickFile}
      </Button>
      {#if $build}
        <Button
          onClick={() => installRequested()}
          disabled={!$watch || busy || (firmware && !$riskAccepted)}
        >
          <Icon name={firmware ? "bolt" : "install_desktop"} size={22} />
          {$installed || $otaResult ? $t.installAgain : $t.install}
        </Button>
      {/if}
    </div>

    {#if $build}
      <p class="file">
        <strong>{$build.name}</strong> — {$build.what}
        <span class="desc type-caption"
          >{$t.fileMeta(($build.size / 1024).toFixed(1), time($build.modified))}</span
        >
      </p>
      {#if firmware}
        <div class="disclaimer" role="note">
          <Icon name="warning" size={20} />
          <span>{$t.firmwareRisk}</span>
        </div>
        <label class="accept">
          <Checkbox checked={$riskAccepted} onChange={(v) => riskAcceptedSet(v)} />
          <span>{$t.acceptRisk}</span>
        </label>
      {/if}
    {/if}

    {#if $installing || $flashing}
      <div class="progress">
        <div class="progress-row type-caption">
          <span>{$t.installingOnWatch}</span>
          <span class="pct type-mono">{pct}%</span>
        </div>
        <progress max="100" value={pct}></progress>
      </div>
    {/if}
    {#if $installed}
      <p class="ok"><Icon name="check_circle" size={20} /> {$t.isOnWatch($installed)}</p>
    {/if}
    {#if $otaResult === "done"}
      <p class="ok">
        <Icon name="check_circle" size={20} />
        {$t.sentRestarts}
      </p>
    {/if}
    {#if error}<p class="err">{error}</p>{/if}
  </div>
</AdaptivePopover>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    & + .section {
      margin-top: 1.25rem;
    }
  }
  .title {
    margin: 0;
  }
  p {
    margin: 0;
  }
  .desc {
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .file {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    overflow-wrap: anywhere;
  }
  .info {
    margin: 0;
    border: 1px solid oklch(from var(--color-text) l c h / 10%);
    border-radius: var(--border-radius);

    div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0.75rem;

      & + div {
        border-top: 1px solid oklch(from var(--color-text) l c h / 10%);
      }
    }
    dt {
      color: oklch(from var(--color-text) l c h / 55%);
    }
    dd {
      margin: 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .disclaimer {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
    border-radius: var(--border-radius);
    color: var(--color-error);
    background: oklch(from var(--color-error) l c h / 12%);

    :global(.icon) {
      flex: none;
    }
  }
  .accept {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
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
</style>
