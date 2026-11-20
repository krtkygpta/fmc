<script lang="ts">
  // The page the "Before you connect" note in the watch panel links to. The prose lives in
  // troubleshooting.md: every claim there is either checkable in device/lib (the protocol) or a
  // report we can point at, and it deliberately stops short of "nothing can go wrong".
  import { marked } from "marked";
  import { Icon } from "$lib/shared/components/icon";
  import { MAX_IMAGE_SIDE, SAFE_IMAGE_SIDE } from "$lib/modules/editor/core/format";
  import { WF_CAPACITY, WF_CAPACITY_PRO3 } from "../lib/ble";
  import { t } from "../i18n";

  // our own file, so {@html} is safe
  const html = $derived(
    marked.parse(
      $t.help
        .replaceAll("{WF_CAPACITY}", String(WF_CAPACITY))
        .replaceAll("{WF_CAPACITY_PRO3}", String(WF_CAPACITY_PRO3))
        .replaceAll("{MAX_IMAGE_SIDE}", String(MAX_IMAGE_SIDE))
        .replaceAll("{SAFE_IMAGE_SIDE}", String(SAFE_IMAGE_SIDE)),
      { async: false },
    ),
  );
</script>

<svelte:head>
  <title>{$t.helpTitle}</title>
  <meta name="description" content={$t.helpDescription} />
</svelte:head>

<div class="page">
  <article class="type-doc">
    {@html html}
    <a class="back" href="/">
      <Icon name="storefront" size={18} />
      {$t.backToFaces}
    </a>
  </article>
</div>

<style>
  .page {
    height: 100%;
    overflow-y: auto;
  }
  article {
    max-width: 44rem;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    color: var(--color-text);
    text-decoration: none;
  }
  article :global {
    h1 {
      margin: 0 0 0.75rem;
    }
    h1 + p {
      color: oklch(from var(--color-text) l c h / 75%);
    }
    h2 {
      margin: 2rem 0 0.75rem;
    }
    p {
      margin: 0 0 0.75rem;
    }
    ul,
    ol {
      margin: 0 0 0.75rem;
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    li::marker {
      color: oklch(from var(--color-text) l c h / 45%);
    }
    .note {
      color: oklch(from var(--color-text) l c h / 55%);
    }
    a {
      color: var(--color-accent);
      text-decoration-color: oklch(from var(--color-accent) l c h / 45%);
    }
    hr {
      margin: 2rem 0 1.5rem;
      border: none;
      border-top: 1px solid oklch(from var(--color-text) l c h / 12%);
    }
  }
</style>
