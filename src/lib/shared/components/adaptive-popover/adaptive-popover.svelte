<script lang="ts">
  import { common as t } from "$lib/shared/i18n";
  // The same panel in two shells: a drawer sliding out beside the left rail on desktop (the
  // Google Fonts filters pattern), the swipeable sheet on the phone. This component owns the
  // choice, so neither shell learns about the other — the sheet stays headless.
  import type { Snippet } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { Icon } from "$lib/shared/components/icon";
  import { Sheet } from "$lib/shared/components/sheet";

  interface Props {
    open?: boolean;
    title?: string;
    /** drawer width; the sheet is viewport-sized and ignores it */
    width?: string;
    onClose?: () => void;
    children?: Snippet;
  }
  const { open = false, title, width, onClose, children }: Props = $props();

  // the app-nav breakpoint: below it the app is phone-shaped and gets the sheet
  const desktop = new MediaQuery("(min-width: 768px)");

  // Crossing the breakpoint swaps the shell; teleporting an open panel into the other shell
  // mid-resize opens it with half-measured geometry, so just close it instead.
  let wasDesktop = desktop.current;

  $effect(() => {
    if (desktop.current === wasDesktop) return;
    wasDesktop = desktop.current;
    onClose?.();
  });

  let drawer = $state<HTMLElement>();
  const uid = $props.id();

  // The drawer isn't a <dialog>, so focus is managed here the way a popup layer does it: it moves
  // into the drawer as it opens, and back to whatever had it once the drawer closes — if it was
  // still inside (a click elsewhere took it already, and that's where it should stay).
  let opener: HTMLElement | null = null;

  $effect(() => {
    if (!desktop.current || !drawer) return;
    if (open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      drawer.focus({ preventScroll: true });
    } else if (drawer.contains(document.activeElement)) opener?.focus({ preventScroll: true });
  });
</script>

<svelte:window
  onpointerdown={(e) => {
    if (desktop.current && open && drawer && !drawer.contains(e.target as Node)) onClose?.();
  }}
  onkeydown={(e) => {
    // the topmost layer takes Escape: a menu in the drawer has already handled it
    // (defaultPrevented), a modal dialog opened from it closes on its own
    if (!desktop.current || !open || e.key !== "Escape" || e.defaultPrevented) return;
    if ((e.target as Element | null)?.closest?.("dialog[open]")) return;
    onClose?.();
  }}
/>

{#if desktop.current}
  <!-- the clip strip starts at the rail's edge: the drawer slides inside it, so it emerges
       from under the rail no matter where in the DOM (and whose stacking context) it lives -->
  <div class="clip" style:--drawer-width={width}>
    <div
      class="drawer"
      class:open
      bind:this={drawer}
      role="dialog"
      aria-modal="false"
      aria-labelledby={title ? `drawer-${uid}` : undefined}
      tabindex="-1"
    >
      <header>
        {#if title}<h2 class="type-heading" id="drawer-{uid}">{title}</h2>{/if}
        <button class="close" aria-label={$t.close} onclick={() => onClose?.()}>
          <Icon name="close" />
        </button>
      </header>
      {@render children?.()}
    </div>
  </div>
{:else}
  <Sheet {open} {onClose}>
    {#snippet header()}
      <header class="in-sheet">
        {#if title}<h2 class="type-heading">{title}</h2>{/if}
        <button class="close" aria-label={$t.close} onclick={() => onClose?.()}>
          <Icon name="close" />
        </button>
      </header>
    {/snippet}
    {@render children?.()}
  </Sheet>
{/if}

<style>
  .clip {
    position: fixed;
    inset-block: 0;
    inset-inline-start: var(--nav-rail-width);
    z-index: 40;
    width: min(var(--drawer-width, 24rem), calc(100vw - var(--nav-rail-width)));
    overflow: clip;
    pointer-events: none; /* an empty strip must not eat clicks while the drawer is away */
  }
  .drawer {
    height: 100%;
    width: 100%;
    padding: 1.25rem;
    padding-block-start: calc(1.25rem + var(--safe-area-top));
    overflow-y: auto;
    pointer-events: auto;
    background: var(--color-surface);
    outline: none; /* it takes focus on open; what's inside shows its own ring */
    border-inline-end: 1px solid oklch(from var(--color-text) l c h / 10%);
    box-shadow: 1rem 0 3rem oklch(0 0 0 / 15%);
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform 0.15s ease-in-out,
      visibility 0s 0.15s;

    &.open {
      transform: none;
      visibility: visible;
      transition: transform 0.15s ease-in-out;
    }
  }
  h2 {
    margin: 0;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  /* in the sheet's fixed head the button sits in the row, beside the title */
  .in-sheet {
    margin: 0;

    .close {
      position: static;
      flex: none;
    }
  }
  .close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    /* a small round × on a desktop; the phone's sheet keeps a thumb-sized one */
    height: 2rem;
    width: 2rem;

    & :global(.icon) {
      --icon-size: 1.25rem;
    }
    @media (max-width: 767px) {
      height: 2.75rem;
      width: 2.75rem;

      & :global(.icon) {
        --icon-size: 1.5rem;
      }
    }
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 10rem;
    padding: 0;
    background: transparent;
    color: oklch(from var(--color-text) l c h / 55%);
    cursor: pointer;
    background: oklch(from var(--color-text) l c h / 8%);

    &:hover {
      background: oklch(from var(--color-text) l c h / 14%);
    }
  }
</style>
