<script lang="ts">
  import { Dialog } from "$lib/shared/components/dialog";
  import { Button } from "$lib/shared/components/button";
  import { Field } from "$lib/shared/components/field";
  import { Input } from "$lib/shared/components/input";
  import { Select } from "$lib/shared/components/select";
  import { Textarea } from "$lib/shared/components/textarea";
  import { authModel } from "$lib/modules/auth/model";
  import { marketModel } from "$lib/modules/market/model";
  import { DEVICES } from "$lib/modules/market/lib/devices";
  import { common } from "$lib/shared/i18n";
  import { editorModel } from "../model";
  import { t } from "../i18n";

  const { $user: user } = authModel;
  const {
    publishRequested,
    $savePending: busy,
    $publishDialogOpen: open,
    $publishForm: form,
    $publishEditing: editing,
    $publishReady: ready,
    publishFormPatched,
    publishDialogClosed,
  } = marketModel;
  const { buildCurrentBin, previewBlob } = editorModel;

  const deviceOptions = $derived([
    { value: "", label: $t.selectWatch },
    ...DEVICES.map((d) => ({ value: d.value, label: d.label })),
  ]);

  async function publish() {
    if (!$user) return;
    publishRequested({
      ...$form,
      ownerId: $user.id,
      published: true,
      bin: await buildCurrentBin(),
      preview: await previewBlob(),
    });
  }
</script>

<Dialog
  open={$open}
  title={$editing ? $t.editDetails : $t.publishToMarket}
  onClose={() => publishDialogClosed()}
>
  {#if !$editing}
    <p class="desc type-caption">{$t.visibleToEveryone}</p>
  {/if}
  <div class="fields">
    <Field label={$t.name}>
      <Input value={$form.name} maxlength={100} onInput={(name) => publishFormPatched({ name })} />
    </Field>
    <Field label={$common.watch} hint={$t.watchHint}>
      <Select
        value={$form.device}
        options={deviceOptions}
        onChange={(device) => publishFormPatched({ device })}
      />
    </Field>
    <Field label={$t.description} hint={$t.descriptionHint}>
      <Textarea
        value={$form.description}
        rows={3}
        maxlength={1000}
        onInput={(description) => publishFormPatched({ description })}
      />
    </Field>
  </div>
  {#snippet actions()}
    <Button kind="secondary" onClick={() => publishDialogClosed()}>{$t.cancel}</Button>
    <Button kind="primary" disabled={$busy || !$ready} onClick={publish}>
      {$busy ? $t.uploading : $editing ? $t.save : $t.publish}
    </Button>
  {/snippet}
</Dialog>

<style>
  .desc {
    margin: 0 0 0.75rem;
    color: oklch(from var(--color-text) l c h / 55%);
  }
  .fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
