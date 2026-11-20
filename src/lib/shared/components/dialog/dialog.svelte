<script lang="ts">
  import { common as t } from "$lib/shared/i18n";
  // One overlay in two shells, like adaptive-popover/: a centred modal where there is room for
  // one, the swipeable sheet on a phone — so everything that opens over a phone screen opens
  // the same way, from the bottom, under the thumb.
  import type { Snippet } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { Icon } from "$lib/shared/components/icon";
  import { Sheet } from "$lib/shared/components/sheet";

  interface Props {
    open?: boolean;
    title?: string;
    onClose?: () => void;
    /** the dialog's answers: one row of equal-width buttons at the bottom, Cancel first and the
     *  main action last (under the thumb on a phone, at the right on a desktop) */
    actions?: Snippet;
    children?: Snippet;
  }
  const { open = false, title, onClose, actions, children }: Props = $props();

  // the app-nav breakpoint: below it the app is phone-shaped
  const desktop = new MediaQuery("(min-width: 768px)");

  let el = $state<HTMLDialogElement>();
  const uid = $props.id();
  // a backdrop click closes, a drag that only ends on the backdrop (selecting text in a field,
  // say) doesn't — the press has to start there too, as UI SDK's dismissable layers do
  let pressedBackdrop = false;

  $effect(() => {
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  });
</script>

{#snippet head(close: () => void)}
  <header>
    {#if title}<h2 class="type-heading" id="dialog-{uid}">{title}</h2>{/if}
    <button class="close" aria-label={$t.close} onclick={close}>
      <Icon name="close" />
    </button>
  </header>
{/snippet}

{#if desktop.current}
  <!-- autofocus on the dialog itself, like sheet/: otherwise showModal() focuses the first
       focusable child, which is the close button -->
  <!-- svelte-ignore a11y_autofocus -->
  <dialog
    bind:this={el}
    autofocus
    aria-labelledby={title ? `dialog-${uid}` : undefined}
    onclose={() => onClose?.()}
    onpointerdown={(e) => (pressedBackdrop = e.target === el)}
    onclick={(e) => {
      if (e.target === el && pressedBackdrop) el.close();
    }}
  >
    {@render head(() => el?.close())}
    <div class="body">
      {@render children?.()}
      {#if actions}<div class="actions">{@render actions()}</div>{/if}
    </div>
  </dialog>
{:else}
  <Sheet {open} {onClose}>
    {#snippet header()}
      <div class="in-sheet">{@render head(() => onClose?.())}</div>
    {/snippet}
    {@render children?.()}
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </Sheet>
{/if}

<style>
  dialog {
    border: 1px solid oklch(from var(--color-text) l c h / 12%);
    outline: none;
    padding: 0;
    color: var(--color-text);
    background: var(--color-surface);
    border-radius: var(--border-radius-tile);
    width: min(30rem, calc(100vw - 2rem));
    opacity: 0;
    transform: translateY(0.75rem) scale(0.98);
    transition:
      opacity 0.2s ease,
      transform var(--spring-transition),
      display 0.25s allow-discrete,
      overlay 0.25s allow-discrete;

    &[open] {
      opacity: 1;
      transform: none;

      @starting-style {
        opacity: 0;
        transform: translateY(0.75rem) scale(0.98);
      }
    }
    &::backdrop {
      background: oklch(0 0 0 / 40%);
    }
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem 0;
    h2 {
      margin: 0;
    }
  }
  .close {
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
    color: oklch(from var(--color-text) l c h / 55%);
    cursor: pointer;
    background: oklch(from var(--color-text) l c h / 8%);

    &:hover {
      background: oklch(from var(--color-text) l c h / 14%);
    }
  }
  .body {
    padding: 1rem;
  }
  .actions {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    gap: 0.5rem;
    margin-top: 1.25rem;

    > :global(*) {
      width: 100%;
    }
  }
  /* the sheet pads its own head */
  .in-sheet header {
    padding: 0;
  }
</style>
