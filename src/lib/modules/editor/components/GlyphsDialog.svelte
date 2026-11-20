<script lang="ts">
  // The generator's dialog. Every setting, the font list and the preview strip live in
  // font-sprite.model — this only renders them and fires events.
  import { Dialog } from "$lib/shared/components/dialog";
  import { Button } from "$lib/shared/components/button";
  import { Field } from "$lib/shared/components/field";
  import { Input } from "$lib/shared/components/input";
  import { Select } from "$lib/shared/components/select";
  import { Checkbox } from "$lib/shared/components/checkbox";
  import { Icon } from "$lib/shared/components/icon";
  import { editorModel } from "../model";
  import { labelsOf, WEIGHTS } from "../model/font-sprite.model";
  import { t } from "../i18n";

  const {
    $glyphDialog: target,
    $glyphForm: form,
    $fontOptions: fontOptions,
    $glyphPreview: preview,
    $localFontsPending: localPending,
    glyphDialogClosed,
    glyphFormPatched,
    glyphsGenerateRequested,
    fontFilePicked,
    installedFontsRequested,
  } = editorModel;

  // the app's own families carry English labels from the model; installed ones keep their names
  const fonts = $derived(
    $fontOptions.map((o) => ({
      ...o,
      label: ($t.fonts as Record<string, string>)[o.label] ?? o.label,
    })),
  );

  let fileEl = $state<HTMLInputElement>();
  let canvasEl = $state<HTMLCanvasElement>();

  const clamp = (v: string, lo: number, hi: number, fallback: number) =>
    Math.min(hi, Math.max(lo, Math.round(Number(v)) || fallback));

  // the sprites are already rasterized — this only lays them out side by side
  $effect(() => {
    const strip = $preview;

    if (!canvasEl || !strip) return;
    const cx = canvasEl.getContext("2d")!;

    canvasEl.width = strip.w * strip.bitmaps.length;
    canvasEl.height = strip.h;
    strip.bitmaps.forEach((b, i) => cx.drawImage(b, i * strip.w, 0));
  });

  function pickFile(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    const file = el.files?.[0];

    el.value = ""; // so picking the same file again still fires a change
    if (file) fontFilePicked(file);
  }
</script>

<Dialog open={Boolean($target)} title={$t.spritesFromFont} onClose={() => glyphDialogClosed()}>
  <div class="fields">
    <Field label={$t.font}>
      <div class="row">
        <Select
          value={$form.family}
          options={fonts}
          onChange={(family) => glyphFormPatched({ family })}
        />
        <span class="tool" title={$t.uploadFont}>
          <Button kind="secondary" square onClick={() => fileEl?.click()}>
            <Icon name="upload" size={22} />
          </Button>
        </span>
        <span class="tool" title={$t.pickInstalled}>
          <Button
            kind="secondary"
            square
            disabled={$localPending}
            onClick={() => installedFontsRequested()}
          >
            <Icon name="abc" size={22} />
          </Button>
        </span>
      </div>
    </Field>
    <input
      bind:this={fileEl}
      type="file"
      accept=".ttf,.otf,.woff,.woff2,font/*"
      hidden
      onchange={pickFile}
    />
    <div class="grid">
      <Field label={$t.size}>
        <Input
          type="number"
          min={4}
          max={400}
          value={String($form.sizePx)}
          onInput={(v) => glyphFormPatched({ sizePx: clamp(v, 4, 400, 4) })}
        />
      </Field>
      <Field label={$t.weight}>
        <Select
          value={String($form.weight)}
          options={WEIGHTS.map((w) => ({ value: String(w), label: String(w) }))}
          onChange={(v) => glyphFormPatched({ weight: +v })}
        />
      </Field>
      <Field label={$t.spacing}>
        <Input
          type="number"
          min={-20}
          max={80}
          value={String($form.spacing)}
          onInput={(v) => glyphFormPatched({ spacing: clamp(v, -20, 80, 0) })}
        />
      </Field>
    </div>
    <div class="grid">
      <div class="wide">
        <Field label={$t.color}>
          <!-- the swatch sits inside the field's box, in front of the hex it opens a picker for -->
          <div class="color">
            <input
              class="swatch"
              type="color"
              value={$form.color}
              aria-label={$t.glyphColor}
              oninput={(e) => glyphFormPatched({ color: e.currentTarget.value })}
            />
            <Input
              value={$form.color}
              maxlength={7}
              onInput={(color) => glyphFormPatched({ color })}
            />
          </div>
        </Field>
      </div>
      <Field label={$t.style}>
        <label class="check type-body">
          <Checkbox checked={$form.italic} onChange={(italic) => glyphFormPatched({ italic })} />
          {$t.italic}
        </label>
      </Field>
    </div>
    <Field label={$t.characters} hint={$t.charactersHint}>
      <Input value={$form.labelsText} onInput={(labelsText) => glyphFormPatched({ labelsText })} />
    </Field>
  </div>

  <div class="preview">
    <canvas bind:this={canvasEl}></canvas>
  </div>
  <p class="info type-caption">
    {#if $preview}
      {$t.spriteInfo(
        $preview.bitmaps.length,
        $preview.w,
        $preview.h,
        ($preview.bytes / 1024).toFixed(1),
      )}
    {/if}
  </p>

  {#snippet actions()}
    <Button kind="secondary" onClick={() => glyphDialogClosed()}>{$t.cancel}</Button>
    <Button
      kind="primary"
      disabled={!labelsOf($form).length}
      onClick={() => glyphsGenerateRequested()}
    >
      {$t.replaceFrames}
    </Button>
  {/snippet}
</Dialog>

<style>
  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .wide {
    grid-column: span 2;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    > :global(:first-child) {
      flex: 1;
      min-width: 0;
    }
  }
  .tool {
    flex-shrink: 0;
    display: inline-flex;
  }
  /* a field-sized box like the inputs beside it, so the row lines up */
  .check {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    height: var(--control-height);
    padding: 0 0.875rem;
    border-radius: var(--border-radius);
    background: oklch(from var(--color-text) l c h / 7%);
    cursor: pointer;
  }
  /* the hex field with its swatch laid over the start of the box */
  .color {
    position: relative;

    :global(.box) {
      padding-inline-start: 2.75rem;
    }
  }
  .swatch {
    position: absolute;
    top: 50%;
    inset-inline-start: 0.625rem;
    z-index: 1;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    translate: 0 -50%;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    &::-webkit-color-swatch,
    &::-moz-color-swatch {
      border: 1px solid oklch(from var(--color-text) l c h / 20%);
      border-radius: 50%;
    }
  }
  /* the watch panel is black, and white-on-white would preview as nothing at all */
  .preview {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: var(--border-radius-tile);
    background: oklch(0 0 0);
    overflow-x: auto;
  }
  canvas {
    display: block;
    max-width: 100%;
    height: auto;
  }
  .info {
    margin: 0.5rem 0 0;
    color: oklch(from var(--color-text) l c h / 55%);
  }
</style>
