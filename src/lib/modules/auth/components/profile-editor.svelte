<script lang="ts">
  // "Edit profile" on the user's own page: avatar, name, bio. Same shell as the Watch panel — a
  // drawer beside the rail on desktop, the swipeable sheet on the phone.
  import { Text } from "$lib/shared/components/text";
  import { AdaptivePopover } from "$lib/shared/components/adaptive-popover";
  import { Avatar } from "$lib/shared/components/avatar";
  import { Button } from "$lib/shared/components/button";
  import { Field } from "$lib/shared/components/field";
  import { Icon } from "$lib/shared/components/icon";
  import { Input } from "$lib/shared/components/input";
  import { Textarea } from "$lib/shared/components/textarea";
  import { profileModel } from "../model";
  import { t } from "../i18n";

  const {
    BIO_MAX,
    $profileEditOpen: open,
    $profileForm: form,
    $profileErr: err,
    $profileSaving: saving,
    $profileReady: ready,
    $avatarSrc: avatarSrc,
    profileEditClosed,
    profileFormPatched,
    profileSaveRequested,
  } = profileModel;
</script>

<AdaptivePopover open={$open} title={$t.editProfile} onClose={() => profileEditClosed()}>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      profileSaveRequested();
    }}
  >
    <div class="photo">
      <Avatar name={$form.name || "?"} src={$avatarSrc ?? undefined} />
      <div class="avatar-actions">
        <label class="pick type-subtitle">
          <Icon name="photo_camera" size={18} />
          {$t.changePhoto}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onchange={(e) => {
              const file = e.currentTarget.files?.[0];

              if (file) profileFormPatched({ avatar: file });
              e.currentTarget.value = ""; // picking the same file again must fire again
            }}
          />
        </label>
        {#if $avatarSrc}
          <Button kind="ghost" onClick={() => profileFormPatched({ avatar: null })}
            >{$t.remove}</Button
          >
        {/if}
      </div>
    </div>

    <Field label={$t.name}>
      <Input
        value={$form.name}
        required
        autocomplete="nickname"
        onInput={(name) => profileFormPatched({ name })}
      />
    </Field>
    <Field label={$t.bio} hint="{$form.bio.length} / {BIO_MAX}">
      <Textarea
        value={$form.bio}
        rows={4}
        maxlength={BIO_MAX}
        placeholder={$t.bioPlaceholder}
        onInput={(bio) => profileFormPatched({ bio })}
      />
    </Field>

    {#if $err}<Text as="p" variant="caption" tone="error">{$err}</Text>{/if}

    <div class="actions">
      <Button kind="ghost" onClick={() => profileEditClosed()}>{$t.cancel}</Button>
      <Button type="submit" disabled={!$ready || $saving}>
        {$saving ? $t.saving : $t.save}
      </Button>
    </div>
  </form>
</AdaptivePopover>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .photo {
    display: flex;
    align-items: center;
    gap: 1rem;
    --avatar-size: 4rem;

    /* Avatar is a flex item here — don't let a narrow drawer squeeze it into an oval */
    > :global(*:first-child) {
      flex: none;
    }
  }
  .avatar-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .pick {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 10em;
    background: oklch(from var(--color-text) l c h / 6%);
    border: 1px solid oklch(from var(--color-text) l c h / 12%);
    cursor: pointer;

    &:has(input:focus-visible) {
      outline: 2px solid var(--color-accent);
    }
    input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
