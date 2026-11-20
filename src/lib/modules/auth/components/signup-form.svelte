<script lang="ts">
  import { Text } from "$lib/shared/components/text";
  import { Button } from "$lib/shared/components/button";
  import { Field } from "$lib/shared/components/field";
  import { Input } from "$lib/shared/components/input";
  import { authModel } from "../model";
  import { common } from "$lib/shared/i18n";
  import { t } from "../i18n";

  const {
    registerRequested,
    signupFormPatched,
    $signupForm: form,
    $registerPending: busy,
    $registerErr: err,
  } = authModel;
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    registerRequested();
  }}
>
  <Field label={$t.fullName}>
    <Input
      type="text"
      placeholder={$t.namePlaceholder}
      required
      autocomplete="name"
      value={$form.name}
      onInput={(name) => signupFormPatched({ name })}
    />
  </Field>
  <Field label={$t.email}>
    <Input
      type="email"
      placeholder="m@example.com"
      required
      autocomplete="email"
      value={$form.email}
      onInput={(email) => signupFormPatched({ email })}
    />
  </Field>
  <Field label={$t.password} hint={$t.passwordHint}>
    <Input
      type="password"
      required
      minlength={8}
      autocomplete="new-password"
      value={$form.password}
      onInput={(password) => signupFormPatched({ password })}
    />
  </Field>
  <Field label={$t.confirmPassword}>
    <Input
      type="password"
      required
      minlength={8}
      autocomplete="new-password"
      value={$form.confirm}
      onInput={(confirm) => signupFormPatched({ confirm })}
    />
  </Field>
  {#if $err}
    <Text as="p" variant="caption" tone="error">{$err}</Text>
  {/if}
  <Button type="submit" kind="primary" disabled={$busy}>{$t.createAccount}</Button>
  <p class="link type-caption">{$t.haveAccount} <a href="/login">{$common.signIn}</a></p>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .link {
    margin: 0;
    text-align: center;
    color: oklch(from var(--color-text) l c h / 55%);

    a {
      color: var(--color-accent);
    }
  }
</style>
