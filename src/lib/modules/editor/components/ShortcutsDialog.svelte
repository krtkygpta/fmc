<script lang="ts">
  // The `?` overlay. Rendered straight off the keymap table, so a binding that exists is
  // documented and one that doesn't, isn't.
  import { Dialog } from "$lib/shared/components/dialog";
  import { formatKeys, isMac, shortcutGroups } from "../shared/shortcuts";
  import { t } from "../i18n";

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  const { open, onClose }: Props = $props();

  const mac = isMac();
  const groups = shortcutGroups();
  // the keymap table stays English; its words are looked up here, falling back to themselves
  const word = (table: Record<string, string>, en: string) => table[en] ?? en;
</script>

<Dialog {open} {onClose} title={$t.keyboardShortcuts}>
  <div class="groups">
    {#each groups as g (g.group)}
      <section>
        <h3 class="type-label">{word($t.shortcutGroups, g.group)}</h3>
        {#each g.items as s (s.keys)}
          <div class="row type-small">
            <span class="label">{word($t.shortcuts, s.label)}</span>
            <span class="keys">
              {#each formatKeys(s.keys, mac) as k (k)}<kbd class="type-caption">{k}</kbd>{/each}
            </span>
          </div>
        {/each}
      </section>
    {/each}
  </div>
</Dialog>

<style>
  .groups {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  h3 {
    margin: 0 0 0.375rem;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.25rem 0;
  }
  .label {
    color: oklch(from var(--color-text) l c h / 80%);
  }
  .keys {
    display: flex;
    flex: none;
    gap: 0.1875rem;
  }
  kbd {
    padding: 0.125rem 0.375rem;
    border: 1px solid oklch(from var(--color-text) l c h / 12%);
    border-radius: calc(var(--border-radius) / 2);
    background: oklch(from var(--color-text) l c h / 6%);
  }
</style>
