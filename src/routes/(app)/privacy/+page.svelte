<script lang="ts">
  // The privacy policy of the site and of FMC Companion, which links here from the App Store and TestFlight.
  // The same text is companion's PRIVACY.md (github.com/fmctools/companion); change both together.
  import { marked } from "marked";
  import { t } from "../../i18n";

  // our own files, so {@html} is safe
  const html = $derived(marked.parse($t.privacy, { async: false }));
</script>

<svelte:head>
  <title>{$t.privacyTitle}</title>
  <meta name="description" content={$t.privacyDescription} />
</svelte:head>

<div class="page">
  <article class="type-doc">{@html html}</article>
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
    h3 {
      margin: 1.5rem 0 0.5rem;
    }
    p {
      margin: 0 0 0.75rem;
    }
    ul {
      margin: 0 0 0.75rem;
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    li::marker {
      color: oklch(from var(--color-text) l c h / 45%);
    }
    a {
      color: var(--color-accent);
      text-decoration-color: oklch(from var(--color-accent) l c h / 45%);
    }
  }
</style>
