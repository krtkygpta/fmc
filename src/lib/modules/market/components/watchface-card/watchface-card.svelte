<script lang="ts">
  import { Badge } from "$lib/shared/components/badge";
  import { Icon } from "$lib/shared/components/icon";
  import { Menu, MenuItem } from "$lib/shared/components/menu";
  import { fileUrl, downloadUrl } from "$lib/shared/api";
  import type { RecordModel } from "pocketbase";
  import { Avatar } from "$lib/shared/components/avatar";
  import { compact } from "$lib/shared/lib/format";
  import { deviceLabel } from "../../lib/devices";

  interface Props {
    wf: RecordModel;
    likeCount?: number;
    liked?: boolean;
    canLike?: boolean;
    canRemove?: boolean;
    showAuthor?: boolean;
    manage?: boolean;
    onLike?: () => void;
    onRemove?: () => void;
    onEdit?: () => void;
    onPublishToggle?: () => void;
  }

  let {
    wf,
    likeCount = 0,
    liked = false,
    canLike = false,
    canRemove = false,
    showAuthor = true,
    manage = false,
    onLike,
    onRemove,
    onEdit,
    onPublishToggle,
  }: Props = $props();

  const stop = (fn?: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  const authorName = $derived(wf.expand?.owner?.name || "—");

  const avatar = $derived(wf.expand?.owner ? fileUrl(wf.expand?.owner, "avatar") : undefined);

  // "" for a face that doesn't claim a device — most of the marketplace predates the field
  const device = $derived(deviceLabel(wf.device));

  const href = $derived(`/market/${wf.id}`);
</script>

<!-- The dial first, then what it is: a card is a picture of a watch with a caption, so two of
     them fit side by side on a phone. The whole card opens the face (.open-link is stretched
     under everything); the author, the like and the menu sit above it. -->
<article class="card">
  <a class="open-link" {href} aria-label="Open {wf.name}"></a>
  <div class="preview">
    <img src={fileUrl(wf, "preview")} alt={wf.name} loading="lazy" />
    <!-- your own face's state (or anyone's face's type) sits on its dial, in the empty corner the disc leaves, so the
         caption row below stays one line on every card -->
    {#if manage}
      <span class="status"><Badge>{wf.published ? "Published" : "Draft"}</Badge></span>
    {:else if wf.type}
      <span class="status"><Badge>{wf.type}</Badge></span>
    {/if}
  </div>
  <h3 title={wf.name} class="name type-subtitle">{wf.name}</h3>
  {#if wf.owner && showAuthor}
    <a class="author type-small" href="/user/{wf.owner}" onclick={(e) => e.stopPropagation()}>
      <Avatar name={authorName} src={avatar} />
      <span>{authorName}</span>
    </a>
  {/if}
  <div class="footer">
    <div class="stats">
      <span class="stat type-caption" title="Downloads">
        <Icon name="download" size={18} />
        {compact(wf.downloads)}
      </span>
      <button
        class="stat like type-caption"
        title="Like"
        aria-label="Like"
        aria-pressed={liked}
        disabled={!canLike}
        onclick={stop(onLike)}
      >
        <Icon
          name="favorite"
          size={18}
          color={liked ? "var(--color-error)" : undefined}
          fill={liked}
        />
        {compact(likeCount)}
      </button>
    </div>
    {#if device}
      <span class="device type-label">{device.replace(/^Watch /, "")}</span>
    {/if}

    {#if manage || canRemove}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <span class="menu-slot" onclick={(e) => e.stopPropagation()}>
        <Menu>
          {#snippet trigger({ toggle })}
            <button class="action-btn" title="More" aria-label="More" onclick={toggle}>
              <Icon name="more_horiz" size={22} />
            </button>
          {/snippet}
          <MenuItem href={downloadUrl(wf)}>
            <Icon name="download" size={16} />
            Download .bin
          </MenuItem>
          {#if manage}
            <MenuItem onClick={onEdit}>
              <Icon name="edit" size={16} />
              Edit
            </MenuItem>
            <MenuItem onClick={onPublishToggle}>
              <Icon name={wf.published ? "public_off" : "public"} size={16} />
              {wf.published ? "Unpublish" : "Publish"}
            </MenuItem>
          {/if}
          {#if canRemove}
            <MenuItem danger onClick={onRemove}>
              <Icon name="delete" size={16} />
              Delete
            </MenuItem>
          {/if}
        </Menu>
      </span>
    {/if}
  </div>
</article>

<style>
  .card {
    --pad: 0.75rem;

    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    height: 100%;
    padding: var(--pad);
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);
    transition: background-color 0.15s ease;

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 10%);
      }
    }
  }
  .open-link {
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: var(--border-radius-tile);
    touch-action: manipulation;

    &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }
  .author,
  .footer {
    position: relative;
    z-index: 2;
  }
  /* the caption row is see-through to the card link, except for its own controls */
  .footer {
    pointer-events: none;

    .like,
    .menu-slot {
      pointer-events: auto;
    }
  }
  .preview {
    position: relative;
    margin-bottom: 0.375rem;

    .status {
      position: absolute;
      top: 0;
      left: 0;

      /* over the dial's edge, so it carries the card's own ground instead of a see-through pill */
      :global(.badge) {
        background: var(--color-background);
      }
    }

    img {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      background: oklch(0 0 0);
      border-radius: 50%;
    }
  }
  .name {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .author {
    --avatar-size: 1.375rem;

    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 0.375rem;
    max-width: 100%;
    text-decoration: none;
    color: oklch(from var(--color-text) l c h / 55%);

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (hover: hover) {
      &:hover {
        color: var(--color-text);
      }
    }
  }
  /* one line on every card: the numbers, then which watch (a mono word, not a badge — it is
     on every card), then the menu. Draft/Published lives on the dial (.status), not here */
  .footer {
    display: flex;
    align-items: center;
    gap: 0.25rem 0.375rem;
    margin-top: auto;
    padding-top: 0.25rem;
    /* the row is 2rem whether or not it holds the "more" button, so own and foreign cards in
       one grid row come out the same height */
    min-height: 2.25rem;
  }
  .stats {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-inline-end: auto;
  }
  .stat {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-variant-numeric: tabular-nums;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .like {
    /* a finger-sized target around a small glyph */
    min-height: 2rem;
    cursor: pointer;

    &:disabled {
      cursor: default;
    }
  }
  .device {
    color: oklch(from var(--color-text) l c h / 45%);
    white-space: nowrap;
  }
  .menu-slot {
    display: inline-flex;
  }
  .action-btn {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    color: inherit;
    background: oklch(from var(--color-text) l c h / 8%);
    cursor: pointer;
    transition: background-color 0.15s ease;

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 14%);
      }
    }
  }
  :global(.open) .action-btn {
    background: oklch(from var(--color-text) l c h / 14%);
  }

  @media (max-width: 767px) {
    .card {
      --pad: 0.625rem;
    }
    .author {
      --avatar-size: 1.125rem;
    }
  }
</style>
