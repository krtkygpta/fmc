<script lang="ts">
  import { PanelSection } from "$lib/shared/components/panel-section";
  import { Input } from "$lib/shared/components/input";
  import { Switch } from "$lib/shared/components/switch";
  import { Icon } from "$lib/shared/components/icon";
  import {
    ACCENT_PALETTE,
    ID_METRIC,
    METRIC_GOAL,
    SLEEP_IDS,
    SUN_IDS,
    type Sim,
    type SimMetric,
  } from "../core/document/sources";
  import { editorModel } from "../model";
  import { common } from "$lib/shared/i18n";
  import { t, sourcePick } from "../i18n-inspector";
  const { $sim: sim, $ids: ids, simPatched, overrideSet } = editorModel;

  // One input per METRIC, not per id: the firmware answers several ids out of one metric, so a row each would be eight inputs for one number — and the last one typed would
  // silently win. Only the metrics this document actually reads are offered; the raw per-id
  // escape hatch is still there, below, for driving two widgets apart.
  // labels: $t.metric[m], and $t.goal[METRIC_GOAL[m]] for the ones a ring divides by a goal
  const METRICS: SimMetric[] = [
    "steps",
    "hr",
    "battery",
    "calories",
    "distance",
    "temp",
    "aqi",
    "spo2",
    "stands",
    "exerciseMin",
    "activeHours",
  ];

  // The clock-shaped fields: each feeds an hour source and a minute source (and, for sleep, a
  // ring against its goal), so one time field beats the four number boxes those ids would ask
  // for. Shown only while the document reads the ids behind them.
  const TIMES: [keyof Sim & ("sunrise" | "sunset" | "sleep" | "sleepGoal"), number[]][] = [
    ["sunrise", SUN_IDS],
    ["sunset", SUN_IDS],
    ["sleep", SLEEP_IDS],
    ["sleepGoal", SLEEP_IDS],
  ];

  const used = $derived(new Set($ids.map(({ id }) => ID_METRIC[id]).filter(Boolean)));
  const shown = $derived(METRICS.filter((m) => used.has(m)));
  const overrides = $derived(
    $ids.filter(({ id }) => $sim.overrides[id] !== undefined && $sim.overrides[id] !== "").length,
  );

  function localISO(t: number) {
    return new Date(t - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }

  const shownTimes = $derived(
    TIMES.filter(([, behind]) => $ids.some(({ id }) => behind.includes(id))),
  );
  const hhmm = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  const minutes = (v: string) => {
    const [h, m] = v.split(":").map(Number);

    return h * 60 + m;
  };
</script>

<div class="panel type-small" data-dense>
  <PanelSection title={$t.clock}>
    <div class="switch-row">
      <Switch checked={$sim.live} onChange={(v) => simPatched({ live: v })} />
      <button type="button" class="check-label" onclick={() => simPatched({ live: !$sim.live })}
        >{$t.liveTime}</button
      >
    </div>
    {#if !$sim.live}
      <Input
        type="datetime-local"
        step={1}
        value={localISO($sim.time)}
        onInput={(v) => simPatched({ time: new Date(v).getTime() })}
      />
    {/if}
    <div class="switch-row">
      <Switch checked={$sim.is24h} onChange={(v) => simPatched({ is24h: v })} />
      <button type="button" class="check-label" onclick={() => simPatched({ is24h: !$sim.is24h })}
        >{$t.format24h}</button
      >
    </div>
  </PanelSection>
  <PanelSection title={$t.display}>
    <div class="switch-row">
      <Switch
        checked={$sim.showSlotPlaceholders}
        onChange={(v) => simPatched({ showSlotPlaceholders: v })}
      />
      <button
        type="button"
        class="check-label"
        onclick={() => simPatched({ showSlotPlaceholders: !$sim.showSlotPlaceholders })}
        >{$t.slotPlaceholders}</button
      >
    </div>
    <div>
      <span class="type-label muted-label">{$common.accentColor}</span>
      <!-- the watch offers a fixed set, so this mirrors it rather than opening a color wheel;
           recolors widgets flagged via meta[7]===4, see metaInfo in lib/sources.ts -->
      <div class="accent-row">
        <button
          type="button"
          class="swatch none"
          class:on={!$sim.accentColor}
          title={$t.noAccentTitle}
          aria-label={$t.noAccent}
          onclick={() => simPatched({ accentColor: null })}
        >
          <Icon name="close" size={12} />
        </button>
        {#each ACCENT_PALETTE as c}
          <button
            type="button"
            class="swatch"
            class:on={$sim.accentColor === c}
            style="background: {c}"
            title={c}
            aria-label={c}
            onclick={() => simPatched({ accentColor: c })}
          ></button>
        {/each}
      </div>
    </div>
  </PanelSection>
  <PanelSection title={$t.values}>
    {#if shown.length}
      <div class="fields-grid">
        {#each shown as key}
          <div>
            <span class="type-label muted-label">{$t.metric[key]}</span>
            <Input
              type="number"
              value={String($sim[key])}
              onInput={(v) => simPatched({ [key]: v === "" ? "" : +v })}
            />
          </div>
          {@const goal = METRIC_GOAL[key]}
          {#if goal}
            <div>
              <span class="type-label muted-label" title={$t.goalTitle}>{$t.goal[goal]}</span>
              <Input
                type="number"
                value={String($sim[goal])}
                onInput={(v) => simPatched({ [goal]: v === "" ? "" : +v })}
              />
            </div>
          {/if}
        {/each}
      </div>
    {/if}
    {#if shownTimes.length}
      <div class="fields-grid">
        {#each shownTimes as [key]}
          <div>
            <span class="type-label muted-label">{$t.time[key]}</span>
            <Input
              type="time"
              value={hhmm($sim[key])}
              onInput={(v) => v && simPatched({ [key]: minutes(v) })}
            />
          </div>
        {/each}
      </div>
    {/if}
  </PanelSection>

  <!-- The escape hatch, folded away: every source the face reads, addressable one by one, for
       pinning a hand or driving two widgets on the same metric apart. A value here WINS over the
       field above (see idValue), so the count says how many are doing that. -->
  {#if $ids.length}
    <details class="raw">
      <summary>
        {$t.overrides(overrides)}
      </summary>
      <div class="ids-list">
        {#each $ids as { id, max }}
          <div class="id-row">
            <span class="id-label type-caption type-mono">{sourcePick($t, id)}</span>
            <span class="id-input">
              <Input
                type="number"
                placeholder={$t.auto}
                value={String($sim.overrides[id] ?? "")}
                onInput={(v) => overrideSet({ id, value: v })}
              />
            </span>
            <!-- meta.max: the widget's OWN declared maximum (a hand's 60 positions, a number's
                 digit cap), not the metric's range — it doesn't scale what you type here -->
            {#if max}<span class="max-hint type-caption" title={$t.maxTitle}>{$t.max(max)}</span
              >{/if}
          </div>
        {/each}
      </div>
    </details>
  {/if}
</div>

<style>
  .panel {
    /* a dense surface: every field in here is shorter than the app's default */
    --control-height: 1.875rem;

    display: flex;
    flex-direction: column;
  }
  .switch-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  .muted-label {
    display: block;
    margin-bottom: 0.375rem;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  /* one row, scrolled — wrapping left a lone swatch stranded on a second line */
  .accent-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: auto;
    /* room for the selected swatch's outline, which sits outside its box */
    padding: 0.25rem;
    margin: -0.25rem;
    scrollbar-width: thin;
  }
  .swatch {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 1px solid oklch(from var(--color-text) l c h / 12%);
    border-radius: 50%;
    cursor: pointer;
    /* the ring sits outside the circle, so picking one doesn't nudge the row */
    outline: 2px solid transparent;
    outline-offset: 2px;
    transition: outline-color 0.15s ease;

    &.on {
      outline-color: var(--color-text);
    }
  }
  .none {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .fields-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 0.75rem;
  }
  .raw {
    padding-block: 0.875rem;
    border-top: 1px solid oklch(from var(--color-text) l c h / 10%);

    summary {
      cursor: pointer;
      color: oklch(from var(--color-text) l c h / 55%);
    }
    &[open] summary {
      margin-bottom: 0.5rem;
    }
  }
  .ids-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .id-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .id-label {
    width: 7.5rem;
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .id-input {
    display: inline-block;
    width: 6rem;
    flex-shrink: 0;
  }
  .max-hint {
    white-space: nowrap;
    color: oklch(from var(--color-text) l c h / 55%);
  }
</style>
