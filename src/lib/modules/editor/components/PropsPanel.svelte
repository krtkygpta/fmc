<script lang="ts">
  // Inspector for the selected node, in four sections: where it sits, how its pixels are
  // toned, what data it shows, and the bitmaps it draws. The shared field chrome lives here so the sections carry only
  // what is theirs.
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { PanelSection } from "$lib/shared/components/panel-section";
  import Geometry from "./props/geometry.svelte";
  import Adjust from "./props/adjust.svelte";
  import Source from "./props/source.svelte";
  import Frames from "./props/frames.svelte";
  import { editorModel } from "../model";
  import { t } from "../i18n-inspector";
  const { $doc: doc, $selected: selected, invertColorsRequested } = editorModel;

  // the primary selection — the sections are all single-layer
  const layer = $derived($selected[0] ?? null);
</script>

<div class="panel type-small" data-dense>
  {#if layer}
    <fieldset class="fields" disabled={Boolean(layer.locked)}>
      {#if layer.locked}
        <p class="type-caption hint-xs">{$t.locked}</p>
      {/if}
      <!-- a section with nothing to show for this kind of layer hides itself, title and all -->
      <PanelSection title={$t.layout}><Geometry {layer} /></PanelSection>
      <PanelSection title={$t.color}><Adjust {layer} /></PanelSection>
      <PanelSection title={$t.data}><Source {layer} /></PanelSection>
      <PanelSection title={$t.art}><Frames {layer} /></PanelSection>
    </fieldset>
  {:else}
    <p class="hint type-small">{$t.nothingSelected}</p>
  {/if}
  {#if $doc}
    <div class="row">
      <Button size="small" kind="secondary" onClick={() => invertColorsRequested()}>
        <Icon name="contrast" size={18} />
        {layer ? $t.invertLayer : $t.invertScreen}
      </Button>
    </div>
  {/if}
</div>

<style>
  .fields {
    display: contents;
    border: none;
    margin: 0;
    padding: 0;
  }
  .panel {
    /* a dense surface: every field in here is shorter than the app's default */
    --control-height: 1.875rem;

    display: flex;
    flex-direction: column;
  }
  .panel > .row {
    padding-top: 0.875rem;
    border-top: 1px solid oklch(from var(--color-text) l c h / 10%);
  }
  .hint {
    margin: 0;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .panel :global {
    /* actions inside a dense panel are the size of its fields, not of a page's buttons */
    .btn {
      height: var(--control-height);
      padding-inline: 0.75rem;
      border-radius: var(--border-radius);
    }
    /* a label, its field(s) and their note, closer to each other than to the next field */
    .group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .field-label {
      flex-shrink: 0;

      &.w-sm {
        width: 2rem;
      }
      &.w-md {
        width: 3.5rem;
      }
    }
    .muted-label {
      display: block;
      color: oklch(from var(--color-text) l c h / 55%);
    }
    /* a note belongs to the field above it: it sits tight under that one, whatever gap the
       column it is in keeps between fields */
    .hint-xs {
      margin: 0;
      color: oklch(from var(--color-text) l c h / 50%);
      text-wrap: pretty;
    }
    .body > .hint-xs {
      margin-top: -0.375rem;
    }
    .group > .hint-xs {
      margin-top: -0.125rem;
    }
    /* an action under a label is as wide as its words, like the ones that sit in a row */
    .group > .btn {
      align-self: flex-start;
    }
    /* the empty third column of a row that sits over one ending in an icon button */
    .icon-pad {
      width: var(--control-height);
      flex-shrink: 0;
    }
    .w-num {
      display: inline-block;
      width: 4rem;
      flex-shrink: 0;
    }
    /* a connected group, after Material 3 Expressive: no track, a hairline gap, the group's
       outer corners round and the ones between buttons tight — and the button under the finger
       rounds all the way, on the spring */
    .btn-group {
      --round: calc(var(--control-height) / 2);
      --tight: 0.375rem;

      display: flex;
      flex: 1;
      gap: 0.125rem;

      .icon-btn {
        flex: 1;
        width: auto;
        min-width: 0;
        border-radius: var(--tight);

        &:first-child {
          border-start-start-radius: var(--round);
          border-end-start-radius: var(--round);
        }
        &:last-child {
          border-start-end-radius: var(--round);
          border-end-end-radius: var(--round);
        }
        &:active:not(.on) {
          border-radius: var(--round);
        }
      }
    }
    .grow {
      flex: 1;
    }
    .half {
      flex: 1 1 0;
      min-width: 0;
    }
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      /* as tall as the fields it sits beside */
      width: var(--control-height);
      min-width: var(--control-height);
      height: var(--control-height);
      border: none;
      /* round at rest; squares off while pressed and while on — the shape says the state */
      border-radius: 1rem;
      background: oklch(from var(--color-text) l c h / 10%);
      color: var(--color-text);
      cursor: pointer;
      transition:
        border-radius var(--spring-transition),
        background-color 0.15s ease,
        color 0.15s ease;

      /* a press squares it only a little; switching on squares it all the way, on the spring,
         so the morph is the change of state you see, not something over by the release */
      &:active:not(.on) {
        border-radius: 0.75rem;
      }

      @media (hover: hover) {
        /* a step up from rest, not down: under the cursor it comes forward */
        &:hover {
          background: oklch(from var(--color-text) l c h / 16%);
        }
      }
      /* on is the squared shape and a step more tint, not an ink fill: a lock that is on by
         default must not be the loudest thing in the panel */
      &.on {
        background-color: oklch(from var(--color-text) l c h / 18%);
        border-radius: 0.375rem;
      }
    }
    .check-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      /* a row of its own is as tall as a field, so a column of mixed rows keeps one rhythm */
      min-height: var(--control-height);
    }
    .check-label {
      border: none;
      background: transparent;
      padding: 0;
      margin: 0;
      font: inherit;
      color: inherit;
      text-align: start;
      cursor: pointer;
    }
  }
</style>
