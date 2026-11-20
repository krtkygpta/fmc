<script lang="ts">
  import { WatchCase } from "$lib/shared/components/watch-case";
  import { Button } from "$lib/shared/components/button";
  import { Tabs } from "$lib/shared/components/tabs";
  import { Dialog } from "$lib/shared/components/dialog";
  import { Loader } from "$lib/shared/components/loader";
  import { Icon } from "$lib/shared/components/icon";
  import { holdCursor } from "$lib/shared/lib/hold-cursor";
  import { Menu, MenuItem } from "$lib/shared/components/menu";
  import { authModel } from "$lib/modules/auth/model";
  import { marketModel } from "$lib/modules/market/model";
  import PublishDialog from "../components/PublishDialog.svelte";
  import GlyphsDialog from "../components/GlyphsDialog.svelte";
  import { bleModel } from "$lib/modules/device/model";
  import { renderDoc } from "../core/render/render";
  import { SCREEN } from "../core/render/screen";
  import type { LayerHit, Point } from "../core/render/canvas";
  import { drawOverlay, hitOf, resizable, type Guides } from "../core/render/overlay";
  import { snapTargets, type SnapTargets } from "../core/render/snap";
  import { SNAP_THRESHOLD, GUIDE_WIDTH } from "../shared/constants";
  import {
    cursorAt,
    dragDelta,
    dragItem,
    firstAsset,
    handleAt,
    movePatch,
    nudgeRequest,
    onRotateHandle,
    resizePreview,
    resizeRequest,
    resizeTo,
    rotateTo,
    startResize,
    startRotate,
    type DragItem,
    type ResizeRequest,
    type Rot,
    type Rz,
  } from "../shared/drag";
  import {
    capsFor,
    inField,
    isRoving,
    matchShortcut,
    type ShortcutActions,
  } from "../shared/shortcuts";
  import { editorModel } from "../model";
  import TreePanel from "../components/TreePanel.svelte";
  import PropsPanel from "../components/PropsPanel.svelte";
  import SimPanel from "../components/SimPanel.svelte";
  import ShortcutsDialog from "../components/ShortcutsDialog.svelte";
  import { t } from "../i18n";

  const { $user: user } = authModel;
  const {
    $bleStatus: bleStatus,
    $bleStatusText: bleStatusText,
    $bleInfo: bleInfo,
    flashRequested,
    $flashing: flashing,
  } = bleModel;
  const {
    $openedWf: openedWf,
    $foreignWf: foreignWf,
    faceDetached,
    saveDraftRequested,
    $savePending: saving,
    publishDialogOpened,
  } = marketModel;
  const {
    $doc: doc,
    $store: store,
    $sim: sim,
    $screen: screen,
    $sel: sel,
    $selected: selected,
    $err: err,
    $undoN: undoN,
    $redoN: redoN,
    select,
    selectToggled,
    selectAllRequested,
    siblingSelected,
    nestSelected,
    screenSet,
    checkpoint,
    undo,
    redo,
    layerPatched,
    aodAdded,
    copyRequested,
    cutRequested,
    pasteRequested,
    binsImported,
    duplicateRequested,
    deleteRequested,
    orderMoved,
    resizeImageRequested,
    resizeGroupRequested,
    rotateImageRequested,
    ringResized,
    $lockAspect: lockAspect,
    loadRequested,
    newFaceRequested,
    importFacerRequested,
    exportBin,
    errored,
    renameFace,
    buildCurrentBin,
    previewBlob,
    previewThumb,
    $rightPanel: rightPanel,
    rightPanelSet,
    $loading: loading,
  } = editorModel;

  let canvas = $state<HTMLCanvasElement | null>(null);
  let fileInput = $state<HTMLInputElement>();
  let dirInput = $state<HTMLInputElement>();
  let binsInput = $state<HTMLInputElement>();

  let mobilePanel = $state<"tree" | "props" | "sim" | null>(null); // drawer on mobile
  let helpOpen = $state(false); // the `?` overlay
  let hits: LayerHit[] = [];

  const PANEL_KEY = "fmc.panel-widths";
  const SIDE_MIN = 12;
  const SIDE_MAX = 35;
  const savedWidths: { tree?: number; right?: number } = JSON.parse(
    localStorage.getItem(PANEL_KEY) || "{}",
  );
  let treeW = $state(savedWidths.tree ?? 17.5);
  let rightW = $state(savedWidths.right ?? 20.625);
  let gutter = $state.raw<{
    side: "tree" | "right";
    x: number;
    from: number;
  } | null>(null);

  const rootRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const setSide = (side: "tree" | "right", w: number) => {
    const clamped = Math.min(SIDE_MAX, Math.max(SIDE_MIN, w));

    if (side === "tree") treeW = clamped;
    else rightW = clamped;
  };

  $effect(() => {
    localStorage.setItem(PANEL_KEY, JSON.stringify({ tree: treeW, right: rightW }));
  });

  function gutterDown(side: "tree" | "right", e: PointerEvent) {
    e.preventDefault();
    gutter = { side, x: e.clientX, from: side === "tree" ? treeW : rightW };
    holdCursor(gutterCursor(side));
  }

  function gutterMove(e: PointerEvent) {
    if (!gutter) return;
    const dx = gutter.side === "tree" ? e.clientX - gutter.x : gutter.x - e.clientX;

    setSide(gutter.side, gutter.from + dx / rootRem());
    holdCursor(gutterCursor(gutter.side));
  }

  function gutterKey(side: "tree" | "right", e: KeyboardEvent) {
    const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;

    if (!step) return;
    e.preventDefault();
    e.stopPropagation(); // the window handler would also read this as "move the selection"
    setSide(side, (side === "tree" ? treeW : rightW) + (side === "tree" ? step : -step));
  }

  function gutterCursor(side: "tree" | "right") {
    const w = side === "tree" ? treeW : rightW;
    const grow = side === "tree" ? "e-resize" : "w-resize";
    const shrink = side === "tree" ? "w-resize" : "e-resize";

    if (w <= SIDE_MIN) return grow;
    if (w >= SIDE_MAX) return shrink;
    return "col-resize";
  }

  function openFile(e: Event) {
    const el = e.target;
    const f =
      (el instanceof HTMLInputElement ? el.files?.[0] : undefined) ||
      (e as DragEvent).dataTransfer?.files?.[0];

    if (el instanceof HTMLInputElement) el.value = "";
    if (!f) return;
    e.preventDefault();

    f.arrayBuffer().then((buf) => {
      const head = new Uint8Array(buf, 0, 2);

      if (head[0] === 0x50 && head[1] === 0x4b) importFacerRequested([f]);
      else loadRequested({ buf, label: f.name });
    });
    faceDetached();
  }

  // Facer exports are directories, so this takes a whole folder rather than one file
  function openFacer(e: Event) {
    const el = e.target;
    const files = el instanceof HTMLInputElement ? [...(el.files ?? [])] : [];

    if (el instanceof HTMLInputElement) el.value = "";
    if (!files.length) return; // cancelled picker — same as above, don't detach the record
    importFacerRequested(files);
    faceDetached();
  }

  const isPublishedMine = $derived(Boolean($openedWf?.published) && $openedWf?.owner === $user?.id);

  async function saveDraft() {
    const u = $user;

    if (!u) return;
    try {
      saveDraftRequested({
        name: $doc?.name || "Custom",
        ownerId: u.id,
        published: $openedWf?.published ?? false,
        bin: await buildCurrentBin(),
        preview: await previewBlob(),
      });
    } catch (e) {
      errored($t.saveFailed(e instanceof Error ? e.message : String(e)));
    }
  }

  const perf = import.meta.env.DEV;
  let fps = $state(0);
  let drawMs = $state(0);
  let frames = 0,
    drawTotal = 0,
    since = 0;

  function sampleFrame(t0: number) {
    const now = performance.now();

    frames++;
    drawTotal += now - t0;
    since ||= now;
    if (now - since >= 500) {
      fps = Math.round((frames * 1000) / (now - since));
      drawMs = Math.round((drawTotal / frames) * 10) / 10;
      frames = drawTotal = 0;
      since = now;
    }
  }

  const snapshot = () => ({
    doc: $doc,
    store: $store,
    sim: $sim,
    screen: $screen,
    sel: $sel,
    selected: $selected,
  });
  let scene = snapshot();

  $effect(() => {
    scene = snapshot();
  });

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const color = css.getPropertyValue("--color-selection").trim();
    const guideColor = css.getPropertyValue("--color-guide").trim();
    let raf = 0;
    const loop = () => {
      const s = scene;
      const t0 = perf && performance.now();

      if (s.doc) {
        hits = renderDoc(ctx, s.doc, s.store, s.screen, s.sim, resizePreview(rz, rot));
        drawOverlay(ctx, {
          doc: s.doc,
          hits,
          sel: s.sel,
          selected: s.selected,
          guides,
          color,
          guide: { color: guideColor, width: GUIDE_WIDTH * cvScale },
        });
      } else {
        ctx.clearRect(0, 0, SCREEN, SCREEN);
      }
      if (perf) sampleFrame(t0 as number);
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  });

  let rz: Rz | null = null;
  let rot: Rot | null = null;
  let snapT: SnapTargets | null = null;
  let cvScale = 1; // canvas units per screen px — the thresholds are in screen px
  let box0: LayerHit | null = null;
  let guides: Guides = { x: [], y: [] };

  const selHit = () => {
    const h = hitOf(hits, $sel);

    return h && resizable(h.layer) ? h : null;
  };

  function requestResize(r: ResizeRequest | null) {
    if (r?.to === "group") resizeGroupRequested(r.p);
    else if (r?.to === "ring") ringResized(r.p);
    else if (r?.to === "image") resizeImageRequested(r.p);
  }

  // ---- selection and drag ----
  let drag: { p: Point; items: DragItem[]; moved: boolean } | null = null;
  const canvasXY = (e: PointerEvent): Point => {
    const r = canvas!.getBoundingClientRect();

    return {
      x: ((e.clientX - r.left) * SCREEN) / r.width,
      y: ((e.clientY - r.top) * SCREEN) / r.height,
    };
  };

  function onDown(e: PointerEvent) {
    if (!$doc) return;
    const p = canvasXY(e);
    const sh = selHit();

    if (sh && onRotateHandle(p, sh)) {
      rot = startRotate(sh, p);
      canvas?.setPointerCapture(e.pointerId);
      return;
    }
    const c = sh && handleAt(p, sh);

    if (sh && c) {
      // a group scales by factor, so its base size is the box itself
      rz = startResize(sh, c, p, firstAsset($doc, sh.layer) ?? { w: sh.w, h: sh.h });
      canvas?.setPointerCapture(e.pointerId);
      return;
    }
    const h = hits.findLast(
      (h) => !h.layer.locked && p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h,
    );

    if (!h) {
      select(null);
      return;
    }
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      selectToggled(h.layer.id); // add/remove — no drag, the modifier click is the whole gesture
      return;
    }
    // pressing inside an existing multi-selection keeps it, so the whole block can be dragged
    const inSelection = $selected.some((l) => l.id === h.layer.id);
    const layers = inSelection ? $selected : (select(h.layer.id), [h.layer]);
    const items = layers.map(dragItem).filter((i): i is DragItem => i !== null);

    if (items.length) {
      drag = { p, items, moved: false };
      // the hitbox, not the layer's x/y — a number's box is its composed digits, a hand's the
      // rotated AABB. Everything in the drag moves by one delta, so snapping this box is enough.
      box0 = h;
      snapT = snapTargets(hits, layers);
      // the canvas doesn't resize mid-drag, so one layout read is enough for the whole gesture
      cvScale = SCREEN / (canvas?.getBoundingClientRect().width || SCREEN);
    }
    canvas?.setPointerCapture(e.pointerId);
  }

  function onMove(e: PointerEvent) {
    if (rot) {
      rot = rotateTo(rot, canvasXY(e), e.shiftKey);
      return;
    }
    if (rz) {
      rz = resizeTo(rz, canvasXY(e), $lockAspect !== e.shiftKey);
      return;
    }
    const d = drag;

    if (!d) {
      const sh = canvas && selHit();

      if (canvas) canvas.style.cursor = sh ? cursorAt(canvasXY(e), sh) : "";
      return;
    }
    if (!d.moved) {
      checkpoint(0);
      d.moved = true;
    }
    const snap =
      box0 && snapT && !e.altKey
        ? { box: box0, targets: snapT, tol: SNAP_THRESHOLD * cvScale }
        : null;
    const m = dragDelta(d.p, canvasXY(e), snap);

    guides = m.guides;
    for (const it of d.items) layerPatched(movePatch(it, it.x0 + m.dx, it.y0 + m.dy));
  }
  function onUp() {
    if (rot) {
      if (rot.started && rot.deg % 360) rotateImageRequested({ layer: rot.layer.id, deg: rot.deg });
      rot = null;
    }
    if (rz) {
      if (rz.started) requestResize(resizeRequest(rz)); // the whole drag lands as one rescale
      rz = null;
    }
    drag = box0 = snapT = null;
    guides = { x: [], y: [] };
  }

  function nudgeMove(dx: number, dy: number) {
    checkpoint();
    for (const l of $selected) {
      const it = dragItem(l);

      if (it) layerPatched(movePatch(it, it.x0 + dx, it.y0 + dy));
    }
  }

  const nudgeResize = (dw: number, dh: number) =>
    requestResize(nudgeRequest($doc, hits, $selected[0], dw, dh));

  const actions: ShortcutActions = {
    undo: () => undo(),
    redo: () => redo(),
    copy: () => copyRequested(),
    cut: () => cutRequested(),
    paste: () => pasteRequested(),
    duplicate: () => duplicateRequested(),
    remove: () => deleteRequested(),
    order: (dir) => orderMoved(dir),
    clearSelection: () => select(null),
    selectAll: () => selectAllRequested(),
    sibling: (dir) => siblingSelected(dir),
    nest: (dir) => nestSelected(dir),
    move: nudgeMove,
    resize: nudgeResize,
    save: () => void saveDraft(),
    exportBin: () => exportBin(),
    flash: () => void flashWatch(),
    panel: (tab) => rightPanelSet(tab),
    // picking AOD with no AOD screen creates one — the same thing the tab does
    screen: (kind) => (kind === "aod" && !hasAOD ? aodAdded() : screenSet(kind)),
    help: () => (helpOpen = true),
  };

  function onKey(e: KeyboardEvent) {
    const hit = matchShortcut(e, {
      doc: Boolean($doc),
      selection: $selected.length > 0,
      field: inField(e.target),
      roving: isRoving(e.target),
    });

    if (!hit) return;
    e.preventDefault();
    hit.run(actions, e);
  }

  async function flashWatch() {
    // thumbnail so the watch popover can show this face by picture rather than by id; key so
    // re-flashing it lands on the slot it already occupies instead of taking another one
    flashRequested({
      bin: await buildCurrentBin(),
      preview: await previewThumb(),
      key: $openedWf?.id,
    });
  }

  const hasAOD = $derived($doc?.screens.some((s) => s.kind === "aod"));
  const screenItems = $derived([
    { value: "main", label: $t.main },
    // not disabled when the face has no AOD screen — picking it creates one (see aodAdded)
    { value: "aod", label: hasAOD ? $t.aod : $t.aodAdd, disabled: !$doc },
  ]);
  const panelItems = $derived([
    { value: "props", label: $t.properties },
    { value: "sim", label: $t.simulator, disabled: !$doc },
  ]);
  const mobileTitle = $derived(
    mobilePanel === "tree"
      ? $t.tree
      : mobilePanel === "props"
        ? $t.properties
        : mobilePanel === "sim"
          ? $t.simulator
          : undefined,
  );
</script>

<!-- the resize drag ends on the WINDOW, not the handle: releasing outside the browser (or losing
     the pointer to a cancel) otherwise leaves the gutter stuck to the cursor -->
<svelte:window
  onkeydown={onKey}
  ondragover={(e) => e.preventDefault()}
  ondrop={openFile}
  onpointermove={gutterMove}
  onpointerup={() => (gutter = null)}
  onpointercancel={() => (gutter = null)}
  onblur={() => (gutter = null)}
/>

<div class="page">
  <!-- three zones: the document (file menu, name, history) · what the canvas shows · what leaves
       the editor, ending in its one ink button — Flash with a watch connected, Export without -->
  <div class="toolbar">
    <div class="zone start">
      <Menu align="start">
        {#snippet trigger({ toggle })}
          <span class="tool-slot" title={$t.file}>
            <Button size="small" kind="ghost" onClick={toggle}>
              <Icon name="menu" size={20} />
            </Button>
          </span>
        {/snippet}
        <MenuItem
          onClick={() => {
            faceDetached();
            newFaceRequested();
          }}
        >
          <Icon name="note_add" />
          {$t.newFace}
        </MenuItem>
        <MenuItem onClick={() => fileInput?.click()}>
          <Icon name="file_open" />
          <span class="route">{$t.openWatchface} <span class="type-caption">.bin, .aab</span></span>
        </MenuItem>
        <MenuItem onClick={() => dirInput?.click()}>
          <Icon name="watch" />
          <span class="route"
            >{$t.importFolder} <span class="type-caption">Facer, WatchMaker</span></span
          >
        </MenuItem>
        {#if $doc}
          <MenuItem onClick={() => binsInput?.click()}>
            <Icon name="library_add" />
            <span class="route">{$t.addLayersFrom} <span class="type-caption">.bin</span></span>
          </MenuItem>
          <MenuItem keys={capsFor("mod+e")} onClick={() => exportBin()}>
            <Icon name="download" />
            {$t.exportBin}
          </MenuItem>
        {/if}
      </Menu>
      <input bind:this={fileInput} type="file" accept=".bin,.aab,.zip" hidden onchange={openFile} />
      <input bind:this={dirInput} type="file" webkitdirectory hidden onchange={openFacer} />
      <input
        bind:this={binsInput}
        type="file"
        accept=".bin"
        multiple
        hidden
        onchange={(e) => {
          binsImported([...(e.currentTarget.files ?? [])]);
          e.currentTarget.value = "";
        }}
      />
      {#if $doc}
        <!-- commits on blur/Enter, not per keystroke: every rename is one undo step, and the
             header field only holds 15 bytes anyway (see renameFace) -->
        <input
          class="wf-name type-body"
          value={$doc.name}
          title={$t.nameHint}
          maxlength="63"
          onchange={(e) => renameFace(e.currentTarget.value.trim())}
          onkeydown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <span class="tool-slot" title={$t.undoHint}>
          <Button size="small" kind="ghost" disabled={!$undoN} onClick={() => undo()}>
            <Icon name="undo" size={20} />
          </Button>
        </span>
        <span class="tool-slot" title={$t.redoHint}>
          <Button size="small" kind="ghost" disabled={!$redoN} onClick={() => redo()}>
            <Icon name="redo" size={20} />
          </Button>
        </span>
      {/if}
    </div>
    {#if $doc}
      <div class="zone center">
        <Tabs
          items={screenItems}
          value={$screen}
          onChange={(v) =>
            v === "aod" ? (hasAOD ? screenSet("aod") : aodAdded()) : screenSet("main")}
        />
      </div>
      <div class="zone end">
        {#if $user}
          <span
            class="tool-slot"
            title={$foreignWf
              ? $t.foreignHint
              : isPublishedMine
                ? $t.updatePublishedHint
                : $openedWf
                  ? $t.saveChangesHint
                  : $t.saveDraftHint}
          >
            <Button size="small" kind="ghost" onClick={saveDraft} disabled={$saving || $foreignWf}>
              <Icon name="save" size={20} />
              <span class="btn-label"
                >{$saving ? $t.saving : isPublishedMine ? $t.update : $t.save}</span
              >
            </Button>
          </span>
          <span
            class="tool-slot"
            title={$foreignWf ? $t.foreignHint : isPublishedMine ? $t.editDetailsHint : $t.publish}
          >
            <Button
              size="small"
              kind="ghost"
              onClick={() => publishDialogOpened()}
              disabled={$foreignWf}
            >
              <Icon name={isPublishedMine ? "edit_note" : "cloud_upload"} size={20} />
              <span class="btn-label">{isPublishedMine ? $t.details : $t.publish}</span>
            </Button>
          </span>
        {/if}
        {#if $bleInfo}
          <span class="tool-slot" title={$t.uploadToWatch}>
            <Button size="small" kind="primary" onClick={flashWatch} disabled={$flashing}>
              <Icon name="bolt" size={20} />
              <span class="btn-label">{$flashing ? $t.flashing : $t.flash}</span>
            </Button>
          </span>
        {:else}
          <span class="tool-slot" title={$t.exportBinHint}>
            <Button size="small" kind="primary" onClick={() => exportBin()}>
              <Icon name="download" size={20} />
              <span class="btn-label">{$t.exportBin}</span>
            </Button>
          </span>
        {/if}
      </div>
    {/if}
  </div>

  {#if $err || ($flashing && $bleStatus) || $bleStatus?.startsWith("error:")}
    <p class="statusbar type-caption" class:error={$err || $bleStatus?.startsWith("error:")}>
      {$err || $bleStatusText.replace(/^error:\s*/, "")}
    </p>
  {/if}

  <div class="layout">
    <aside class="side-panel tree-panel" style="width: {treeW}rem">
      <TreePanel />
      {@render gutterHandle("tree")}
    </aside>

    <section class="canvas-section">
      <div class="canvas-scroll">
        <div class="canvas-clip">
          <div class="canvas-frame">
            <WatchCase>
              <canvas
                bind:this={canvas}
                width={SCREEN}
                height={SCREEN}
                class="canvas"
                onpointerdown={onDown}
                onpointermove={onMove}
                onpointerup={onUp}
              ></canvas>
              <!-- the market opens the editor before the .bin has even arrived (see editRequested) —
               this is what the user watches while it does -->
              {#if $loading}
                <div class="canvas-loading"><Loader /></div>
              {:else if !$doc}
                <!-- nothing open yet: the dial itself says what to do, instead of leaving a black
                 disc and two unlabelled toolbar icons to be figured out -->
                <div class="canvas-empty">
                  <h2 class="type-title">{$t.makeWatchface}</h2>
                  <div class="canvas-empty-actions">
                    <Button
                      onClick={() => {
                        faceDetached();
                        newFaceRequested();
                      }}
                    >
                      <Icon name="note_add" size={22} />
                      {$t.startBlank}
                    </Button>
                    <Button kind="secondary" onClick={() => fileInput?.click()}>
                      <Icon name="folder_open" size={22} />
                      {$t.openFile}
                    </Button>
                  </div>
                  <p class="type-caption">
                    {$t.emptyHint}
                  </p>
                </div>
              {/if}
            </WatchCase>
          </div>
        </div>
      </div>
      {#if perf && $doc}
        <p class="fps type-caption type-mono" class:slow={fps > 0 && fps < 50}>
          {fps} fps · {drawMs} ms draw
        </p>
      {/if}
      <!-- the canvas's gestures, folded into a round "?" in the corner: a native disclosure,
           so it opens and closes with no state of its own -->
      {#if $doc}
        <details class="hint">
          <summary class="hint-key" aria-label={$t.canvasControls} title={$t.canvasControls}>
            <Icon name="question_mark" size={20} />
          </summary>
          <div class="hint-card type-small">
            <ul>
              <li><span>{$t.hintClick}</span> {$t.hintSelect}</li>
              <li><span>{$t.hintDrag}</span> {$t.hintMove}</li>
              <li><span>{$t.hintAltDrag}</span> {$t.hintMoveNoSnap}</li>
              <li><span>{$t.hintCorners}</span> {$t.hintResize}</li>
              <li><span>{$t.hintDot}</span> {$t.hintRotate}</li>
            </ul>
            <Button size="small" kind="secondary" onClick={() => (helpOpen = true)}>
              {$t.allShortcuts}
            </Button>
          </div>
        </details>
      {/if}
    </section>

    <aside class="side-panel right-panel" style="width: {rightW}rem">
      {@render gutterHandle("right")}
      <div class="tabs-row">
        <Tabs
          full
          items={panelItems}
          value={$rightPanel}
          onChange={(v) => rightPanelSet(v as "props" | "sim")}
        />
      </div>
      <div class="panel-body">
        {#if $rightPanel === "sim"}
          <SimPanel />
        {:else}
          <PropsPanel />
        {/if}
      </div>
    </aside>

    {#if $doc}
      <!-- the three panels, as one floating pill over the canvas: each opens its sheet -->
      <div class="mobile-actions">
        {#each [["tree", "account_tree", $t.tree], ["props", "tune", $t.propsShort], ["sim", "play_arrow", $t.simShort]] as [id, icon, label] (id)}
          <button
            type="button"
            class="panel-btn type-label"
            onclick={() => (mobilePanel = id as "tree" | "props" | "sim")}
          >
            <Icon name={icon} size={20} />
            {label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

{#snippet gutterHandle(side: "tree" | "right")}
  <!-- a FOCUSABLE separator is the ARIA window-splitter widget, so tabindex + arrow keys are
       exactly right here — svelte's rules only know the static, non-interactive separator -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    tabindex="0"
    class="gutter gutter-{side}"
    class:active={gutter?.side === side}
    role="separator"
    aria-orientation="vertical"
    aria-label={$t.resizePanel}
    aria-valuenow={Math.round(side === "tree" ? treeW : rightW)}
    aria-valuemin={SIDE_MIN}
    aria-valuemax={SIDE_MAX}
    style="cursor: {gutterCursor(side)}"
    onpointerdown={(e) => gutterDown(side, e)}
    ondblclick={() => setSide(side, side === "tree" ? 17.5 : 20.625)}
    onkeydown={(e) => gutterKey(side, e)}
  ></div>
{/snippet}

<!-- phone only, where Dialog is the same swipeable sheet as the watch panel -->
<Dialog open={mobilePanel !== null} title={mobileTitle} onClose={() => (mobilePanel = null)}>
  <div class="sheet-panel" class:bleed={mobilePanel === "tree"}>
    {#if mobilePanel === "tree"}
      <TreePanel />
    {:else if mobilePanel === "props"}
      <PropsPanel />
    {:else if mobilePanel === "sim"}
      <SimPanel />
    {/if}
  </div>
</Dialog>

<PublishDialog />
<GlyphsDialog />

<ShortcutsDialog open={helpOpen} onClose={() => (helpOpen = false)} />

<style>
  .page {
    display: flex;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    background: var(--color-background);
    color: var(--color-text);
  }
  /* 1fr auto 1fr keeps the screen switch centred however wide either side gets */
  .toolbar {
    /* a dense row: the segmented control here comes out as tall as the small buttons */
    --control-height: 2.25rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    border-bottom: 1px solid oklch(from var(--color-text) l c h / 12%);
  }
  .zone {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.25rem;
  }
  .end {
    justify-content: flex-end;
  }
  /* the menu grows to its longest route rather than wrapping a label onto two lines */
  .route {
    display: flex;
    flex-direction: column;
    white-space: nowrap;

    /* what it takes, under the name, as secondary text */
    & span {
      color: oklch(from var(--color-text) l c h / 55%);
    }
  }
  .btn-label {
    display: none;
  }
  .wf-name {
    display: none;
    min-width: 0;
    width: 14rem;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: var(--border-radius);
    background: transparent;
    padding-inline: 0.25rem;
    font: inherit;
    color: var(--color-text);
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (hover: hover) {
      &:hover {
        border-color: oklch(from var(--color-text) l c h / 12%);
      }
    }
    &:focus {
      border-color: var(--color-accent);
      outline: none;
    }
  }
  .tool-slot {
    display: inline-flex;
  }
  /* a phone: document left, output right in the toolbar; the screen switch floats over the
     top of the canvas instead of taking a row of its own */
  @media (max-width: 767px) {
    .toolbar {
      position: relative;
      z-index: 3;
      grid-template-columns: 1fr auto;
    }
    .center {
      position: absolute;
      top: calc(100% + 0.625rem);
      left: 50%;
      translate: -50% 0;

      :global(.tabs) {
        border: 1px solid oklch(from var(--color-text) l c h / 10%);
        background: oklch(from var(--color-surface) l c h / 72%);
        -webkit-backdrop-filter: blur(1rem);
        backdrop-filter: blur(1rem);
      }
    }
  }
  @media (min-width: 768px) {
    .wf-name {
      display: inline-block;
    }
  }
  @media (min-width: 1024px) {
    .btn-label {
      display: inline-block;
    }
  }
  .statusbar {
    margin: 0;
    padding: 0.375rem 0.75rem;
    color: oklch(from var(--color-text) l c h / 55%);
    border-bottom: 1px solid oklch(from var(--color-text) l c h / 12%);

    &.error {
      color: var(--color-error);
    }
  }
  .layout {
    display: grid;
    min-height: 0;
    flex: 1;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }
  @media (min-width: 768px) {
    .layout {
      grid-template-columns: auto 1fr auto;
      grid-template-rows: 1fr;
    }
  }
  /* a panel is laid out for a column of its own; in the sheet it gets one, at least as tall as
     half the screen so the sheet doesn't jump between a short panel and a long one */
  .sheet-panel {
    display: flex;
    flex-direction: column;
    min-height: 50svh;
    /* the tree is a list of rows: they run to the sheet's edges, past its body padding, like a
       settings list — the rows carry their own inset */
    &.bleed {
      margin-inline: -1rem;
    }
  }
  .side-panel {
    display: none;
    position: relative; /* the resize gutter straddles the panel's inner edge */
    min-height: 0;
  }
  @media (min-width: 768px) {
    .side-panel {
      display: flex;
      flex-direction: column;
    }
  }
  .tree-panel {
    border-inline-end: 1px solid oklch(from var(--color-text) l c h / 12%);
  }
  .right-panel {
    border-inline-start: 1px solid oklch(from var(--color-text) l c h / 12%);
  }
  /* invisible until hovered/dragged — the panel border already draws the seam */
  /* The grab zone is wide and invisible; what shows is a thin line down the seam that fades out
     toward both ends (Shepherd's divider): faint under the pointer, full while dragging. */
  .gutter {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    width: 0.5rem;
    border: none;
    padding: 0;
    background: transparent;
    /* cursor is set inline — it turns single-headed at a clamp, see gutterCursor */
    touch-action: none;

    &::before {
      content: "";
      position: absolute;
      inset-block: 0;
      inset-inline-start: calc(50% - 1px);
      width: 2px;
      background: linear-gradient(
        to bottom,
        transparent,
        var(--color-accent) 30%,
        var(--color-accent) 70%,
        transparent
      );
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    @media (hover: hover) {
      &:hover::before {
        opacity: 0.5;
      }
    }
    &:focus-visible::before,
    &.active::before {
      opacity: 1;
    }
    &:focus-visible {
      outline: none;
    }
  }
  .gutter-tree {
    inset-inline-end: -0.25rem;
  }
  .gutter-right {
    inset-inline-start: -0.25rem;
  }
  .tabs-row {
    --control-height: 2.25rem;
    padding: 0.5rem;
  }
  .panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 0.75rem 0.75rem;
  }
  /* The dial stops shrinking at --canvas-min and scrolls instead — otherwise wide side panels
     (they're resizable) squeeze it down to an unusable disc. The scroller is the whole section,
     so its scrollbar runs along the section's own bottom edge rather than cutting the hint line
     off the dial. The tinted background and the hint stay put (the section doesn't scroll), so
     the hint still wraps to what's visible, not to the scrolled-out canvas width. */
  .canvas-section {
    --canvas-min: 21rem;

    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: oklch(from var(--color-text) l c h / 4%);

    /* on a phone the canvas is the page's own black: a tint here would end in a hard edge
       over the strip the layout keeps for the dock */
    @media (max-width: 767px) {
      background: none;
    }
  }
  /* no align-items/justify-content centering here: flex centering clips whatever overflows past
     the start edge, so the dial is centred by its own auto margins, which don't */
  .canvas-scroll {
    position: absolute;
    inset: 0;
    display: flex;
    overflow: auto;
  }
  /* the sizing box for the watch's case (see watch-case): the display is about three quarters
     of it, so the box is wider than the dial used to be. The strap and crown hang outside the
     box and are cut by .canvas-clip, so they never become something to scroll to. */
  .canvas-clip {
    display: flex;
    flex: 1;
    min-width: max-content;
    min-height: max-content;
    overflow: hidden;
    /* the padding that keeps the watch off the edges lives here now, inside the clip */
    padding: 1.5rem;
  }
  .canvas-frame {
    aspect-ratio: 1;
    width: min(88vh, 100%, 44rem);
    min-width: var(--canvas-min);
    min-height: var(--canvas-min);
    max-height: 100%;
    flex-shrink: 0;
    margin: auto;
  }
  .canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  .canvas-loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: oklch(1 0 0 / 70%);
  }
  /* drawn on the dial, which is black in both colour schemes — so the ink is fixed light, and
     the secondary button (which derives from --color-text) follows it */
  /* the watch's screen is black in either scheme: both inks are pinned, so a button on it
     (ink on background) reads the same in light mode */
  .canvas-empty {
    --color-text: oklch(0.95 0 0);
    --color-background: oklch(0 0 0);

    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.875rem;
    /* keep clear of the disc's edge: text in a circle has less room than its box suggests */
    padding: 18%;
    text-align: center;
    color: var(--color-text);

    h2 {
      margin: 0;
    }
    p {
      margin: 0;
      color: oklch(from var(--color-text) l c h / 55%);
    }
  }
  .canvas-empty-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-self: stretch;
  }
  /* dev only — same overlay treatment as .hint, pinned to the opposite corner. A phone has no
     room for it: the screen switch floats where it would sit */
  .fps {
    position: absolute;
    top: 0.5rem;
    inset-inline-start: 0.5rem;
    z-index: 2;
    margin: 0;
    padding: 0.125rem 0.375rem;
    border-radius: calc(var(--border-radius) - 0.25rem);
    background: oklch(from var(--color-background) l c h / 70%);
    color: oklch(from var(--color-text) l c h / 55%);
    pointer-events: none;

    &.slow {
      color: var(--color-error);
    }
  }
  @media (max-width: 767px) {
    .fps {
      display: none;
    }
  }

  /* a round "?" floating in the canvas's corner; its card opens above it */
  .hint {
    display: none;
    position: absolute;
    inset-inline-end: 0.75rem;
    bottom: 0.75rem;
    z-index: 2;
  }
  .hint-key {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    color: oklch(from var(--color-text) l c h / 70%);
    background: oklch(from var(--color-text) l c h / 8%);
    transition: background-color 0.15s ease;

    /* no disclosure chevron here: the round button is the whole control */
    &::after {
      content: none;
    }
    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 14%);
      }
    }
  }
  .hint[open] .hint-key {
    color: var(--color-background);
    background: var(--color-text);
  }
  .hint-card {
    position: absolute;
    inset-inline-end: 0;
    bottom: calc(100% + 0.5rem);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 17rem;
    padding: 0.875rem;
    border: 1px solid oklch(from var(--color-text) l c h / 14%);
    border-radius: var(--border-radius-tile);
    background: var(--color-surface);
    box-shadow: 0 16px 48px oklch(0 0 0 / 45%);

    ul {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin: 0;
      padding: 0;
      list-style: none;
      color: oklch(from var(--color-text) l c h / 60%);
    }
    li span {
      color: var(--color-text);
    }
  }
  @media (min-width: 768px) {
    .hint {
      display: block;
    }
  }
  .layout {
    position: relative;
  }
  .mobile-actions {
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    z-index: 3;
    display: flex;
    gap: 0.125rem;
    padding: 0.25rem;
    translate: -50% 0;
    border: 1px solid oklch(from var(--color-text) l c h / 10%);
    border-radius: 625rem;
    background: oklch(from var(--color-surface) l c h / 72%);
    -webkit-backdrop-filter: blur(1rem);
    backdrop-filter: blur(1rem);
  }
  .panel-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    width: 4.5rem;
    height: 3.25rem;
    padding: 0;
    border: none;
    border-radius: 625rem;
    background: none;
    color: oklch(from var(--color-text) l c h / 75%);
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-radius var(--spring-transition);

    &:active {
      border-radius: 1rem;
      background: oklch(from var(--color-text) l c h / 10%);
      transition-duration: 0.12s;
    }
  }
  @media (min-width: 768px) {
    .mobile-actions {
      display: none;
    }
  }
</style>
