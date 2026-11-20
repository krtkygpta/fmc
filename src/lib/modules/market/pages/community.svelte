<script lang="ts">
  // The store's Community section: where FMC's people are, and the author's own accounts.
  import { Page } from "$lib/shared/components/page";
  import { StoreTabs } from "$lib/shared/components/store-tabs";
  import { CommunityPanel } from "../components/community-panel";
  import { common } from "$lib/shared/i18n";
</script>

<svelte:head><title>{$common.community} — FMC</title></svelte:head>

<Page>
  {#snippet header()}
    <div class="bar"><StoreTabs /></div>
  {/snippet}

  <CommunityPanel />
</Page>

<style>
  /* the same box the faces page gives its tabs, so switching sections doesn't move them */
  .bar {
    padding: 0.75rem 1rem;
  }
  @media (max-width: 767px) {
    .bar {
      padding: 0.5rem 0.75rem;
    }
  }
</style>
