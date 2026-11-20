<script lang="ts">
  import { Avatar } from "$lib/shared/components/avatar";
  import { Badge } from "$lib/shared/components/badge";
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { Skeleton } from "$lib/shared/components/skeleton";
  import { downloadUrl, fileUrl } from "$lib/shared/api";
  import { authModel } from "$lib/modules/auth/model";
  import { bleModel } from "$lib/modules/device/model";
  import { marketModel } from "../model";
  import { faceTitle } from "$lib/shared/seo";
  import { LiveDial } from "../components/live-dial";
  import { BackBtn } from "$lib/shared/components/back-btn";
  import { Page } from "$lib/shared/components/page";
  import { Prose } from "$lib/shared/components/prose";
  import { WatchCase } from "$lib/shared/components/watch-case";
  import { StatStrip } from "$lib/shared/components/stat-strip";
  import { compact, day } from "$lib/shared/lib/format";
  import { deviceLabel } from "../lib/devices";
  import { t } from "../i18n";

  interface Props {
    id: string;
  }
  const { id }: Props = $props();

  const { $user: user } = authModel;
  const {
    $watchface: watchface,
    $watchfaceLoading: loading,
    $live: live,
    $dialScreen: dialScreen,
    $hasAod: hasAod,
    $installing: installing,
    $installed: installed,
    $likes: likes,
    watchfaceRequested,
    installRequested,
    likeToggleRequested,
    $likePending: likePending,
    editRequested,
    dialScreenSet,
  } = marketModel;
  const {
    $bleInfo: bleInfo,
    $bleStatus: bleStatus,
    $connecting: connecting,
    connectRequested,
  } = bleModel;

  $effect(() => {
    watchfaceRequested(id);
  });

  const wf = $derived($watchface);
  const device = $derived(deviceLabel(wf?.device));
  const owner = $derived(wf?.expand?.owner);
  const likeCount = $derived($likes.filter((l) => l.watchface === id).length);
  const liked = $derived($likes.some((l) => l.watchface === id && l.user === $user?.id));

  // ponytail: Web Share where it exists, clipboard everywhere else — no share-sheet dependency
  let copied = $state(false);

  async function share() {
    const url = location.href;

    if (navigator.share) {
      // a dismissed share sheet rejects — that's a cancel, not an error
      await navigator.share({ title: wf?.name, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    copied = true;
  }
</script>

<!-- matches the title scripts/seo.ts bakes into this page's HTML: Google indexes the rendered
     one, an unfurler only ever sees the baked one -->
<svelte:head><title>{faceTitle(wf?.name || $t.watchface)}</title></svelte:head>

<Page>
  <div class="detail">
    <!-- back on one side, the two things you do to a face you like on the other -->
    <div class="topbar">
      <BackBtn href="/" />
      {#if wf}
        <div class="quick">
          <button class="round type-small" title={$t.share} aria-label={$t.share} onclick={share}>
            <Icon name={copied ? "check" : "ios_share"} size={22} />
          </button>
          <button
            class="round like type-small"
            title={$user ? $t.like : $t.signInToLike}
            aria-label={$t.like}
            aria-pressed={liked}
            disabled={!$user || $likePending}
            onclick={() => $user && likeToggleRequested({ wf, userId: $user.id })}
          >
            <Icon
              name="favorite"
              size={22}
              color={liked ? "var(--color-error)" : undefined}
              fill={liked}
            />
            {compact(likeCount)}
          </button>
        </div>
      {/if}
    </div>

    {#if wf}
      <article class="face">
        <div class="dial">
          <WatchCase>
            {#if $live}
              <LiveDial face={$live} screen={$dialScreen} />
            {:else}
              <img class="still" src={fileUrl(wf, "preview")} alt={wf.name} />
            {/if}
          </WatchCase>
          {#if $hasAod}
            <button
              class="round toggle-aod type-small"
              class:on={$dialScreen === "aod"}
              title={$dialScreen === "aod" ? $t.showMain : $t.showAod}
              aria-label={$t.toggleAod}
              onclick={() => dialScreenSet($dialScreen === "aod" ? "main" : "aod")}
            >
              <!-- both glyphs stay in one cell and trade places, so nothing is added to the
                   flow mid-animation -->
              <span class="swap" class:aod={$dialScreen === "aod"}>
                <Icon name="dark_mode" size={22} />
                <Icon name="monitor" size={22} />
              </span>
            </button>
          {/if}
        </div>

        <div class="info">
          <header class="identity">
            <h1 class="name type-display">{wf.name}</h1>
            <div class="byline">
              {#if owner}
                <a class="author type-subtitle" href="/user/{wf.owner}" title={$t.byCreator}>
                  <Avatar name={owner.name || "?"} />
                  <span>{owner.name || $t.unknown}</span>
                </a>
              {/if}
              {#if wf.type}<Badge>{wf.type}</Badge>{/if}
              {#if device}<Badge quiet>{device}</Badge>{/if}
            </div>
          </header>

          <!-- one accent button: getting the face onto the watch. Everything else is quieter. -->
          <div class="actions">
            <div class="primary">
              {#if !$bleInfo}
                <Button size="large" onClick={() => connectRequested()} disabled={$connecting}>
                  <Icon name="bluetooth" size={22} />
                  {$connecting ? $t.connecting : $t.connectToInstall}
                </Button>
              {:else if $installed}
                <Button size="large" disabled>
                  <Icon name="check" size={22} />
                  {$t.installed}
                </Button>
                <Button
                  size="large"
                  kind="secondary"
                  onClick={() => installRequested(wf)}
                  disabled={$installing}
                >
                  {$t.installAgain}
                </Button>
              {:else}
                <Button size="large" onClick={() => installRequested(wf)} disabled={$installing}>
                  <Icon name="watch" size={22} />
                  {$installing ? $t.installing : $t.installWatchface}
                </Button>
              {/if}
            </div>
            <div class="secondary">
              <Button kind="secondary" onClick={() => editRequested(wf)}>
                <Icon name="edit" size={22} />
                <span>{$t.edit}</span>
              </Button>
              <Button kind="secondary" href={downloadUrl(wf)}>
                <Icon name="download" size={22} />
                <span>{$t.download}</span>
              </Button>
            </div>
          </div>

          <StatStrip
            items={[
              { label: $t.likes, value: compact(likeCount) },
              { label: $t.downloads, value: compact(wf.downloads) },
              { label: $t.flashed, value: compact(wf.flashes) },
            ]}
          />

          {#if wf.description}
            <Prose source={wf.description} ugc />
          {/if}

          <p class="dates type-caption">
            <Icon name="calendar_today" size={14} />
            {$t.publishedOn(day(wf.created))}
            {#if day(wf.updated) !== day(wf.created)}· {$t.updatedOn(day(wf.updated))}{/if}
          </p>
        </div>
      </article>
    {:else if $loading}
      <div class="face">
        <div class="dial"><div class="skeleton-dial"><Skeleton height="100%" /></div></div>
        <div class="info">
          <Skeleton height="2.25rem" width="60%" />
          <Skeleton height="1.25rem" width="40%" />
          <Skeleton height="3rem" />
          <Skeleton height="2.5rem" />
          <Skeleton height="4rem" />
        </div>
      </div>
    {:else}
      <p class="empty">{$t.notFound}</p>
    {/if}
  </div>
</Page>

<style>
  .detail {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 62rem;
    margin: 0 auto;
    padding: 1rem 1rem 2rem;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .quick {
    display: flex;
    gap: 0.5rem;
  }
  /* the page's small round controls: share, like, the always-on toggle */
  .round {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: var(--control-height);
    height: var(--control-height);
    padding: 0 0.75rem;
    border: none;
    border-radius: 10em;
    font: inherit;
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
    background: oklch(from var(--color-text) l c h / 8%);
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      transform var(--spring-transition);

    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: oklch(from var(--color-text) l c h / 14%);
      }
    }
    &:active:not(:disabled) {
      transform: scale(0.94);
    }
    &:disabled {
      cursor: default;
      color: oklch(from var(--color-text) l c h / 55%);
    }
  }
  .face {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  /* the box is the watch's case; the strap of the render hangs above and below it, which is
     what the block margin makes room for */
  .dial {
    position: relative;
    align-self: center;
    /* small enough on a phone that the name and Install stay above the fold */
    width: min(62%, 19rem);

    /* a percentage margin measures the containing block's width — here, the dial's own */
    > :global(.case) {
      margin-block: 24%;
    }
  }
  .still {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .skeleton-dial {
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 50%;
  }
  /* tucked into the square's free corner, off the dial itself — the bottom one, because the
     case's crown sits at the top right */
  .toggle-aod {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0;
    background-color: var(--color-text);
    color: var(--color-background);

    &.on {
      background-color: oklch(from var(--color-text) l c h / 8%);
      color: var(--color-text);
    }
    @media (hover: hover) {
      &:hover:not(:disabled) {
        background-color: oklch(from var(--color-text) l c h / 85%);
      }
      &.on:hover:not(:disabled) {
        background-color: oklch(from var(--color-text) l c h / 14%);
      }
    }
  }
  .swap {
    display: grid;

    > :global(.icon) {
      grid-area: 1 / 1;
      transition:
        opacity 0.2s ease,
        rotate 0.35s cubic-bezier(0.16, 1, 0.3, 1),
        scale 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    > :global(.icon:last-child),
    &.aod > :global(.icon:first-child) {
      opacity: 0;
      rotate: -90deg;
      scale: 0.6;
    }
    &.aod > :global(.icon:last-child) {
      opacity: 1;
      rotate: 0deg;
      scale: 1;
    }
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }
  .identity {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .name {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .byline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .author {
    --avatar-size: 1.5rem;

    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    margin-inline-end: 0.25rem;
    color: var(--color-text);
    text-decoration: none;

    span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    @media (hover: hover) {
      &:hover span {
        text-decoration: underline;
        text-decoration-color: var(--color-accent);
        text-underline-offset: 0.2em;
      }
    }
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .primary,
  .secondary {
    display: flex;
    gap: 0.5rem;

    > :global(*) {
      flex: 1;
      min-width: 0;
    }
    :global(span:not(.icon)) {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  /* side by side while both labels fit, stacked on a narrow phone rather than cut short */
  .secondary {
    flex-wrap: wrap;

    > :global(*) {
      flex: 1 1 10rem;
    }
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
  /* room for both: the dial stays in view on the left while the details scroll beside it */
  @media (min-width: 900px) {
    .detail {
      padding: 1.5rem 2rem 3rem;
    }
    .face {
      display: grid;
      grid-template-columns: minmax(0, 24rem) minmax(0, 30rem);
      justify-content: center;
      align-items: start;
      gap: 3.5rem;
    }
    .dial {
      position: sticky;
      top: 1rem;
      width: 100%;
    }
  }
</style>
