// Every sentence the watch connection can show has a translation (device/messages.ts). The
// libraries keep writing English, and the translation finds each sentence by its English text —
// so a message added or reworded in lib/ without a rule here fails this test, instead of
// quietly showing up in English.
import { expect, test } from "vitest";
import { i18nModel } from "$lib/shared/i18n";
import { bleText, bt } from "$lib/modules/device/messages";
import ble from "$lib/modules/device/lib/ble.ts?raw";
import ota from "$lib/modules/device/lib/ota-image.ts?raw";
import wp2 from "$lib/modules/device/lib/wp2.ts?raw";
import bin from "$lib/modules/editor/core/format/bin.ts?raw";

// protocol internals nobody acts on: shown as they are, inside a translated "decode: …"
const TECHNICAL =
  /^(short chunk request|chunk request out of bounds|bad frame header|payload too short|crc mismatch|7 \(7B\))/;

/** The string literals handed to status(), an Error, need() or fail(), with every `${…}` as 7. */
function sentences(src: string, calls: RegExp) {
  const out: string[] = [];

  for (const m of src.matchAll(calls)) {
    const lit = m[1].replace(/\$\{(?:[^{}]|\{[^}]*\})*\}/g, "7").replace(/`\s*\+\s*`/g, "");

    out.push(lit.slice(1, -1));
  }
  return out;
}
const LIT = String.raw`("[^"]*"|\x60[^\x60]*\x60(?:\s*\+\s*\x60[^\x60]*\x60)*)`;

test("every status and error from the watch libraries has a translation", () => {
  i18nModel.localePicked("ru");
  const w = bt.getState();
  const said = [
    ...sentences(ble + ota + wp2, new RegExp(String.raw`(?:status|Error)\(\s*` + LIT, "g")),
    ...sentences(
      bin.slice(bin.indexOf("export function assertFlashable")),
      new RegExp(String.raw`(?:Error\(|\?)\s*` + LIT, "g"),
    ),
  ].filter((s) => !TECHNICAL.test(s) && s.length > 6);

  expect(said.length).toBeGreaterThan(40);
  const missed = said.filter((s) => bleText(w, s) === s);

  expect(missed).toEqual([]);
  i18nModel.localePicked("en");
});

test("the reasons inside a sentence are translated, and the error prefix survives", () => {
  i18nModel.localePicked("es");
  const w = bt.getState();

  expect(bleText(w, "error: Error: the watch refused 0xb1: busy")).toBe(
    "error: el reloj rechazó 0xb1: ocupado",
  );
  expect(bleText(w, "can't install this package: body checksum")).toBe(
    "no se puede instalar este paquete: suma de comprobación de los datos",
  );
  expect(bleText(w, "uploading “Dots”… 42%")).toBe("enviando «Dots»… 42%");
  expect(bleText(w, "something nobody wrote a rule for")).toBe("something nobody wrote a rule for");
  i18nModel.localePicked("en");
  expect(bleText(bt.getState(), "connected")).toBe("connected");
});
