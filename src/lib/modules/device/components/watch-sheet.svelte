<script lang="ts">
  // The watch panel: connect, what the watch reports about itself, and what is installed on it.
  // The shell is adaptive — a drawer beside the rail on desktop, the swipeable sheet on the
  // phone — since it is the same panel either way.
  import type { Snippet } from "svelte";
  import { AdaptivePopover } from "$lib/shared/components/adaptive-popover";
  import { Notice } from "$lib/shared/components/notice";
  import { BLUEFY } from "../lib/notice";
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { bleModel, devModel } from "../model";
  import { dialLabel, dialPreview, dialTitle, flashedOn } from "../lib/catalog-names";
  import { capacityOf } from "../lib/ble";
  import WatchSelector from "./watch-selector.svelte";
  import DevSheet from "./dev-sheet.svelte";
  import { t } from "../i18n";

  interface Props {
    trigger: Snippet<[{ open: boolean; toggle: () => void; connected: boolean }]>;
  }
  const { trigger }: Props = $props();

  let open = $state(false);
  // The drawer light-dismisses on pointerdown; without this guard the click that follows
  // would toggle it straight back open, so a toggle right after a close means "close".
  let closedAt = 0;

  function toggle() {
    if (open) open = false;
    else if (Date.now() - closedAt > 250) open = true;
  }
  function onClose() {
    open = false;
    closedAt = Date.now();
  }

  const {
    $bleNotice: notice,
    $bleInfo: bleInfo,
    $dials: dials,
    $slots: slots,
    connectRequested,
    forgetRequested,
    dialRemoved,
    $connecting: connecting,
    $forgetting: forgetting,
    $log: log,
  } = bleModel;
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const copyLog = () =>
    navigator.clipboard
      .writeText([ua, `bluetooth: ${typeof navigator.bluetooth}`, ...$log].join("\n"))
      .catch(() => {});

  // one panel at a time: the watch panel steps aside for the Developer one
  function openDev() {
    onClose();
    devModel.panelOpened();
  }

  const muted = "oklch(from var(--color-text) l c h / 55%)";
</script>

<!-- a status that names Bluefy links it to the App Store: it's the fix the message suggests -->
{#snippet linked(text: string)}
  {@const at = text.indexOf("Bluefy")}
  {#if at < 0}{text}{:else}{text.slice(0, at)}<a
      class="bluefy"
      href={BLUEFY}
      target="_blank"
      rel="noopener noreferrer">Bluefy</a
    >{text.slice(at + 6)}{/if}
{/snippet}

{#snippet noticeDetail()}{@render linked($notice?.detail ?? "")}{/snippet}

{@render trigger({ open, toggle, connected: !!$bleInfo })}

<AdaptivePopover
  {open}
  title={$bleInfo ? ($bleInfo.name ?? "CMF Watch") : $t.connectYourWatch}
  {onClose}
>
  {#if !$bleInfo}
    <div class="section">
      <p class="desc type-small">{$t.overWebBluetooth}</p>
      <!-- the two things to do here, half the width each -->
      <div class="cta">
        <Button onClick={() => connectRequested()} disabled={$connecting}>
          <Icon name="bluetooth" size={22} />
          {$connecting ? $t.connecting : $t.connect}
        </Button>
        <span title={$t.forgetHint}>
          <Button kind="secondary" onClick={() => forgetRequested()} disabled={$forgetting}>
            <Icon name="ink_eraser" size={20} />
            {$forgetting ? $t.forgetting : $t.forgetDevice}
          </Button>
        </span>
      </div>
      {#if $notice}
        <Notice tone={$notice.tone} detail={$notice.detail ? noticeDetail : undefined}>
          {@render linked($notice.text)}
        </Notice>
      {/if}
      <!-- everything else about connecting, as one list: read first, start over, get the log -->
      <div class="list">
        <!-- the honest version of "is this safe?", said here rather than left to a launch thread -->
        <details class="before">
          <summary class="item type-body">
            <Icon name="info" size={20} />
            {$t.beforeYouConnect}
          </summary>
          <div class="notes type-small">
            <ul>
              <li>{$t.noteOneApp}</li>
              <li>{$t.noteInstaller}</li>
              <li>
                {$t.noteIphoneBefore}<a href={BLUEFY} target="_blank" rel="noopener noreferrer"
                  >Bluefy</a
                >{$t.noteIphoneAfter}
              </li>
              <li>{$t.noteNothingX}</li>
            </ul>
            <a href="/help" onclick={onClose}>{$t.readFullNotes}</a>
          </div>
        </details>
        {#if $log.length}
          <button type="button" class="item type-body" onclick={copyLog}>
            <Icon name="content_copy" size={20} />
            {$t.copyLog}
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="section">
      {#if $notice}
        <Notice tone={$notice.tone} detail={$notice.detail ? noticeDetail : undefined}>
          {$notice.text}
        </Notice>
      {/if}
      <!-- what the watch says about itself, as a small spec sheet: label left, value right -->
      <dl class="info">
        <div>
          <dt class="type-label">
            <Icon name="battery_full" size={16} color="var(--color-accent)" />
            {$t.battery}
          </dt>
          <dd class="type-small type-mono">{$bleInfo.battery ?? "?"}%</dd>
        </div>
        <div>
          <dt class="type-label"><Icon name="memory" size={16} color={muted} /> {$t.firmware}</dt>
          <dd class="type-small type-mono">{$bleInfo.firmware ?? "?"}</dd>
        </div>
        <div>
          <dt class="type-label"><Icon name="tag" size={16} color={muted} /> {$t.serial}</dt>
          <dd class="type-small type-mono">{$bleInfo.serial ?? "?"}</dd>
        </div>
      </dl>
      <div class="row">
        <Button kind="ghost" onClick={openDev}>
          <Icon name="code" size={20} />
          {$t.developer}
        </Button>
      </div>
    </div>

    {#if $dials}
      <div class="section">
        <h2 class="title type-heading">
          {$t.watchfacesOnWatch(
            $slots?.used ?? $dials.length,
            $slots?.capacity ?? capacityOf($bleInfo.name),
          )}
        </h2>
        <div class="badges">
          {#each $dials as id, i (id)}
            <WatchSelector
              name={dialLabel(id, i)}
              preview={dialPreview(id)}
              title={dialTitle(id)}
              onRemove={$bleInfo.serial && flashedOn($bleInfo.serial).includes(id)
                ? () => dialRemoved(id)
                : undefined}
            />
          {:else}
            <span class="none type-caption">{$t.reportedNone}</span>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
  <div class="list companion">
    <a class="item type-body" href="/companion" onclick={onClose}>
      <Icon name="smartphone" size={20} />
      {$t.companionApp}
      <Icon name="chevron_right" size={20} class="go" />
    </a>
  </div>
</AdaptivePopover>

<DevSheet />

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
  .desc {
    margin: 0;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }
  .cta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;

    > :global(*),
    > span > :global(*) {
      width: 100%;
      min-width: 0;
    }
  }
  /* a tile of rows split by dotted rules, like a settings list */
  .list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);

    > * + * {
      border-top: 2px dotted oklch(from var(--color-text) l c h / 14%);
    }
    &.companion {
      margin-top: 0.75rem;
    }
  }
  .item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    /* a row as tall as a button beside it: a cursor's size from md up, a thumb's on the phone */
    min-height: 2.5rem;
    padding: 0 0.875rem;

    @media (max-width: 767px) {
      gap: 0.75rem;
      min-height: 3.25rem;
      padding: 0 1rem;
    }
    border: none;
    background: none;
    color: var(--color-text);
    text-align: start;
    text-decoration: none;
    cursor: pointer;

    :global(.icon) {
      flex: none;
      color: oklch(from var(--color-text) l c h / 55%);
    }
    :global(.go) {
      margin-inline-start: auto;
    }
    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: oklch(from var(--color-text) l c h / 5%);
      }
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
  .bluefy {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  .notes {
    padding: 0 1rem 1rem;
    color: oklch(from var(--color-text) l c h / 65%);

    ul {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0 0 0.75rem;
      padding-left: 1.125rem;
    }
    a {
      color: var(--color-accent);
    }
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: oklch(from var(--color-text) l c h / 55%);
    }
    dd {
      margin: 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .badges {
    display: flex;
    gap: 0.75rem;
    /* six 64px dials never fit the sheet's width — scroll them sideways rather than wrap */
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }
  .none {
    color: oklch(from var(--color-text) l c h / 55%);
  }
</style>
