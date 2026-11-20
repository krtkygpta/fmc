<script lang="ts">
  import { Card } from "$lib/shared/components/card";
  import SignupForm from "../components/signup-form.svelte";
  import { authModel } from "../model";
  import { t } from "../i18n";
  import { goto } from "$app/navigation";

  const { $user: user } = authModel;
  // ponytail: already logged in — nothing to see on this page
  $effect(() => {
    if ($user) goto("/");
  });
</script>

<svelte:head><title>{$t.registerTitle}</title></svelte:head>

<div class="wrapper">
  <div class="panel">
    <h1 class="type-title">{$t.createYourAccount}</h1>
    <Card>
      <SignupForm />
    </Card>
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    place-items: center;
    height: 100%;
    /* the card must not touch the screen edge on a phone, and a short screen (keyboard up)
       scrolls instead of clipping the form */
    padding: 1rem;
    overflow-y: auto;
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 23.75rem;
  }
  h1 {
    margin: 0;
    text-align: center;
  }
</style>
