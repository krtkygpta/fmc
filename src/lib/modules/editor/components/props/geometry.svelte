<script lang="ts">
  import { Input } from "$lib/shared/components/input";
  import { Icon, type IconName } from "$lib/shared/components/icon";
  import { Tabs } from "$lib/shared/components/tabs";
  import { framesOf, isPlaced, type Frame, type Layer } from "../../core/document/doc";
  import { FULL_BLEED_R, type ArcSpec } from "../../core/render/arc";
  import { ringRadius } from "../../core/document/edits";
  import { CENTER } from "../../core/render/screen";
  import { editorModel } from "../../model";
  import type { AlignDir } from "../../model/edit.model";
  import { num, set } from "./patch";
  import { t } from "../../i18n-inspector";

  const { layer }: { layer: Layer } = $props();
  const {
    $doc: doc,
    $lockAspect: lockAspect,
    lockAspectToggled,
    resizeImageRequested,
    rotateImageRequested,
    ringResized,
    alignRequested,
  } = editorModel;

  const FLEX_ALIGN = $derived<[number, IconName, string][]>([
    [0, "align_horizontal_left", $t.packStart],
    [2, "align_horizontal_center", $t.centerChildren],
  ]);

  const alignH = $derived<[AlignDir, IconName, string][]>([
    ["left", "align_horizontal_left", $t.alignLeft],
    ["hcenter", "align_horizontal_center", $t.alignHCenter],
    ["right", "align_horizontal_right", $t.alignRight],
  ]);
  const alignV = $derived<[AlignDir, IconName, string][]>([
    ["top", "align_vertical_top", $t.alignTop],
    ["vcenter", "align_vertical_center", $t.alignVCenter],
    ["bottom", "align_vertical_bottom", $t.alignBottom],
  ]);

  const placed = $derived(isPlaced(layer) ? layer : null);
  const frame = $derived(layer.kind === "group" ? layer.frame : null);
  const hand = $derived(layer.kind === "hand" ? layer : null);
  const ring = $derived(layer.kind === "ring" ? layer : null);

  // A ring with art is sized by its bitmap, like any other widget (the w/h block below); one
  // without has no pixels at all — its size is the 0x5a spec, so the field asks the model for the
  // same factor a corner drag would, rather than rebuilding the ring here.
  const ringR = $derived(ring ? ringRadius(ring) : 0);
  const bareRing = $derived(ring && !ring.frames.length ? ring : null);

  const setSpec = (patch: Partial<ArcSpec>) =>
    ring && set(ring.id, { spec: { ...ring.spec, ...patch } } as Partial<Layer>);

  const setRingSize = (d: number) =>
    ring && ringResized({ layer: ring.id, kw: d / (2 * ringR), kh: d / (2 * ringR) });

  // size of the widget's first frame — the asset IS the widget's size, there's no draw-time
  // scale in the format, so resizing rescales the pixels (see assets.model)
  const first = $derived.by(() => {
    const ids = framesOf(layer);

    return ids.length ? ($doc?.images.get(ids[0]) ?? null) : null;
  });
  const resSize = $derived(first ? { w: first.w, h: first.h } : null);
  // absolute, the way the field reads — the model takes the change (see rotateImageRequested)
  const angle = $derived(first?.rotate ?? 0);

  function resize(w: number, h: number) {
    if (resSize) resizeImageRequested({ layer: layer.id, w, h });
  }

  const setFrame = (patch: Partial<Frame>) =>
    frame && set(layer.id, { frame: { ...frame, ...patch } } as Partial<Layer>);
</script>

{#if placed || frame}
  <div class="row">
    {#each [alignH, alignV] as group}
      <div class="btn-group">
        {#each group as [dir, iconName, title] (dir)}
          <button type="button" {title} class="icon-btn" onclick={() => alignRequested(dir)}>
            <Icon name={iconName} size={16} />
          </button>
        {/each}
      </div>
    {/each}
  </div>
{/if}
{#if placed && !frame}
  <div class="row">
    <Input
      label="x"
      type="number"
      value={String(placed.x)}
      onInput={(v) => set(layer.id, { x: num(v) } as Partial<Layer>)}
    />
    <Input
      label="y"
      type="number"
      value={String(placed.y)}
      onInput={(v) => set(layer.id, { y: num(v) } as Partial<Layer>)}
    />
    <!-- keeps x/y in the columns of w/h below, which end in the aspect lock -->
    {#if resSize}<span class="icon-pad"></span>{/if}
  </div>
{/if}
{#if resSize}
  <div class="row">
    <Input
      label="w"
      type="number"
      min={1}
      max={2047}
      value={String(resSize.w)}
      onChange={(v) =>
        resize(num(v), $lockAspect ? Math.round((num(v) * resSize.h) / resSize.w) : resSize.h)}
    />
    <Input
      label="h"
      type="number"
      min={1}
      max={2047}
      value={String(resSize.h)}
      onChange={(v) =>
        resize($lockAspect ? Math.round((num(v) * resSize.w) / resSize.h) : resSize.w, num(v))}
    />
    <button
      type="button"
      title={$lockAspect ? $t.aspectLocked : $t.aspectFree}
      class="icon-btn"
      class:on={$lockAspect}
      onclick={() => lockAspectToggled()}
    >
      <Icon name={$lockAspect ? "link" : "link_off"} size={16} />
    </button>
  </div>
  <div class="row">
    <!-- half a row: the field keeps the width of the x and w above it -->
    <span class="half">
      <Input
        label={$t.angle}
        unit="°"
        type="number"
        step={15}
        value={String(angle)}
        onChange={(v) => rotateImageRequested({ layer: layer.id, deg: num(v) - angle })}
      />
    </span>
    <span class="half"></span>
    <span class="icon-pad"></span>
  </div>
  <p class="type-caption hint-xs">{$t.bakedHint}</p>
{/if}
{#if ring}
  <div class="row">
    {#if bareRing}
      <Input
        label={$t.size}
        type="number"
        min={4}
        max={2 * (FULL_BLEED_R - 1)}
        value={String(ringR * 2)}
        onChange={(v) => setRingSize(num(v))}
      />
    {/if}
    <Input
      label={$t.stroke}
      type="number"
      min={1}
      value={String(ring.spec.width)}
      onInput={(v) => setSpec({ width: Math.max(1, num(v)) })}
    />
  </div>
  <div class="row">
    <Input
      label={$t.start}
      type="number"
      value={String(ring.spec.start)}
      onInput={(v) => setSpec({ start: num(v) })}
    />
    <Input
      label={$t.end}
      type="number"
      value={String(ring.spec.end)}
      onInput={(v) => setSpec({ end: num(v) })}
    />
  </div>
  <p class="type-caption hint-xs">{$t.sweepHint}</p>
{/if}
{#if frame}
  <div class="row">
    <Input
      label="x"
      type="number"
      value={String(frame.x)}
      onInput={(v) => setFrame({ x: num(v) })}
    />
    <Input
      label="y"
      type="number"
      value={String(frame.y)}
      onInput={(v) => setFrame({ y: num(v) })}
    />
  </div>
  <div class="row">
    <Input
      label="w"
      type="number"
      value={String(frame.w)}
      onInput={(v) => setFrame({ w: num(v) })}
    />
    <Input
      label="h"
      type="number"
      value={String(frame.h)}
      onInput={(v) => setFrame({ h: num(v) })}
    />
  </div>
  <div class="row">
    <span class="type-caption field-label w-md">{$t.align}</span>
    <!-- one choice of two, so the app's segmented control, chosen in ink like everywhere else -->
    <Tabs
      full
      items={FLEX_ALIGN.map(([main, icon, label]) => ({ value: String(main), icon, label }))}
      value={String(frame.main)}
      onChange={(v) => setFrame({ main: Number(v) })}
    />
  </div>
  <p class="type-caption hint-xs">{$t.groupAlignHint}</p>
{/if}
{#if hand}
  <div class="row">
    <Input
      label={$t.pivotX}
      type="number"
      value={String(hand.pivotX)}
      onInput={(v) => set(layer.id, { pivotX: num(v) } as Partial<Layer>)}
    />
    <Input
      label={$t.pivotY}
      type="number"
      value={String(hand.pivotY)}
      onInput={(v) => set(layer.id, { pivotY: num(v) } as Partial<Layer>)}
    />
  </div>
  <p class="type-caption hint-xs">{$t.centerHint(CENTER)}</p>
{/if}
