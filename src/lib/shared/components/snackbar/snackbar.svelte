<script lang="ts">
  import { common as t } from "$lib/shared/i18n";
  // A message about something that just happened, floating over the page rather than pushing
  // it down: it rises from the bottom (above the phone's dock), leaves on its own after
  // `timeout`, and can be sent away early — the ×, or a swipe sideways like a notification.
  // A press holds it: the timer doesn't run out under a finger that's about to swipe.
  // The owner holds the message in a store and clears it in `onDismiss`.
  import { fade, fly } from "svelte/transition";
  import { Icon } from "../icon";

  interface Props {
    message: string;
    tone?: "info" | "error";
    timeout?: number;
    onDismiss: () => void;
  }
  const { message, tone = "error", timeout = 6000, onDismiss }: Props = $props();

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SWIPE = 80; // px sideways that send it away

  let dx = $state(0);
  let held = $state(false);
  let from = 0;
  let pointer: number | null = null;

  // a new message restarts the clock; a press stops it
  $effect(() => {
    if (!message || held) return;
    const t = setTimeout(onDismiss, timeout);

    return () => clearTimeout(t);
  });

  function down(e: PointerEvent) {
    if (pointer !== null || (e.target as Element).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointer = e.pointerId;
    from = e.clientX;
    held = true;
  }
  function move(e: PointerEvent) {
    if (e.pointerId === pointer) dx = e.clientX - from;
  }
  function up(e: PointerEvent) {
    if (e.pointerId !== pointer) return;
    pointer = null;
    held = false;
    if (Math.abs(dx) > SWIPE) onDismiss();
    else dx = 0;
  }
</script>

{#if message}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="snackbar type-small tone-{tone}"
    class:held
    role={tone === "error" ? "alert" : "status"}
    style:translate="{dx}px 0"
    style:opacity={1 - Math.min(Math.abs(dx) / (SWIPE * 2.5), 0.6)}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    in:fly={{ y: 24, duration: reduced ? 0 : 280 }}
    out:fade={{ duration: reduced ? 0 : 160 }}
  >
    <Icon name={tone === "error" ? "error" : "info"} size={20} />
    <span class="message">{message}</span>
    <button class="close" aria-label={$t.dismiss} onclick={onDismiss}>
      <Icon name="close" size={18} />
    </button>
  </div>
{/if}

<style>
  .snackbar {
    position: fixed;
    z-index: 60;
    inset-inline: 0;
    /* fixed, so against the visible viewport: without the part of the page that lies under
       Safari's toolbar, which --dock-space counts in */
    bottom: calc(var(--dock-space) - var(--under-bar) + 0.75rem);
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: fit-content;
    max-width: min(30rem, calc(100vw - 2rem));
    margin-inline: auto;
    padding: 0.5rem 0.5rem 0.5rem 0.875rem;
    border-radius: var(--border-radius-tile);
    border: 1px solid oklch(from var(--color-text) l c h / 14%);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: 0 16px 48px oklch(0 0 0 / 45%);
    /* the finger swipes it sideways; up and down still scroll the page under it */
    touch-action: pan-y;
    user-select: none;
    cursor: grab;
    /* springs back when a swipe falls short; follows the finger exactly while held */
    transition:
      translate var(--spring-transition),
      opacity 0.2s ease;

    &.held {
      transition: none;
      cursor: grabbing;
    }
    > :global(.icon) {
      flex: none;
    }
    &.tone-error > :global(.icon) {
      color: var(--color-error);
    }
    &.tone-info > :global(.icon) {
      color: oklch(from var(--color-text) l c h / 55%);
    }
  }
  .message {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .close {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: oklch(from var(--color-text) l c h / 55%);
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 8%);
        color: var(--color-text);
      }
    }
  }
  /* the md+ rail sits beside the page, nothing floats at the bottom */
  @media (min-width: 768px) {
    .snackbar {
      bottom: 1.5rem;
    }
  }
</style>
