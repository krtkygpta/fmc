<script lang="ts">
  // The Community page's body: one panel of links. What is listed is data — see lib/community.ts.
  import { Icon } from "$lib/shared/components/icon";
  import { AUTHOR_LINKS, COMMUNITY_LINKS } from "../../lib/community";
  import { t } from "../../i18n";

  // a link's words in the current language; one the dictionary doesn't know keeps its own
  const words = (link: { id: string; title: string; description: string }) =>
    $t.links[link.id] ?? link;
</script>

<section class="panel">
  <h2 class="type-heading">{$t.joinCommunity}</h2>
  <p class="lead">{$t.communityLead}</p>

  <ul>
    {#each COMMUNITY_LINKS as link (link.id)}
      <li>
        {#if link.url}
          {@const external = !link.url.startsWith("/")}
          {@const w = words(link)}
          <a
            class="tile"
            href={link.url}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {#if link.brand}
              <span
                class="glyph logo"
                class:tinted={link.brand.color}
                style:--brand={link.brand.color}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  ><path d={link.brand.path} /></svg
                >
              </span>
            {:else}
              <span class="glyph"><Icon name={link.icon} size={24} /></span>
            {/if}
            <span class="text">
              <span class="title type-subtitle">{w.title}</span>
              {#if w.description}<span class="desc type-caption">{w.description}</span>{/if}
            </span>
            <Icon name={external ? "open_in_new" : "chevron_right"} size={20} class="out" />
          </a>
        {:else}
          <div class="tile soon" aria-disabled="true">
            <span class="glyph"><Icon name={link.icon} size={24} /></span>
            <span class="text">
              <span class="title type-subtitle">{words(link).title}</span>
              <span class="desc type-caption">{$t.comingSoon}</span>
            </span>
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  <h2 class="author type-heading">{$t.madeBy("freethinkel")}</h2>
  <p class="lead">{$t.authorLead}</p>

  <ul>
    {#each AUTHOR_LINKS.filter((l) => l.url) as link (link.id)}
      <li>
        <!-- rel="me" lets Mastodon verify this site on the profile -->
        <a class="tile" href={link.url} target="_blank" rel="me noopener noreferrer">
          <span class="glyph brand">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
              ><path d={link.path} /></svg
            >
          </span>
          <span class="text">
            <span class="title type-subtitle">{link.title}</span>
            <span class="desc type-caption">{link.handle}</span>
          </span>
          <Icon name="open_in_new" size={20} class="out" />
        </a>
      </li>
    {/each}
  </ul>
</section>

<style>
  .panel {
    max-width: 36rem;
    margin-inline: auto;
    padding: 1.5rem 1rem;
  }
  h2 {
    margin: 0;

    &.author {
      margin-top: 2rem;
    }
  }
  .lead {
    margin: 0.25rem 0 1rem;
    color: oklch(from var(--color-text) l c h / 60%);
  }
  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .tile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem;
    border-radius: var(--border-radius-tile);
    background: oklch(from var(--color-text) l c h / 7%);
    color: inherit;
    text-decoration: none;

    &.soon {
      opacity: 0.55;
    }
  }
  a.tile {
    transition: background-color 0.15s ease;

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 9%);
      }
    }
    &:focus-visible {
      outline: 2px solid var(--color-accent);
    }
  }
  .glyph {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: var(--color-text);
    color: var(--color-background);

    &.brand {
      background: oklch(from var(--color-text) l c h / 10%);
      color: var(--color-text);

      & svg {
        width: 1.375rem;
        height: 1.375rem;
      }
    }
    /* a network's own logo on the network's colour; the logo is white or black by that
       colour's lightness, the same rule as --color-on-accent (tokens.css) */
    &.logo svg {
      width: 1.375rem;
      height: 1.375rem;
    }
    &.tinted {
      background: var(--brand);
      color: oklch(from var(--brand) clamp(0, (0.68 - l) * 1000, 1) 0 0);
    }
  }
  .text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }
  .desc {
    color: oklch(from var(--color-text) l c h / 60%);
  }
  .tile :global(.out) {
    flex: none;
    color: oklch(from var(--color-text) l c h / 50%);
  }
</style>
