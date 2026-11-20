// What the `kind` and `tested` selects on a firmware record mean to a reader. The keys are the
// schema's values (1754000000_store.js in fmc_pocketbase) and change together with it.
import { DEFAULT_DEVICE } from "$lib/modules/market/lib/devices";
import { OTA_DEVICE } from "$lib/modules/device/lib/ota-image";

// The words for each kind (label, hint) are in ../i18n.ts under `kinds`, by the same key.
const ICONS = {
  patched: "build",
  custom: "science",
  stock: "history",
  // not an OTA image: loader.wp2app, installed over the App Loader's own channel into slot L
  loader: "apps",
  unknown: "memory",
} as const;

export type KindKey = keyof typeof ICONS;

export interface FirmwareKind {
  key: KindKey;
  /** A Material Symbols name. */
  icon: string;
}

/** The App Loader's loader package — installed, never flashed. */
export const isLoader = (kind: unknown) => kind === "loader";

export const firmwareKind = (kind: unknown): FirmwareKind => {
  const key = (Object.hasOwn(ICONS, String(kind)) ? String(kind) : "unknown") as KindKey;

  return { key, icon: ICONS[key] };
};

/** Proven on a physical watch, or only in the emulator — or nobody said. */
export const testedOnHardware = (tested: unknown): boolean => tested === "hardware";
/** The key of its label in the dictionary's `tested`, or null when nobody said. */
export const testedKey = (tested: unknown): "hardware" | "emulator" | null =>
  tested === "hardware" || tested === "emulator" ? tested : null;

/**
 * The one watch FMC can flash: the OTA path (Watch.flashFirmware, ota-image.ts) is the Watch Pro
 * 2's alone. A record that doesn't name a device is for DEFAULT_DEVICE, like a face.
 */
export { OTA_DEVICE } from "$lib/modules/device/lib/ota-image";
export const recordDevice = (device: unknown): string => String(device || DEFAULT_DEVICE);
export const flashable = (device: unknown) => recordDevice(device) === OTA_DEVICE;
