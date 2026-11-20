// The store's curated shelves — apps and firmware — as effector stores.
//
// Two shelves with the same life: a list fetched once per session, and one record behind a
// detail page. The detail page is a deep link, so it always asks for its record; when the list
// is already here it shows that copy first and the fetch only refreshes it.
import { combine, createEvent, createStore, sample, type Effect, type StoreValue } from "effector";
import { samePackage, type Wp2Package, type Wp2State } from "$lib/modules/device/lib/wp2";
import type { RecordModel } from "pocketbase";
import { bleModel } from "$lib/modules/device/model";
import { flashable, isLoader, recordDevice } from "../lib/firmware";
import { watchDevice } from "$lib/modules/device/lib/ota-image";
import * as storeApi from "./store.api";
import { t } from "../i18n";

type StoreDict = StoreValue<typeof t>;

// a failed download in the reader's language; anything else (offline, a bad package) as it came
const fetchErrText = (dict: StoreDict, e: Error) =>
  e instanceof storeApi.FetchError ? dict.downloadFailed(e.status) : e.message;

export { appDownloadUrl, firmwareDownloadUrl } from "./store.api";

export const $storeErr = createStore("");

function shelf(loadListFx: Effect<void, RecordModel[]>, loadOneFx: Effect<string, RecordModel>) {
  const $list = createStore<RecordModel[]>([]);
  const $loaded = createStore(false);
  const $id = createStore("");
  const $one = createStore<RecordModel | null>(null);
  const listRequested = createEvent();
  const oneRequested = createEvent<string>();

  sample({
    clock: listRequested,
    source: $loaded,
    filter: (loaded) => !loaded,
    target: loadListFx,
  });
  sample({
    clock: loadListFx.doneData,
    target: $list,
  });
  sample({
    clock: loadListFx.done,
    fn: () => true,
    target: $loaded,
  });

  sample({
    clock: oneRequested,
    target: [$id, loadOneFx],
  });
  sample({
    clock: oneRequested,
    source: $list,
    fn: (list, id) => list.find((rec) => rec.id === id) ?? null,
    target: $one,
  });
  // a slow answer for the page you already left must not replace the one you are on
  sample({
    clock: loadOneFx.done,
    source: $id,
    filter: (id, { params }) => id === params,
    fn: (_, { result }) => result,
    target: $one,
  });

  sample({
    clock: [listRequested, oneRequested],
    fn: () => "",
    target: $storeErr,
  });
  // a missing record is the page's own "not found", not an error banner
  sample({
    clock: loadListFx.failData,
    fn: (e) => e.message,
    target: $storeErr,
  });

  return { $list, $one, listRequested, oneRequested };
}

const apps = shelf(storeApi.loadAppsFx, storeApi.loadAppFx);
const firmwares = shelf(storeApi.loadFirmwaresFx, storeApi.loadFirmwareFx);

export const $apps = apps.$list;
export const $app = apps.$one;
export const $appsLoading = storeApi.loadAppsFx.pending;
export const $appLoading = storeApi.loadAppFx.pending;
export const appsRequested = apps.listRequested;
export const appRequested = apps.oneRequested;

export const $firmwares = firmwares.$list;
export const $firmware = firmwares.$one;
export const $firmwaresLoading = storeApi.loadFirmwaresFx.pending;
export const $firmwareLoading = storeApi.loadFirmwareFx.pending;
export const firmwaresRequested = firmwares.listRequested;
export const firmwareRequested = firmwares.oneRequested;

// The firmware page keeps its download behind a tick: an image can brick the watch, and the
// reader should have said so themselves. Asked again for every image.
export const $riskAccepted = createStore(false);
export const riskAcceptedSet = createEvent<boolean>();

sample({
  clock: riskAcceptedSet,
  target: $riskAccepted,
});
sample({
  clock: firmwareRequested,
  fn: () => false,
  target: $riskAccepted,
});

// Flashing from the page: only after the tick, and only an image that's on the record. The bytes are fetched here and handed to the
// device model, which checks them again and owns the watch.
export const flashRequested = createEvent();
// 0–100 while the image comes down, null otherwise — the flash's own progress is the device model's
export const $imageProgress = createStore<number | null>(null);
const imageProgressed = createEvent<number>();

sample({
  clock: imageProgressed,
  target: $imageProgress,
});
export const downloadRequested = createEvent();
export const $imageSaving = storeApi.saveFirmwareImageFx.pending;

sample({
  clock: downloadRequested,
  source: { rec: $firmware, accepted: $riskAccepted },
  filter: ({ rec, accepted }) => Boolean(rec?.image) && accepted,
  fn: ({ rec }) => ({ rec: rec!, onProgress: imageProgressed }),
  target: storeApi.saveFirmwareImageFx,
});
export const $imageFetching = storeApi.fetchFirmwareImageFx.pending;
export const $imageErr = createStore("");

/**
 * The connected watch isn't the one this record is for (a Watch 3 Pro on a Watch Pro 2 image,
 * or a watch FMC doesn't know): the page says so and Install is off. Download stays.
 */
export const $wrongWatch = combine($firmware, bleModel.$bleInfo, (rec, info) =>
  rec && info ? watchDevice(info.name) !== recordDevice(rec.device) : false,
);

sample({
  clock: flashRequested,
  source: { rec: $firmware, accepted: $riskAccepted, wrong: $wrongWatch },
  // a loader package isn't an OTA image (the image gate would refuse it anyway), and another
  // watch's image never leaves the page: the board check in ota-image.ts is the second line
  filter: ({ rec, accepted, wrong }) =>
    Boolean(rec?.image) && !isLoader(rec?.kind) && flashable(rec?.device) && accepted && !wrong,
  fn: ({ rec }) => ({ rec: rec!, onProgress: imageProgressed }),
  target: storeApi.fetchFirmwareImageFx,
});
sample({
  clock: storeApi.fetchFirmwareImageFx.done,
  fn: ({ params, result }) => ({ image: result, device: params.rec.device }),
  target: bleModel.firmwareFlashRequested,
});
sample({
  clock: [storeApi.fetchFirmwareImageFx.failData, storeApi.saveFirmwareImageFx.failData],
  source: t,
  fn: fetchErrText,
  target: $imageErr,
});
sample({
  clock: [flashRequested, downloadRequested, firmwareRequested],
  fn: () => "",
  target: $imageErr,
});
sample({
  clock: [
    storeApi.fetchFirmwareImageFx.finally,
    storeApi.saveFirmwareImageFx.finally,
    storeApi.fetchLoaderPackageFx.finally,
    firmwareRequested,
  ],
  fn: () => null,
  target: $imageProgress,
});

// a result belongs to the page it happened on
sample({
  clock: firmwareRequested,
  target: bleModel.otaReset,
});

// ---- what's on the watch: installed / update available ----
// Every store page asks once a watch is connected, and a connection made while on one asks too. A stock watch costs one unanswered
// request (see Watch.readWp2).
sample({
  clock: [bleModel.connected, appsRequested, appRequested, firmwaresRequested, firmwareRequested],
  source: { info: bleModel.$bleInfo, wp2: bleModel.$wp2 },
  filter: ({ info, wp2 }) => Boolean(info) && !wp2,
  target: bleModel.wp2Requested,
});

// the catalog side of the comparison: each app's package header, fetched once the watch has
// reported something to compare with
const $appHeaders = createStore<Record<string, Wp2Package>>({});

sample({
  clock: [bleModel.$wp2.updates, apps.$list.updates, apps.$one.updates],
  source: { wp2: bleModel.$wp2, list: apps.$list, one: apps.$one, have: $appHeaders },
  filter: ({ wp2 }) => Boolean(wp2) && wp2 !== "stock",
  fn: ({ list, one, have }) => [...list, ...(one ? [one] : [])].filter((rec) => !have[rec.id]),
  target: storeApi.fetchAppHeadersFx,
});
sample({
  clock: storeApi.fetchAppHeadersFx.doneData,
  source: $appHeaders,
  fn: (have, got) => ({ ...have, ...got }),
  target: $appHeaders,
});

export type OnWatch = "installed" | "update";
/** app record id → how its build compares with the one on the watch; absent = not installed */
export const $appsOnWatch = combine(bleModel.$wp2, $appHeaders, (wp2, headers) => {
  const out: Record<string, OnWatch> = {};

  if (!wp2 || wp2 === "stock") return out;
  const installed = Object.values(wp2.apps);

  for (const [id, h] of Object.entries(headers)) {
    const there = installed.find((p) => p.name === h.name);

    if (there) out[id] = samePackage(there, h) ? "installed" : "update";
  }
  return out;
});

// loader records: their package header, for the comparison with the loader on the watch
const $loaderHeaders = createStore<Record<string, Wp2Package>>({});

sample({
  clock: [bleModel.$wp2.updates, firmwares.$list.updates, firmwares.$one.updates],
  source: { wp2: bleModel.$wp2, list: firmwares.$list, one: firmwares.$one, have: $loaderHeaders },
  filter: ({ wp2 }) => Boolean(wp2) && wp2 !== "stock",
  fn: ({ list, one, have }) =>
    [...list, ...(one ? [one] : [])].filter(
      (rec) => isLoader(rec.kind) && rec.image && !have[rec.id],
    ),
  target: storeApi.fetchLoaderHeadersFx,
});
sample({
  clock: storeApi.fetchLoaderHeadersFx.doneData,
  source: $loaderHeaders,
  fn: (have, got) => ({ ...have, ...got }),
  target: $loaderHeaders,
});

// a firmware record against the watch: null when there's nothing to say — no watch, a stock
// watch, another watch's record, an image without the stub (every stock image), or an older one
// than the watch runs. A loader record is
// compared by its build (CRC) with the loader in slot L; an image by its `stub` number.
const stubState = (
  wp2: Wp2State | "stock" | null,
  rec: RecordModel | null,
  loaders: Record<string, Wp2Package>,
): OnWatch | null => {
  if (!rec || !flashable(rec.device)) return null;
  if (isLoader(rec.kind)) {
    const h = loaders[rec.id];

    if (!wp2 || wp2 === "stock" || !h) return null;
    return wp2.loader && samePackage(wp2.loader, h) ? "installed" : "update";
  }
  const stub = Number(rec.stub) || 0;

  if (!wp2 || wp2 === "stock" || !stub) return null;
  if (stub > wp2.stub.version) return "update";
  return stub === wp2.stub.version ? "installed" : null;
};
export const $firmwareOnWatch = combine(bleModel.$wp2, firmwares.$one, $loaderHeaders, stubState);
export const $firmwaresOnWatch = combine(
  bleModel.$wp2,
  firmwares.$list,
  $loaderHeaders,
  (wp2, list, loaders) =>
    Object.fromEntries(list.map((rec) => [rec.id, stubState(wp2, rec, loaders)])),
);

// ---- installing a package: an app from its page, the loader from the firmware shelf ----
// The loader wants the tick, like every firmware record; an app doesn't — it can't touch the
// firmware.
export const appInstallRequested = createEvent();
export const loaderInstallRequested = createEvent();
export const $packageFetching = combine(
  storeApi.fetchAppPackageFx.pending,
  storeApi.fetchLoaderPackageFx.pending,
  (a, b) => a || b,
);

sample({
  clock: appInstallRequested,
  source: apps.$one,
  filter: (rec): rec is RecordModel => Boolean(rec?.package),
  target: storeApi.fetchAppPackageFx,
});
sample({
  clock: loaderInstallRequested,
  source: { rec: $firmware, accepted: $riskAccepted, wrong: $wrongWatch },
  filter: ({ rec, accepted, wrong }) =>
    Boolean(rec?.image) && isLoader(rec?.kind) && flashable(rec?.device) && accepted && !wrong,
  fn: ({ rec }) => ({ rec: rec!, onProgress: imageProgressed }),
  target: storeApi.fetchLoaderPackageFx,
});
sample({
  clock: [storeApi.fetchAppPackageFx.doneData, storeApi.fetchLoaderPackageFx.doneData],
  target: bleModel.packageInstallRequested,
});
sample({
  clock: [storeApi.fetchAppPackageFx.failData, storeApi.fetchLoaderPackageFx.failData],
  source: t,
  fn: fetchErrText,
  target: $imageErr,
});
sample({
  clock: [appInstallRequested, loaderInstallRequested],
  fn: () => "",
  target: $imageErr,
});
// a result belongs to the page it happened on
sample({
  clock: [appRequested, firmwareRequested],
  target: bleModel.installReset,
});
