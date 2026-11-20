<script lang="ts">
  // The Firmware shelf: OTA images — patches, custom builds, stock rollbacks. FMC flashes the
  // Watch Pro 2's; another watch's image is on the shelf for download, its card says whose.
  import { Text } from "$lib/shared/components/text";
  import { Badge } from "$lib/shared/components/badge";
  import { Icon } from "$lib/shared/components/icon";
  import { Page } from "$lib/shared/components/page";
  import { Skeleton } from "$lib/shared/components/skeleton";
  import { StoreTabs } from "$lib/shared/components/store-tabs";
  import { fileUrl } from "$lib/shared/api";
  import { deviceLabel } from "$lib/modules/market/lib/devices";
  import {
    firmwareKind,
    flashable,
    recordDevice,
    testedKey,
    testedOnHardware,
  } from "../lib/firmware";
  import { FLASH_LIMITS } from "../lib/links";
  import { storeModel } from "../model";
  import { t } from "../i18n";

  const {
    $firmwares: firmwares,
    $firmwaresLoading: loading,
    $storeErr: storeErr,
    $firmwaresOnWatch: onWatch,
    firmwaresRequested,
  } = storeModel;

  firmwaresRequested();
</script>

<svelte:head><title>{$t.firmwaresTitle}</title></svelte:head>

<Page>
  {#snippet header()}
    <div class="bar"><StoreTabs /></div>
  {/snippet}

  <div class="shelf">
    <!-- said once, above everything: this shelf is the one that can break a watch -->
    <a class="risk" href={FLASH_LIMITS} target="_blank" rel="noopener noreferrer">
      <Icon name="warning" size={24} />
      <span class="text">
        <span class="title type-subtitle">{$t.riskTitle}</span>
        <span class="desc type-small">
          {$t.riskDesc}
        </span>
      </span>
      <Icon name="open_in_new" size={20} class="go" />
    </a>

    {#if $storeErr}<Text as="p" variant="caption" tone="error">{$storeErr}</Text>{/if}

    <ul class="grid">
      {#if $loading && !$firmwares.length}
        {#each Array(3) as _, i (i)}
          <li class="card skeleton">
            <Skeleton height="9rem" />
            <Skeleton width="50%" height="1.25rem" />
            <Skeleton width="85%" height="0.875rem" />
          </li>
        {/each}
      {:else}
        {#each $firmwares as fw (fw.id)}
          {@const kind = firmwareKind(fw.kind)}
          {@const ota = flashable(fw.device)}
          {@const tested = testedKey(fw.tested)}
          <li>
            <a class="card" href="/firmware/{fw.id}">
              <div class="cover" class:bare={!fw.cover}>
                {#if fw.cover}
                  <img src={fileUrl(fw, "cover")} alt="" loading="lazy" />
                {:else}
                  <Icon name={kind.icon} size={48} />
                {/if}
              </div>
              <div class="body">
                <div class="title-row">
                  <h2 class="type-heading">{fw.name}</h2>
                  {#if fw.version}<span class="version type-caption type-mono">{fw.version}</span
                    >{/if}
                </div>
                {#if fw.summary}<p class="desc type-small">{fw.summary}</p>{/if}
                <div class="badges">
                  {#if !fw.published}<Badge warn>{$t.draft}</Badge>{/if}
                  {#if $onWatch[fw.id] === "update"}
                    <Badge>{$t.updateBadge}</Badge>
                  {:else if $onWatch[fw.id] === "installed"}
                    <Badge quiet>{$t.installed}</Badge>
                  {/if}
                  <Badge quiet={ota} warn={!ota}>{deviceLabel(recordDevice(fw.device))}</Badge>
                  <Badge quiet>{$t.kinds[kind.key].label}</Badge>
                  {#if tested}
                    <Badge quiet={testedOnHardware(fw.tested)} warn={!testedOnHardware(fw.tested)}>
                      <Icon name={testedOnHardware(fw.tested) ? "verified" : "warning"} size={14} />
                      {$t.tested[tested]}
                    </Badge>
                  {/if}
                </div>
              </div>
            </a>
          </li>
        {:else}
          <li class="empty">{$t.noFirmware}</li>
        {/each}
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
  .risk {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem;
    border-radius: var(--border-radius);
    background: oklch(from var(--color-error) l c h / 10%);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.15s ease;

    > :global(.icon:first-child) {
      flex: none;
      color: var(--color-error);
    }
    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-error) l c h / 15%);
      }
    }
    &:focus-visible {
      outline: 2px solid var(--color-error);
    }
    :global(.go) {
      flex: none;
      color: oklch(from var(--color-text) l c h / 45%);
    }
  }
  .text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  .desc {
    margin: 0;
    color: oklch(from var(--color-text) l c h / 60%);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .card {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);
    color: inherit;
    text-decoration: none;
  }
  a.card {
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
  /* no cover of its own: the kind's glyph on a dot grid, so the shelf still reads as a row
     of posters rather than a list of text */
  .cover {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;
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
  .body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.875rem;
  }
  .title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }
  h2 {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .version {
    flex: none;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: auto;
    padding-top: 0.5rem;
  }
  .skeleton {
    gap: 0.5rem;
    padding: 0.875rem;
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
    .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.75rem;
    }
  }
</style>
