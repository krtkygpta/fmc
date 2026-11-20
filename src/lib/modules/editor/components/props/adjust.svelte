<script lang="ts">
  // Non-destructive canvas filters on the widget's frames — see adjustImageFx.
  import { Slider } from "$lib/shared/components/slider";
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { framesOf, type Layer } from "../../core/document/doc";
  import { editorModel } from "../../model";
  import { t } from "../../i18n-inspector";

  const { layer }: { layer: Layer } = $props();
  const { $doc: doc, adjustImageRequested } = editorModel;

  // the first frame speaks for the widget: the filter is applied to all of them together
  const first = $derived.by(() => {
    const ids = framesOf(layer);

    return ids.length ? ($doc?.images.get(ids[0]) ?? null) : null;
  });

  const HUE_TRACK = "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"; // the hue wheel
  const ADJUST = [
    { key: "brightness", label: "bright", max: 200, unit: "%" },
    { key: "contrast", label: "contrast", max: 200, unit: "%" },
    { key: "saturate", label: "saturate", max: 300, unit: "%" },
    { key: "hue", label: "hue", max: 360, unit: "°", track: HUE_TRACK },
  ] as const; // label = a key of the inspector dictionary
  const NEUTRAL = { brightness: 100, contrast: 100, saturate: 100, hue: 0 };
  const adjust = $derived(first?.adjust ?? NEUTRAL);
  const changed = $derived(ADJUST.some((a) => adjust[a.key] !== NEUTRAL[a.key]));

  const apply = (next: typeof NEUTRAL) => adjustImageRequested({ layer: layer.id, adjust: next });
</script>

{#if first}
  {#each ADJUST as a (a.key)}
    <div class="row">
      <span class="type-caption field-label w-md">{$t[a.label]}</span>
      <Slider
        max={a.max}
        step={5}
        unit={a.unit}
        track={"track" in a ? a.track : undefined}
        value={adjust[a.key]}
        onInput={(v) => apply({ ...adjust, [a.key]: v })}
      />
    </div>
  {/each}
  {#if changed}
    <div class="row">
      <Button size="small" kind="secondary" onClick={() => apply(NEUTRAL)}>
        <Icon name="restart_alt" size={18} />
        {$t.reset}
      </Button>
    </div>
  {/if}
{/if}
