// The Developer panel (behind a button in the watch panel): a local build — an app or App Loader
// .wp2app, or an OTA firmware image — onto the watch straight from disk, through the same gates as the store (planInstall for a package,
// checkOtaTarget + the battery floor for an image). The file is held as a handle, not as bytes:
// "Install again" after a rebuild reads the file anew, no second pick.
import { attach, createEffect, createEvent, createStore, sample } from "effector";
import { reset } from "patronum";
import { inspectOtaImage, OTA_DEVICE } from "../lib/ota-image";
import { parsePackageHeader } from "../lib/wp2";
import * as ble from "./ble.model";
import { t } from "../i18n";

export interface LocalBuild {
  name: string;
  size: number;
  /** ms since epoch — the panel shows it so a stale build is visible before it goes out */
  modified: number;
  kind: "package" | "firmware";
  /** one line: what the file says it is */
  what: string;
}

/** What a file is, by its own header; throws when it's neither a .wp2app nor an AOTA image. */
export function sniff(d: Uint8Array): Pick<LocalBuild, "kind" | "what"> {
  const pkg = parsePackageHeader(d);

  if (pkg)
    return {
      kind: "package",
      what: `${pkg.kind === 1 ? "App Loader" : "app"} “${pkg.name}” v${pkg.version}`,
    };
  if (new TextDecoder().decode(d.subarray(0, 4)) !== "AOTA")
    throw new Error("neither a .wp2app nor an OTA image");
  const ota = inspectOtaImage(d);

  return {
    kind: "firmware",
    what: `firmware ${ota.version} for board ${ota.board}`,
  };
}

// Chromium only, like Web Bluetooth itself, and not in TS's DOM lib yet
type Picker = (o: object) => Promise<FileSystemFileHandle[]>;

const pickFx = attach({
  source: t,
  effect: async (t) => {
    const [h] = await (window as unknown as { showOpenFilePicker: Picker }).showOpenFilePicker({
      types: [
        {
          description: t.filePickerDesc,
          accept: { "application/octet-stream": [".wp2app", ".bin"] },
        },
      ],
    });

    return h;
  },
});
const readFx = createEffect(
  async ({ handle }: { handle: FileSystemFileHandle; install: boolean }) => {
    const f = await handle.getFile();
    const data = new Uint8Array(await f.arrayBuffer());

    return {
      data,
      build: {
        name: f.name,
        size: f.size,
        modified: f.lastModified,
        ...sniff(data),
      },
    };
  },
);

export const pickRequested = createEvent();
export const installRequested = createEvent();
export const riskAcceptedSet = createEvent<boolean>();

const $handle = createStore<FileSystemFileHandle | null>(null);
export const $build = createStore<LocalBuild | null>(null);
// an image can brick the watch: the tick, as on the firmware page — kept across reinstalls of
// the same file, asked again for the next one
export const $riskAccepted = createStore(false);
export const $error = createStore("");
export const $reading = readFx.pending;

sample({
  clock: pickRequested,
  target: pickFx,
});
sample({
  clock: pickFx.doneData,
  target: $handle,
});
sample({
  clock: pickFx.doneData,
  fn: (handle) => ({ handle, install: false }),
  target: readFx,
});
sample({
  clock: installRequested,
  source: $handle,
  filter: Boolean,
  fn: (handle) => ({ handle, install: true }),
  target: readFx,
});
sample({
  clock: readFx.doneData,
  fn: ({ build }) => build,
  target: $build,
});
sample({
  clock: riskAcceptedSet,
  target: $riskAccepted,
});
reset({ clock: pickFx.done, target: [$riskAccepted, $build] });
// the previous result belongs to the previous attempt
sample({
  clock: [pickFx.done, installRequested],
  target: [ble.installReset, ble.otaReset],
});

const toWatch = sample({
  clock: readFx.done,
  filter: ({ params }) => params.install,
  fn: ({ result }) => result,
});

sample({
  clock: toWatch,
  filter: ({ build }) => build.kind === "package",
  fn: ({ data }) => data,
  target: ble.packageInstallRequested,
});
sample({
  clock: toWatch,
  source: $riskAccepted,
  filter: (accepted, { build }) => accepted && build.kind === "firmware",
  // a local image has no record: it's for the one watch FMC flashes, and checkOtaTarget still
  // matches its board to the watch on the line
  fn: (_, { data }) => ({ image: data, device: OTA_DEVICE }),
  target: ble.firmwareFlashRequested,
});

sample({
  clock: [pickFx.failData, readFx.failData],
  // closing the picker isn't an error
  filter: (e) => e.name !== "AbortError",
  fn: (e) => e.message,
  target: $error,
});
reset({ clock: [pickRequested, installRequested], target: $error });

// open from the watch panel's Developer button, so a store rather than either component's $state
export const panelOpened = createEvent();
export const panelClosed = createEvent();
export const $open = createStore(false)
  .on(panelOpened, () => true)
  .on(panelClosed, () => false);

// what's on the watch, for the panel's table: asked on open and on every connection
sample({
  clock: [panelOpened, ble.connected],
  source: { info: ble.$bleInfo, wp2: ble.$wp2 },
  filter: ({ info, wp2 }) => Boolean(info) && !wp2,
  target: ble.wp2Requested,
});
