// The store's curated shelves — apps and firmware: PocketBase API effects.
// Both collections are read-only for everyone but a superuser (see 1754000000_store.js in
// fmc_pocketbase), so there is nothing here but loading.
import { createEffect } from "effector";
import type { RecordModel } from "pocketbase";
import { fileUrl, pb } from "$lib/shared/api";
import { parsePackageHeader, type Wp2Package } from "$lib/modules/device/lib/wp2";

// newest first: the shelf is short and curated, so what just landed is what people come to see
export const loadAppsFx = createEffect(() =>
  pb.collection("apps").getFullList({ sort: "-created,name" }),
);
export const loadAppFx = createEffect((id: string) => pb.collection("apps").getOne(id));

export const loadFirmwaresFx = createEffect(() =>
  pb.collection("firmwares").getFullList({ sort: "-downloads,name" }),
);
export const loadFirmwareFx = createEffect((id: string) => pb.collection("firmwares").getOne(id));

// The image itself, through the download hook so a flash counts as a download. The page's
// Download button goes through here too, to show progress on a 57 MB file.
// A full image is ~57 MB, so the body is read as a stream and `onProgress` gets 0–100 as it comes.
// a failed response carries its status, so the model can say it in the reader's language
export class FetchError extends Error {
  constructor(
    what: string,
    readonly status: number,
  ) {
    super(`couldn't fetch the ${what} (${status})`);
  }
}

export interface ImageFetch {
  rec: RecordModel;
  onProgress: (pct: number) => void;
}
const fetchImage = async ({ rec, onProgress }: ImageFetch) => {
  // a draft (published = false, seen only by a moderator, 1754800000_users_moderator.js) has no
  // download hook — it serves published records only — so its file comes straight, uncounted
  const res = await fetch(rec.published ? firmwareDownloadUrl(rec) : fileUrl(rec, "image"));

  if (!res.ok || !res.body) throw new FetchError("image", res.status);
  const total = Number(res.headers.get("content-length")) || 0;
  const parts: Uint8Array[] = [];
  const reader = res.body.getReader();
  let got = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;
    parts.push(value);
    got += value.length;
    if (total) onProgress(Math.min(99, Math.floor((got / total) * 100)));
  }
  const all = new Uint8Array(got);

  parts.reduce((at, p) => (all.set(p, at), at + p.length), 0);
  onProgress(100);
  return all;
};
export const fetchFirmwareImageFx = createEffect(fetchImage);
// The header of a loader record's package, to compare with the loader the watch reports — only
// the first 64 bytes, straight from the file (looking isn't downloading).
export const fetchLoaderHeadersFx = createEffect(async (recs: RecordModel[]) => {
  const out: Record<string, Wp2Package> = {};

  await Promise.all(
    recs.map(async (rec) => {
      const res = await fetch(fileUrl(rec, "image"), {
        headers: { Range: "bytes=0-63" },
      });

      if (!res.ok) return;
      const h = parsePackageHeader(new Uint8Array(await res.arrayBuffer()).subarray(0, 64));

      if (h) out[rec.id] = h;
    }),
  );
  return out;
});

// A loader record's package, for installing it — the same protected fetch, its own effect so its
// bytes never reach the OTA path
export const fetchLoaderPackageFx = createEffect(fetchImage);
// An app's package, for installing it — public, through the download hook so it counts
export const fetchAppPackageFx = createEffect(async (rec: RecordModel) => {
  const res = await fetch(appDownloadUrl(rec));

  if (!res.ok) throw new FetchError("package", res.status);
  return new Uint8Array(await res.arrayBuffer());
});

// …and saved as a file, under the name it has on the server
export const saveFirmwareImageFx = createEffect(async (job: ImageFetch) => {
  const url = URL.createObjectURL(new Blob([(await fetchImage(job)) as BlobPart]));
  const a = document.createElement("a");

  a.href = url;
  a.download = String(job.rec.image || "firmware.bin");
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

// the hook behind these bumps `downloads` and redirects to the file
export const appDownloadUrl = (rec: RecordModel) => `${pb.baseURL}/api/apps/${rec.id}/download`;
export const firmwareDownloadUrl = (rec: RecordModel) =>
  `${pb.baseURL}/api/firmwares/${rec.id}/download`;

// The 64-byte header at the front of a .wp2app: name, version and image CRC — all a comparison
// with the watch needs, so only those bytes are fetched (PocketBase serves files with Range).
// Straight from the file URL, not the download hook: looking isn't downloading.
export const fetchAppHeadersFx = createEffect(async (apps: RecordModel[]) => {
  const out: Record<string, Wp2Package> = {};

  await Promise.all(
    apps
      .filter((rec) => rec.package)
      .map(async (rec) => {
        const res = await fetch(fileUrl(rec, "package"), { headers: { Range: "bytes=0-63" } });

        if (!res.ok) return;
        const h = parsePackageHeader(new Uint8Array(await res.arrayBuffer()).subarray(0, 64));

        if (h) out[rec.id] = h;
      }),
  );
  return out;
});
