<script lang="ts">
  import { Skeleton } from "$lib/shared/components/skeleton";
  import { authModel } from "$lib/modules/auth/model";
  import type { RecordModel } from "pocketbase";
  import { marketModel } from "../../model";
  import { WatchfaceCard } from "../watchface-card";
  import { t } from "../../i18n";

  interface Props {
    items: RecordModel[];
    loading?: boolean;
    empty?: string;
    showAuthor?: boolean;
    manage?: boolean;
    onMore?: () => void;
  }

  const {
    items,
    loading = false,
    empty,
    showAuthor = true,
    manage = false,
    onMore,
  }: Props = $props();

  const { $user: user } = authModel;
  const {
    $likes: likes,
    likeToggleRequested,
    removeRequested,
    publishToggleRequested,
    editRequested,
  } = marketModel;

  const likeCount = (id: string) => $likes.filter((l) => l.watchface === id).length;
  const liked = (id: string) => $likes.some((l) => l.watchface === id && l.user === $user?.id);

  function remove(wf: RecordModel) {
    if (!confirm($t.confirmDelete(wf.name))) return;
    removeRequested(wf);
  }

  function sentinel(node: HTMLElement) {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) onMore?.();
    });

    io.observe(node);
    return { destroy: () => io.disconnect() };
  }
</script>

<div class="grid">
  {#if loading}
    {#each Array(8) as _, i (i)}
      <div class="skeleton-card">
        <div class="skeleton-dial"><Skeleton height="100%" /></div>
        <Skeleton height="1.35rem" width="70%" />
        <Skeleton height="1.25rem" width="45%" />
        <Skeleton height="2.25rem" width="55%" />
      </div>
    {/each}
  {:else}
    {#each items as wf (wf.id)}
      <WatchfaceCard
        {wf}
        {showAuthor}
        {manage}
        likeCount={likeCount(wf.id)}
        liked={liked(wf.id)}
        canLike={!!$user}
        canRemove={manage || $user?.id === wf.owner}
        onLike={() => $user && likeToggleRequested({ wf, userId: $user.id })}
        onRemove={() => remove(wf)}
        onEdit={() => editRequested(wf)}
        onPublishToggle={() => publishToggleRequested(wf)}
      />
    {:else}
      <p class="empty type-caption">{empty ?? $t.nothingHere}</p>
    {/each}
    {#if onMore}<div class="sentinel" use:sentinel></div>{/if}
  {/if}
</div>

<style>
  /* a phone fits two dials across (one below ~340px), a desktop as many as there is room for */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 1rem;
    padding: 1rem;

    @media (max-width: 767px) {
      grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
      gap: 0.5rem;
      padding: 0.75rem;
    }
  }
  /* the shape of a card: same tile, same rows, so nothing moves when the faces arrive */
  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);

    @media (max-width: 767px) {
      padding: 0.625rem;
    }
  }
  .skeleton-dial {
    margin-bottom: 0.375rem;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 50%;
  }
  .empty {
    grid-column: 1 / -1;
    padding: 4rem 0;
    text-align: center;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .sentinel {
    grid-column: 1 / -1;
    height: 1px;
  }
</style>
