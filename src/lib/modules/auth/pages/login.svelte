<script lang="ts">
  import { Card } from "$lib/shared/components/card";
  import LoginForm from "../components/login-form.svelte";
  import { authModel } from "../model";
  import { goto } from "$app/navigation";
  import { Select } from "$lib/shared/components/select";
  import { i18nModel, LOCALES } from "$lib/shared/i18n";

  // signed out there is no account menu, so the language is picked here
  const { $locale: locale, localePicked } = i18nModel;
  const languages = Object.entries(LOCALES).map(([value, label]) => ({ value, label }));

  const { $user: user } = authModel;
  // ponytail: already logged in — nothing to see on this page
  $effect(() => {
    if ($user) goto("/");
  });
</script>

<svelte:head><title>Sign in — FMC Watchfaces</title></svelte:head>

<div class="wrapper">
  <div class="panel">
    <h1 class="type-title">Welcome back</h1>
    <Card>
      <LoginForm />
    </Card>
    <span class="language">
      <Select value={$locale} options={languages} onChange={(v) => localePicked(v)} />
    </span>
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
  .language {
    align-self: center;
  }
  h1 {
    margin: 0;
    text-align: center;
  }
</style>
