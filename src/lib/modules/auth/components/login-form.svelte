<script lang="ts">
  import { Text } from "$lib/shared/components/text";
  import { Button } from "$lib/shared/components/button";
  import { Field } from "$lib/shared/components/field";
  import { Input } from "$lib/shared/components/input";
  import { authModel } from "../model";
  import { t } from "../i18n";

  const {
    loginRequested,
    loginFormPatched,
    oauthRequested,
    $loginForm: form,
    $loginPending: busy,
    $loginErr: err,
  } = authModel;
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    loginRequested();
  }}
>
  <Button type="button" kind="secondary" disabled={$busy} onClick={() => oauthRequested("google")}>
    <!-- the only brand mark in the UI — not part of the icon font -->
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path
        d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z"
      />
    </svg>
    {$t.loginWithGoogle}
  </Button>
  <div class="divider"><span class="type-label">{$t.orContinueWith}</span></div>
  <Field label={$t.email}>
    <Input
      type="email"
      placeholder="m@example.com"
      required
      autocomplete="email"
      value={$form.email}
      onInput={(email) => loginFormPatched({ email })}
    />
  </Field>
  <Field label={$t.password}>
    <Input
      type="password"
      required
      minlength={8}
      autocomplete="current-password"
      value={$form.password}
      onInput={(password) => loginFormPatched({ password })}
    />
  </Field>
  {#if $err}
    <Text as="p" variant="caption" tone="error">{$err}</Text>
  {/if}
  <Button type="submit" kind="primary" disabled={$busy}>{$t.login}</Button>
  <p class="link type-caption">{$t.noAccount} <a href="/register">{$t.signUp}</a></p>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .divider {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: oklch(from var(--color-text) l c h / 12%);
    }

    span {
      color: oklch(from var(--color-text) l c h / 55%);
    }
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
