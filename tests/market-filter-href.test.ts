import { test, expect } from "vitest";
import { filterHref } from "../src/lib/modules/market/lib/filter-href";

test("filters round-trip through the query, defaults left out", () => {
  const base = "https://fmc.tools/";

  expect(filterHref(base, "shelf", "mine")).toBe("/?mine");
  expect(filterHref(`${base}?mine&sort=popular`, "shelf", "liked")).toBe("/?sort=popular&liked");
  expect(filterHref(`${base}?mine`, "shelf", "all")).toBe("/");
  expect(filterHref(`${base}?liked`, "device", "pro2")).toBe("/?liked&device=pro2");
  expect(filterHref(`${base}?sort=popular`, "sort", "new")).toBe("/");
  expect(filterHref(base, "q", "  ")).toBe("/");
  expect(filterHref(base, "q", "dos watch")).toBe("/?q=dos+watch");
});
