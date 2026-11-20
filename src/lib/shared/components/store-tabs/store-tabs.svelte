<script lang="ts">
  import { common as t } from "$lib/shared/i18n";
  // The store's sections, as the page's own title: every shelf page opens with this row. It is
  // the app's segmented control (tabs/) with a link per section — each section is a route. On a
  // phone the four split the full width, so nothing is cut off and nothing scrolls.
  import { page } from "$app/state";
  import { MediaQuery } from "svelte/reactivity";
  import { Tabs } from "../tabs";

  const path = $derived(page.url.pathname);
  const phone = new MediaQuery("(max-width: 767px)");
  const sections = $derived([
    // "Faces", not "Watchfaces": four titles have to fit one row on a phone
    { value: "faces", label: $t.faces, href: "/" },
    { value: "apps", label: $t.apps, href: "/apps" },
    { value: "firmware", label: $t.firmware, href: "/firmware" },
    { value: "community", label: $t.community, href: "/community" },
  ]);
  const current = $derived(
    path.startsWith("/apps")
      ? "apps"
      : path.startsWith("/firmware")
        ? "firmware"
        : path.startsWith("/community")
          ? "community"
          : "faces",
  );
</script>

<!-- named for the page transition (global.css): the row holds still between two shelves, and
     its thumb slides instead of fading with the page -->
<Tabs
  items={sections}
  value={current}
  full={phone.current}
  label={$t.storeSections}
  transition="store-tabs"
/>
