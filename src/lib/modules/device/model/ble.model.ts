// Web Bluetooth: watch connection and flashing.
import { noticeOf } from "../lib/notice";
import { attach, combine, createEffect, createEvent, createStore, sample } from "effector";
import { reset } from "patronum";
import {
  NoFreeSlotError,
  Watch,
  type WatchDials,
  type WatchInfo,
  type WatchSlots,
} from "../lib/ble";
import { checkOtaTarget } from "../lib/ota-image";
import type { Wp2State } from "../lib/wp2";
import { rememberDial, unclaimDial } from "../lib/catalog-names";
import { assertFlashable, flashWarning } from "$lib/modules/editor/core/format";
import { dbg, dbgListeners, errText } from "../lib/ble-protocol";
import * as bleApi from "./ble.api";
import { t } from "../i18n";
import { bleText, bt } from "../messages";

// what a flash needs: the file, a thumbnail of the face so the watch's id list can show it
// later (the file itself never reaches catalog-names), and a key identifying the face across
// flashes — a marketplace record id, falling back to the name inside the file
export interface FlashPayload {
  bin: Uint8Array;
  preview?: string;
  key?: string;
}

export type { WatchDials };

// a file the watch may not survive, held back until the user accepts the risk in the size dialog
class NeedsConfirmError extends Error {}
// neither is a failed flash: each opens a dialog that turns it into another attempt
const asksUser = (e: Error) => e instanceof NoFreeSlotError || e instanceof NeedsConfirmError;

type Pending = FlashPayload & { slot?: number; confirmed?: boolean };

let watch: Watch | null = null; // live connection — not serialized, lives outside the store

// ---- stores ----
export const $bleStatus = createStore("");
// $bleStatus stays English (it is compared, and goes to the log); this is what a reader sees
export const $bleStatusText = combine($bleStatus, bt, (s, w) => bleText(w, s));
// the status as the watch panel shows it (see lib/notice)
export const $bleNotice = $bleStatusText.map(noticeOf);
export const $bleInfo = createStore<WatchInfo | null>(null);
// installed watchfaces: what a055 reported, plus the ones this browser side-loaded onto this
// watch — the firmware leaves those out of its own list
export const $dials = createStore<WatchDials | null>(null);
// "N of M": the a055 header's count and capacity, or the merged list and the model's guess
export const $slots = createStore<WatchSlots | null>(null);
// a flash appends into a free slot; when the watch has none, the file waits here while the
// user picks which dial to overwrite in the slot dialog
export const $slotDialogOpen = createStore(false);
const $pendingBin = createStore<Pending | null>(null);
// the risk the user is asked to accept before an oversized face goes out — null while not asking
export const $sizeWarning = createStore<string | null>(null);
// the watch a flash went to: $bleInfo resets the moment the link drops, which is before a flash
// cut off by that drop fails — so the outcome reads who it was from here, not from $bleInfo
const $flashWatch = createStore<WatchInfo | null>(null);
export const $forgetting = bleApi.forgetFx.pending;

// ---- events ----
const statusChanged = createEvent<string>();
const disconnected = createEvent();
const dialsChanged = createEvent<WatchDials>();
const slotsChanged = createEvent<WatchSlots>();
export const connectRequested = createEvent();
export const flashRequested = createEvent<FlashPayload>();
export const slotPicked = createEvent<number>();
export const slotDialogClosed = createEvent();
export const sizeConfirmed = createEvent();
export const sizeWarningClosed = createEvent();
// the user says a dial flashed from here is gone — deleted on the watch or in Nothing X, which
// FMC never hears about: a055 doesn't list side-loaded dials, so their slot is only a local claim
export const dialRemoved = createEvent<number>();
// cross-module signals (market.model bumps the download counter on a successful flash,
// analytics.model counts both) — exposed as events, not the effects themselves, so other models
// react without touching connectFx/flashFx. They carry the connected watch because who it was is
// part of what happened.
export const connected = createEvent<WatchInfo>();
export const flashDone = createEvent<WatchInfo | null>();
export const flashFailed = createEvent<{
  watch: WatchInfo | null;
  error: Error;
}>();
export const forgetRequested = createEvent();

// ---- effects ----
// connectFx/flashFx stay here instead of moving to ble.api.ts: they aren't request/response
// calls, they drive a live connection and push a stream of status/dials events into the model
// mid-flight (via the Watch constructor callback) — an api.ts effect calling model events would
// just invert the dependency, not remove the coupling.
const connectFx = createEffect(async () => {
  const w = new Watch((s: string) => {
    statusChanged(s);
    if (s === "disconnected") {
      watch = null;
      disconnected();
    }
  });

  w.onDials = (dials, slots) => {
    dialsChanged(dials);
    slotsChanged(slots);
  };
  const info = await w.connect();

  watch = w;
  // console hook for inspecting a live connection (installedWf, codec, chars). Read-only in
  // spirit: sending hand-built commands from here is what bricked a watch once, see ble.ts
  (window as { fmcWatch?: Watch }).fmcWatch = w;
  return info;
});
export const $connecting = connectFx.pending;
const flashFx = createEffect(async ({ bin, preview, key, slot, confirmed }: Pending) => {
  // every install — editor and marketplace — comes through here, so this is the one gate
  assertFlashable(bin);
  const warning = confirmed ? null : flashWarning(bin);

  if (warning) throw new NeedsConfirmError(warning);
  const { id, name } = await watch!.uploadWatchface(bin, slot, key);

  // the watch will only ever report this dial by its id — this is the one moment the name
  // and the picture are both in hand. The serial goes with them: a055 won't list this dial on
  // the next connection, so this record is what keeps its slot counted (see mergeDials)
  rememberDial(id, name, preview, watch!.serial);
  // …and only now does the merged dial list know about it, so refresh it
  watch!.mergeDials();
  return id;
});
export const $flashing = flashFx.pending;
const removeDialFx = createEffect((id: number) => {
  unclaimDial(id);
  watch?.mergeDials();
});

// ---- firmware update ----
// Only a Watch Pro 2: the protocol and the images are that board's (JX402), and nothing about
// another model's OTA is known. checkOtaTarget matches the image's board to the watch (by its
// advertised name, the only model id there is) and to the record's `device`.
export interface FirmwareFlash {
  image: Uint8Array;
  /** The firmware record's `device`; empty means DEFAULT_DEVICE. */
  device: unknown;
}
// the community guide's floor: a watch that dies mid-install is the one case with no way back
export const OTA_MIN_BATTERY = 50;

export const $otaProgress = createStore<number | null>(null);
export const $otaResult = createStore<"done" | null>(null);
export const $otaError = createStore("");
const otaProgressed = createEvent<number>();
export const firmwareFlashRequested = createEvent<FirmwareFlash>();
export const otaReset = createEvent();

const flashFirmwareFx = attach({
  source: t,
  effect: async (t, { image, device }: FirmwareFlash) => {
    if (!watch) throw new Error(t.connectFirstErr);
    const info = checkOtaTarget(image, watch.name, device);

    if (watch.battery !== null && watch.battery < OTA_MIN_BATTERY)
      throw new Error(t.lowBattery(watch.battery, OTA_MIN_BATTERY));
    dbg("ota image:", info);
    await watch.flashFirmware(image, otaProgressed);
  },
});
export const $otaFlashing = flashFirmwareFx.pending;

sample({
  clock: firmwareFlashRequested,
  target: flashFirmwareFx,
});
sample({
  clock: otaProgressed,
  target: $otaProgress,
});
sample({
  clock: flashFirmwareFx.done,
  fn: () => "done" as const,
  target: $otaResult,
});
sample({
  clock: flashFirmwareFx.failData,
  source: bt,
  fn: (w, e) => bleText(w, e.message),
  target: $otaError,
});
reset({
  clock: [firmwareFlashRequested, otaReset],
  target: [$otaProgress, $otaResult, $otaError],
});

// ---- what the App Loader firmware reports ----
// null: not asked yet, or the link is gone; `stock`: asked, and the watch has no stub
export const $wp2 = createStore<Wp2State | "stock" | null>(null);
export const wp2Requested = createEvent();
const readWp2Fx = createEffect(async () => {
  if (!watch) throw new Error("not connected");
  return (await watch.readWp2()) ?? ("stock" as const);
});
export const $wp2Reading = readWp2Fx.pending;

sample({
  clock: wp2Requested,
  source: readWp2Fx.pending,
  filter: (busy) => !busy,
  target: readWp2Fx,
});
sample({
  clock: readWp2Fx.doneData,
  target: $wp2,
});
// a flash rewrote what the watch runs, and the watch restarts after it — ask again on reconnect
reset({ clock: [disconnected, flashFirmwareFx.done], target: $wp2 });

// ---- installing a .wp2app (an app, or the loader) ----
export const $installProgress = createStore<number | null>(null);
export const $installed = createStore<string | null>(null); // the name, once it's in
export const $installError = createStore("");
const installProgressed = createEvent<number>();
export const packageInstallRequested = createEvent<Uint8Array>();
export const installReset = createEvent();

const installPackageFx = attach({
  source: t,
  effect: async (t, data: Uint8Array) => {
    if (!watch) throw new Error(t.connectFirstErr);
    // fresh: the slot choice depends on what's there now, not on what was there at connect
    const state = await watch.readWp2();

    if (!state) throw new Error(t.stockFirmwareErr);
    const { name } = await watch.installPackage(data, state, installProgressed);

    return { name, state: (await watch.readWp2()) ?? ("stock" as const) };
  },
});
export const $installing = installPackageFx.pending;

sample({
  clock: packageInstallRequested,
  source: installPackageFx.pending,
  filter: (busy) => !busy,
  fn: (_, data) => data,
  target: installPackageFx,
});
sample({
  clock: installProgressed,
  target: $installProgress,
});
sample({
  clock: installPackageFx.doneData,
  fn: ({ name }) => name,
  target: $installed,
});
// the badges read $wp2, so the re-read after the install is what turns "Update" into "Installed"
sample({
  clock: installPackageFx.doneData,
  fn: ({ state }) => state,
  target: $wp2,
});
sample({
  clock: installPackageFx.failData,
  source: bt,
  fn: (w, e) => bleText(w, e.message),
  target: $installError,
});
reset({ clock: installPackageFx.finally, target: $installProgress });
reset({
  clock: [packageInstallRequested, installReset, disconnected],
  target: [$installed, $installError],
});

// ---- the log ----
// what ble.ts said (status lines included — Watch.status logs them), for a browser without devtools (an iOS BLE browser):
// the watch panel's Copy log hands it over. ponytail: last 300 lines, in memory only
export const $log = createStore<string[]>([]);
const logged = createEvent<string>();

dbgListeners.add(logged);
sample({
  clock: logged,
  source: $log,
  fn: (log, line) => [...log.slice(-299), line],
  target: $log,
});

// ---- business logic ----
sample({
  clock: statusChanged,
  target: $bleStatus,
});

sample({
  clock: connectFx.failData,
  // errText: an iOS BLE browser rejects with non-Errors, whose .message is undefined
  fn: (e) => `error: ${errText(e)}`,
  target: statusChanged,
});

// one picker at a time: a second requestDevice while one is open is what a double tap on iOS
// sends, and a Web BLE browser rejects it
sample({
  clock: connectRequested,
  source: connectFx.pending,
  filter: (busy) => !busy,
  target: connectFx,
});

sample({
  clock: connectFx.doneData,
  target: [$bleInfo, connected],
});
reset({ clock: [connectFx, disconnected], target: $bleInfo });

sample({
  clock: dialsChanged,
  target: $dials,
});
sample({
  clock: dialRemoved,
  target: removeDialFx,
});
sample({
  clock: slotsChanged,
  target: $slots,
});
reset({ clock: disconnected, target: [$dials, $slots] });

sample({
  clock: flashFx.failData,
  // a full watch or an oversized face isn't an error — the dialogs below handle them
  filter: (e) => !asksUser(e),
  fn: (e) => `error: ${e.message}`,
  target: statusChanged,
});

// flash appends into a free slot…
sample({
  clock: flashRequested,
  target: $pendingBin,
});
sample({
  clock: flashRequested,
  target: flashFx,
});
// …and only when the watch has none does it ask which dial to overwrite
sample({
  clock: flashFx.failData,
  filter: (e) => e instanceof NoFreeSlotError,
  fn: () => true,
  target: $slotDialogOpen,
});
sample({
  clock: slotPicked,
  source: $pendingBin,
  filter: Boolean,
  fn: (pending, slot) => ({ ...pending, slot }),
  target: flashFx,
});
reset({
  clock: [slotPicked, slotDialogClosed, flashFx.done, disconnected],
  target: $slotDialogOpen,
});
// the bin outlives the dialog on purpose — slotPicked re-runs flashFx with it
// an oversized face waits for the user to accept the risk; accepting re-runs it marked as such,
// and pending keeps the mark so the slot dialog's retry doesn't ask a second time
sample({
  clock: flashFx.failData,
  source: bt,
  filter: (_, e) => e instanceof NeedsConfirmError,
  fn: (w, e) => bleText(w, e.message),
  target: $sizeWarning,
});
sample({
  clock: sizeConfirmed,
  source: $pendingBin,
  filter: Boolean,
  fn: (pending) => ({ ...pending, confirmed: true }),
  target: [$pendingBin, flashFx],
});
// the dialog also reports a close when accepting shut it — only a close while it still asks is a no
const sizeDeclined = sample({
  clock: sizeWarningClosed,
  source: $sizeWarning,
  filter: Boolean,
});

reset({
  clock: [sizeConfirmed, sizeWarningClosed, disconnected],
  target: $sizeWarning,
});
reset({
  clock: [slotDialogClosed, sizeDeclined, flashFx.done, disconnected],
  target: $pendingBin,
});

sample({
  clock: flashFx,
  source: $bleInfo,
  target: $flashWatch,
});
sample({
  clock: flashFx.done,
  source: $flashWatch,
  target: flashDone,
});
sample({
  clock: flashFx.failData,
  source: $flashWatch,
  // not failures either — the dialogs above turn them into another attempt
  filter: (_watch, e) => !asksUser(e),
  fn: (watch, error) => ({ watch, error }),
  target: flashFailed,
});

sample({
  clock: forgetRequested,
  target: bleApi.forgetFx,
});
sample({
  clock: bleApi.forgetFx.doneData,
  source: t,
  fn: (t, n) => (n ? t.forgot(n) : t.nothingToForget),
  target: statusChanged,
});
sample({
  clock: bleApi.forgetFx.failData,
  fn: (e) => `error: ${e.message}`,
  target: statusChanged,
});
