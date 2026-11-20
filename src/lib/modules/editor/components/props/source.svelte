<script lang="ts">
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { Input } from "$lib/shared/components/input";
  import { Select } from "$lib/shared/components/select";
  import { Switch } from "$lib/shared/components/switch";
  import {
    framesOf,
    isAccent,
    isPlaced,
    type CondOp,
    type Condition,
    type Layer,
  } from "../../core/document/doc";
  import {
    aliasIsGuess,
    aliasOf,
    collectSlotsDoc,
    frameLabelsOf,
    ID_LABELS,
    SOURCE_IDS,
  } from "../../core/document/sources";
  import type { ArcSpec } from "../../core/render/arc";
  import { slotBindingOf } from "../../core/document/edits";
  import { SLOT_METRIC_CHOICES } from "../../core/document/factory";
  import { editorModel } from "../../model";
  import { num, set } from "./patch";
  import FrameThumb from "./frame-thumb.svelte";
  import { t, conditionLines, sourceName, sourcePick } from "../../i18n-inspector";

  const { layer }: { layer: Layer } = $props();
  const {
    $doc: doc,
    $cache: cache,
    $screen: screen,
    conditionAdded,
    sourceIdSet,
    slotBindSet,
    slotMetricAdded,
    slotMetricRemoved,
  } = editorModel;

  // A fresh layer object arrives on every edit, so these are plain deriveds.
  const placed = $derived(isPlaced(layer) ? layer : null);
  const meta = $derived(placed?.meta ?? null);
  const images = $derived(framesOf(layer));
  const num_ = $derived(layer.kind === "number" ? layer : null);
  const slot = $derived(layer.kind === "slot" ? layer : null);
  // what this slot could still offer — the corpus's full menu minus what it already has
  const addable = $derived(
    slot ? SLOT_METRIC_CHOICES.filter((m) => !slot.metrics.includes(m)) : [],
  );
  const ring = $derived(layer.kind === "ring" ? layer : null);
  const conditions = $derived(layer.conditions);
  const bindLines = $derived(conditionLines($t, conditions));
  const frameLabels = $derived(frameLabelsOf(layer));

  const setSourceId = (source: number) => sourceIdSet({ id: layer.id, source });
  // an alias says, in the open list, which id it duplicates (#39); the trigger keeps the short name
  const sourceOption = (id: number) => {
    const of = aliasOf(id);
    const name = sourcePick($t, id);

    return {
      value: String(id),
      label: of == null ? name : `${name} — ${$t.sameAs(of.toString(16), aliasIsGuess(id))}`,
      short: name,
    };
  };
  const sourceOptions = $derived(
    SOURCE_IDS.map(sourceOption).concat(
      meta && !ID_LABELS[meta.source] ? [sourceOption(meta.source)] : [],
    ),
  );
  // a condition on an id the list lacks gets its own row — but only once: meta.source may
  // already have added it, and a repeated value breaks Select's keyed each
  const conditionOptions = (id: number) =>
    sourceOptions.some((o) => o.value === String(id))
      ? sourceOptions
      : sourceOptions.concat(sourceOption(id));
  const sourceAlias = $derived(meta ? aliasOf(meta.source) : null);

  // meta.flags === 4 marks this widget's assets accent-tintable on the real device — see
  // docs/cmf-protocol.md "Accent color". Every non-transparent pixel gets swapped, regardless of
  // its baked color, so this works on any art. Byte 4 is not a red channel here but which accent
  // the watch hands over: 206 accent widgets across the corpus, and not one of them leaves it at
  // 0 — so turning the flag on has to pick a slot too, or the widget is flagged for a color that
  // doesn't exist (#37).
  const setAccent = (on: boolean) =>
    meta &&
    set(layer.id, {
      meta: {
        ...meta,
        flags: on ? 4 : 0,
        rgb: on ? [meta.rgb[0] || 1, 0, 0] : meta.rgb,
      },
    } as Partial<Layer>);

  const setSpec = (patch: Partial<ArcSpec>) =>
    ring && set(ring.id, { spec: { ...ring.spec, ...patch } } as Partial<Layer>);

  const setFmt = (digits: number, padZero: boolean) =>
    set(layer.id, { digits: digits & 0x1f, padZero } as Partial<Layer>);

  const SECOND_IDS = [0x0f, 0x12, 0x72];
  const isSmooth = $derived(meta?.source === 0x0f || meta?.source === 0x12);
  const isSecondHand = $derived(
    layer.kind === "hand" && meta != null && SECOND_IDS.includes(meta.source),
  );
  const isBrokenRing = $derived(
    layer.kind === "ring" && meta != null && [0x71, 0x72].includes(meta.source),
  );

  // A widget slot's own body only records which metric is selected; what actually appears on the
  // watch is whichever sibling layer carries the matching condition. So the link is offered from
  // THIS side — pick the slot metric this layer stands for — rather than from the slot.
  const slots = $derived(
    collectSlotsDoc($doc?.screens.find((s) => s.kind === $screen)?.layers ?? []),
  );
  const slotBindOptions = $derived([
    { value: "", label: $t.notSlotBound },
    ...slots.flatMap((s) =>
      s.ids.map((id, i) => ({
        value: `${s.index}:${i}`,
        label: $t.slotOption(s.index, sourcePick($t, id)),
      })),
    ),
  ]);
  const slotBindValue = $derived.by(() => {
    const b = slotBindingOf(layer);

    return b ? `${b.slot}:${b.metric}` : "";
  });
  // binding the slot's own layer to itself is meaningless
  const showSlotBind = $derived(slots.length > 0 && layer.kind !== "slot");

  // Conditions are decoded on the layer now, so they are edited per entry rather than as a hex
  // blob. ponytail: no reordering — equality lines OR together and the rest must all hold, so
  // order carries no meaning.
  const OPS = $derived<{ value: CondOp; label: string; short: string }[]>([
    { value: "eq", label: $t.op.eq, short: "=" },
    { value: "ne", label: $t.op.ne, short: "≠" },
    { value: "lt", label: $t.op.lt, short: "<" },
    { value: "gte", label: $t.op.gte, short: "≥" },
    { value: "lte", label: $t.op.lte, short: "≤" },
    { value: "noData", label: $t.op.noData, short: "= ∅" },
  ]);

  const setCondition = (i: number, patch: Partial<Condition>) =>
    set(layer.id, {
      conditions: conditions.map((c, j) => (i === j ? { ...c, ...patch } : c)),
    } as Partial<Layer>);
  const dropCondition = (i: number) =>
    set(layer.id, {
      conditions: conditions.filter((_, j) => j !== i),
    } as Partial<Layer>);
</script>

{#if meta}
  <div class="group">
    <!-- a label beside its field, like every other row: a caps label here would read as a
         second section title right under "Data" -->
    <div class="row">
      <span class="type-caption field-label w-md">{$t.source}</span>
      <Select
        value={String(meta.source)}
        options={sourceOptions}
        onChange={(v) => setSourceId(+v)}
      />
    </div>
    {#if sourceAlias != null}
      <p class="type-caption hint-xs">
        {aliasIsGuess(meta.source)
          ? $t.aliasGuess(sourceAlias.toString(16))
          : $t.aliasSure(sourceAlias.toString(16))}
        {$t.aliasNote}
      </p>
    {/if}
    {#if frameLabels && images.length && images.length !== frameLabels.length}
      <p class="type-caption hint-xs">
        {$t.needsFrames(sourceName($t, meta.source), frameLabels.length, images.length)}
      </p>
    {/if}
  </div>
{/if}
{#if ring}
  <!-- the gauge's own range: frac = (value - min) / (max - min). The sweep and the stroke are
       geometry and live in that section. Its own panel child, so it keeps the panel's row gap
       instead of sitting flush against the source select. -->
  <div class="row">
    <Input
      label={$t.empty}
      type="number"
      value={String(ring.spec.min)}
      onInput={(v) => setSpec({ min: num(v) })}
    />
    <Input
      label={$t.full}
      type="number"
      value={String(ring.spec.max)}
      onInput={(v) => setSpec({ max: num(v) })}
    />
  </div>
{/if}
{#if meta}
  <div class="check-row">
    <Switch checked={isAccent(meta)} onChange={(v) => setAccent(v)} />
    <button type="button" class="check-label" onclick={() => setAccent(!isAccent(meta))}
      >{$t.accentTint}</button
    >
  </div>
{/if}
{#if isSecondHand}
  <div class="check-row">
    <Switch checked={isSmooth} onChange={(v) => setSourceId(v ? 0x12 : 0x72)} />
    <button type="button" class="check-label" onclick={() => setSourceId(isSmooth ? 0x72 : 0x12)}>
      {$t.smoothSweep}
    </button>
  </div>
{/if}
{#if isBrokenRing}
  <div class="group">
    <p class="type-caption hint-xs">{$t.brokenRing}</p>
    <div class="row">
      <Button size="small" kind="secondary" onClick={() => setSourceId(0x0f)}>
        <Icon name="undo" size={18} />
        {$t.switchToSecond}
      </Button>
    </div>
  </div>
{/if}
{#if num_}
  <div class="row">
    <span class="digits">
      <Input
        label={$t.digits}
        type="number"
        min={0}
        max={31}
        value={String(num_.digits)}
        onInput={(v) => setFmt(num(v), num_.padZero)}
      />
    </span>
    <span class="check-row">
      <Switch checked={num_.padZero} onChange={(v) => setFmt(num_.digits, v)} />
      <button type="button" class="check-label" onclick={() => setFmt(num_.digits, !num_.padZero)}
        >{$t.leadingZeros}</button
      >
    </span>
  </div>
{/if}
{#if slot}
  <div class="group">
    <span class="type-label muted-label">{$t.slotMetrics}</span>
    <!-- the menu the companion app shows for this slot; the wearer picks one of these on the
         watch, and a sibling layer bound to it (see "widget slot binding") is what draws -->
    {#each slot.metrics as m, i (m)}
      <div class="row">
        <!-- frames[0] is the on-watch placeholder, so metric i wears frames[i + 1]. Same
             component as the frame list: click to replace the art, hover to download it. -->
        <FrameThumb id={slot.frames[i + 1]} size={2} />
        <span class="type-caption field-label grow">{sourcePick($t, m)}</span>
        <button
          type="button"
          class="icon-btn"
          title={$t.removeMetric}
          disabled={slot.metrics.length < 2}
          onclick={() => slotMetricRemoved({ id: layer.id, metric: m })}
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    {/each}
    {#if addable.length}
      <Select
        value=""
        options={[
          { value: "", label: $t.addMetric },
          ...addable.map((m) => ({ value: String(m), label: sourcePick($t, m) })),
        ]}
        onChange={(v) => v && slotMetricAdded({ id: layer.id, metric: Number(v) })}
      />
    {/if}
    <p class="type-caption hint-xs">{$t.metricIconHint}</p>
  </div>
{/if}
{#if showSlotBind}
  <div class="group">
    <span class="type-label muted-label">{$t.slotBinding}</span>
    <Select
      value={slotBindValue}
      options={slotBindOptions}
      onChange={(v) => {
        const [slot, metric] = v ? v.split(":").map(Number) : [null, 0];

        slotBindSet({ id: layer.id, slot, metric });
      }}
    />
    <p class="type-caption hint-xs">{$t.slotBindHint}</p>
  </div>
{/if}
{#if conditions.length}
  <div class="group">
    <span class="type-label muted-label">{$t.conditions}</span>
    {#each conditions as c, i (i)}
      <div class="row">
        <Select
          value={String(c.source)}
          options={conditionOptions(c.source)}
          onChange={(v) => setCondition(i, { source: +v })}
        />
        <Select value={c.op} options={OPS} onChange={(v) => setCondition(i, { op: v as CondOp })} />
        <span class="w-num">
          <Input
            type="number"
            value={String(c.value)}
            onInput={(v) => setCondition(i, { value: num(v) })}
          />
        </span>
        <button
          type="button"
          title={$t.removeCondition}
          class="icon-btn"
          onclick={() => dropCondition(i)}
        >
          <Icon name="delete" size={14} />
        </button>
      </div>
      <p class="type-caption hint-xs">{bindLines[i]}</p>
    {/each}
    {#if conditions.length > 1}
      <p class="type-caption hint-xs">{$t.condLogicHint}</p>
    {/if}
  </div>
{/if}
{#if conditions.length || layer.kind !== "raw"}
  <div class="row">
    <Button size="small" kind="secondary" onClick={() => conditionAdded(layer.id)}>
      <Icon name="call_split" size={18} />
      {$t.addCondition}
    </Button>
  </div>
{/if}

<style>
  /* half the row, like a field in a two-up row */
  .digits {
    flex: 1;
    min-width: 0;
  }
  .digits + :global(.check-row) {
    flex: 1;
  }
</style>
