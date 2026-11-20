<script lang="ts">
  // The FMC Companion phone app: what it does and where to get it. The facts come from the
  // companion repo's README and docs/apps.md — keep them in step with it.
  import { Button } from "$lib/shared/components/button";
  import { Icon } from "$lib/shared/components/icon";
  import { Page } from "$lib/shared/components/page";
  import { t } from "../i18n";

  const REPO = "https://github.com/fmctools/companion";
  // ponytail: GitHub's "latest release" page, not the .apk itself — the asset's name carries the
  // versionCode, so a direct link needs an API call; resolve it from api.github.com if one tap matters
  const APK = `${REPO}/releases/latest`;
  const TESTFLIGHT = "https://testflight.apple.com/join/ByWsMnfD";

  const features = [
    { key: "store", icon: "storefront" },
    { key: "apps", icon: "apps" },
    { key: "services", icon: "cell_tower" },
    { key: "firmware", icon: "system_update" },
    { key: "pairing", icon: "link" },
  ] as const;
</script>

<svelte:head>
  <title>FMC Companion — FMC</title>
  <meta
    name="description"
    content="FMC Companion: the phone app for the CMF Watch Pro 2 and the FMC store. Watch faces, watch apps, phone services and firmware updates."
  />
</svelte:head>

<Page>
  <article>
    <h1 class="type-title">FMC Companion</h1>
    <p class="lead">
      {$t.lead}
    </p>

    <div class="actions">
      <Button href={APK} external size="large">
        <Icon name="android" />
        {$t.downloadApk}
      </Button>
      <Button href={TESTFLIGHT} external kind="secondary" size="large">
        <Icon name="phone_iphone" />
        iOS TestFlight
      </Button>
    </div>

    <p class="beta type-small">
      <strong>{$t.betaStrong}</strong>
      {$t.betaText}
      <a href="{REPO}/issues" target="_blank" rel="noopener noreferrer">{$t.tellUs}</a>{$t.betaEnd}
    </p>

    <ul class="features">
      {#each features as f (f.key)}
        <li>
          <span class="glyph"><Icon name={f.icon} size={22} /></span>
          <span>
            <strong>{$t.features[f.key].title}</strong>
            <span class="text">{$t.features[f.key].text}</span>
          </span>
        </li>
      {/each}
    </ul>

    <h2 class="type-heading">{$t.beforeStart}</h2>
    <ul class="notes">
      <li>{$t.noteDevice}</li>
      <li>{$t.noteNothingX}</li>
      <li>{$t.noteCi}</li>
    </ul>

    <footer>
      <a href={REPO} target="_blank" rel="noopener noreferrer">
        <Icon name="code" size={18} />
        {$t.sourceOnGithub}
        <Icon name="open_in_new" size={16} />
      </a>
      <a href="/privacy">
        <Icon name="shield" size={18} />
        {$t.privacy}
      </a>
    </footer>
  </article>
</Page>

<style>
  article {
    max-width: 40rem;
    margin: 0 auto;
    padding: 2rem 1rem 3rem;
  }
  h1 {
    margin: 0 0 0.5rem;
  }
  h2 {
    margin: 2rem 0 0.75rem;
  }
  .lead {
    margin: 0 0 1.5rem;
    color: oklch(from var(--color-text) l c h / 75%);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    /* grow to share the row, never shrink under the label: two that don't fit side by side
       wrap onto rows of their own instead of cutting a label into the button's padding */
    & :global(.btn) {
      flex: 1 0 auto;
    }
  }
  .beta {
    margin: 1rem 0 0;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);
  }
  a {
    color: var(--color-accent);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;

    li {
      display: flex;
      gap: 0.75rem;
    }
    strong {
      display: block;
    }
  }
  .text {
    color: oklch(from var(--color-text) l c h / 70%);
  }
  .glyph {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: oklch(from var(--color-text) l c h / 6%);
    color: var(--color-accent);
  }
  .notes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-left: 1.25rem;
    list-style: disc;

    li::marker {
      color: oklch(from var(--color-text) l c h / 45%);
    }
  }
  footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    margin-top: 2rem;

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-text);
      text-decoration: none;
    }
  }
</style>
