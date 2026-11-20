<script lang="ts">
  // Account → Language: one row per UI language, each in its own words. Picking one applies it
  // at once and closes the dialog.
  import { Dialog } from "$lib/shared/components/dialog";
  import { Icon } from "$lib/shared/components/icon";
  import { i18nModel, LOCALES } from "$lib/shared/i18n";
  import { appearanceModel } from "../model";
  import { t } from "../i18n";

  const { $languageDialogOpen: open, languageDialogClosed } = appearanceModel;
  const { $locale: locale, localePicked } = i18nModel;
</script>

<Dialog open={$open} title={$t.language} onClose={() => languageDialogClosed()}>
  <div class="list" role="radiogroup" aria-label={$t.language}>
    {#each Object.entries(LOCALES) as [id, name] (id)}
      <button
        type="button"
        role="radio"
        aria-checked={id === $locale}
        class="row type-body"
        class:on={id === $locale}
        lang={id}
        onclick={() => {
          localePicked(id);
          languageDialogClosed();
        }}
      >
        {name}
        {#if id === $locale}<Icon name="check" size={20} />{/if}
      </button>
    {/each}
  </div>
</Dialog>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--control-height);
    padding: 0 0.75rem;
    border: none;
    border-radius: var(--border-radius);
    background: transparent;
    color: oklch(from var(--color-text) l c h / 70%);
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 6%);
      }
    }
    &.on {
      color: var(--color-text);
      background: oklch(from var(--color-text) l c h / 8%);
    }
    &:focus-visible {
      outline: 2px solid var(--color-accent);
    }
  }
</style>
