// The store shelf's filters as query params: ?mine / ?liked (a bare flag, the shelf), device,
// sort and q. A filter at its default is left out, so the plain shelf stays a plain "/".
export type FilterKey = "shelf" | "device" | "sort" | "q";

export const FILTER_DEFAULTS: Record<Exclude<FilterKey, "shelf">, string> = {
  device: "",
  sort: "new",
  q: "",
};

/** `href` with one filter set to `value`, as a path + query for goto() */
export function filterHref(href: string, key: FilterKey, value: string): string {
  const url = new URL(href);
  const params = url.searchParams;

  if (key === "shelf") {
    params.delete("mine");
    params.delete("liked");
    if (value !== "all") params.set(value, "");
  } else if (value.trim() === FILTER_DEFAULTS[key]) params.delete(key);
  else params.set(key, value);
  // a bare flag reads ?mine, not ?mine=
  const search = params.toString().replace(/=(?=&|$)/g, "");

  return url.pathname + (search ? `?${search}` : "");
}
