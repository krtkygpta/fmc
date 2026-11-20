<script lang="ts">
  // The Apps shelf: installable .wp2app packages for the Watch Pro 2.
  import { Text } from "$lib/shared/components/text";
  import { Badge } from "$lib/shared/components/badge";
  import { Icon } from "$lib/shared/components/icon";
  import { Page } from "$lib/shared/components/page";
  import { Skeleton } from "$lib/shared/components/skeleton";
  import { StoreTabs } from "$lib/shared/components/store-tabs";
  import { fileUrl } from "$lib/shared/api";
  import { compact } from "$lib/shared/lib/format";
  import { MAKE_AN_APP } from "../lib/links";
  import { storeModel } from "../model";
  import { t } from "../i18n";

  const {
    $apps: apps,
    $appsLoading: loading,
    $storeErr: storeErr,
    $appsOnWatch: onWatch,
    appsRequested,
  } = storeModel;

  appsRequested();
</script>

<svelte:head><title>{$t.appsTitle}</title></svelte:head>

<Page>
  {#snippet header()}
    <div class="bar"><StoreTabs /></div>
  {/snippet}

  <div class="shelf">
    <!-- an app does nothing on a watch without the loader, so that comes before the list -->
    <a class="loader-note" href="/firmware">
      <Icon name="memory" size={20} class="glyph" />
      <span class="text">
        <span class="title type-button-small">{$t.loaderNoteTitle}</span>
        <span class="desc type-small">{$t.loaderNoteDesc}</span>
      </span>
      <Icon name="chevron_right" size={20} class="go" />
    </a>

    {#if $storeErr}<Text as="p" variant="caption" tone="error">{$storeErr}</Text>{/if}

    <ul class="list">
      {#if $loading && !$apps.length}
        {#each Array(6) as _, i (i)}
          <li class="row skeleton">
            <Skeleton width="3.5rem" height="3.5rem" round />
            <div class="text">
              <Skeleton width="45%" height="1rem" />
              <Skeleton width="80%" height="0.75rem" />
            </div>
          </li>
        {/each}
      {:else}
        {#each $apps as app (app.id)}
          <li>
            <a class="row" href="/apps/{app.id}">
              {#if app.icon}
                <img class="app-icon" src={fileUrl(app, "icon")} alt="" loading="lazy" />
              {:else}
                <span class="app-icon letter type-title">{app.name.slice(0, 1).toUpperCase()}</span>
              {/if}
              <span class="text">
                <span class="title type-subtitle">{app.name}</span>
                {#if app.summary}<span class="desc type-small">{app.summary}</span>{/if}
                <span class="meta type-caption">
                  {#if app.version}<span>v{app.version}</span>{/if}
                  {#if $onWatch[app.id] === "update"}
                    <Badge>{$t.updateBadge}</Badge>
                  {:else if $onWatch[app.id] === "installed"}
                    <Badge quiet>{$t.installed}</Badge>
                  {/if}
                  <span class="count">
                    <Icon name="download" size={14} />
                    {compact(app.downloads)}
                  </span>
                </span>
              </span>
              <Icon name="chevron_right" size={24} class="go" />
            </a>
          </li>
        {:else}
          <li class="empty">{$t.noApps}</li>
        {/each}
        <!-- the shelf is the cmf-tech-community/apps repository: a merged PR there is an app
             here — so the way in is the shelf's own last card, an empty slot to fill -->
        <li>
          <a class="row make" href={MAKE_AN_APP} target="_blank" rel="noopener noreferrer">
            <span class="app-icon slot"><Icon name="add" size={28} /></span>
            <span class="text">
              <span class="title type-subtitle">{$t.makeApp}</span>
              <span class="desc type-small">
                {$t.makeAppDesc}
              </span>
            </span>
            <Icon name="open_in_new" size={22} class="go" />
          </a>
        </li>
      {/if}
    </ul>
  </div>
</Page>

<style>
  /* the same box the faces page gives its tabs, so switching sections doesn't move them */
  .bar {
    padding: 0.75rem 1rem;
  }
  .shelf {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem;
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);
    color: inherit;
    text-decoration: none;
  }
  /* a note about the shelf, not an item on it: no tile fill like the apps', a dotted outline
     and a bare red glyph, two short lines */
  .loader-note {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem 0.625rem 1rem;
    border-radius: var(--border-radius-tile);
    border: 2px dotted oklch(from var(--color-text) l c h / 18%);
    background: transparent;
    color: inherit;
    text-decoration: none;

    :global(.glyph) {
      flex: none;
      color: var(--color-accent);
    }
    .desc {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  a.row,
  .loader-note {
    height: 100%;
    transition:
      background-color 0.15s ease,
      transform var(--spring-transition);

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 9%);
      }
    }
    &:active {
      transform: scale(0.98);
    }
    &:focus-visible {
      outline: 2px solid var(--color-accent);
    }
  }
  .loader-note {
    height: auto;
  }
  /* the watch draws app icons as discs (see docs/app-icons.md in cmf-watch-sdk) — so do we */
  .app-icon {
    flex: none;
    width: 3.5rem;
    height: 3.5rem;
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
  .text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .desc {
    color: oklch(from var(--color-text) l c h / 60%);
  }
  .row .desc {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-top: 0.25rem;
    color: oklch(from var(--color-text) l c h / 50%);
  }
  .count {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
  }
  .row :global(.go),
  .loader-note :global(.go) {
    flex: none;
    color: oklch(from var(--color-text) l c h / 40%);
  }
  .skeleton .text {
    gap: 0.5rem;
  }
  .empty {
    grid-column: 1 / -1;
    padding: 4rem 0;
    text-align: center;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  @media (max-width: 767px) {
    .bar {
      padding: 0.5rem 0.75rem;
    }
    .shelf {
      gap: 0.75rem;
      padding: 0.75rem;
    }
    .list {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  /* the way in for authors: an empty slot at the end of the shelf, outlined instead of
     filled so it doesn't read as one more app */
  a.row.make {
    background: none;
    border: 2px dashed oklch(from var(--color-text) l c h / 16%);

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 4%);
      }
    }
  }
  .app-icon.slot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: oklch(from var(--color-text) l c h / 60%);
  }
</style>
