<script lang="ts">
  // Shown when a face has an image bigger than any factory face uses — the upload waits in the
  // model until the user accepts the risk or backs out.
  import { Button } from "$lib/shared/components/button";
  import { Dialog } from "$lib/shared/components/dialog";
  import { bleModel } from "../model";
  import { t } from "../i18n";

  const { $sizeWarning: warning, sizeConfirmed, sizeWarningClosed } = bleModel;
</script>

<Dialog open={$warning !== null} title={$t.tooBig} onClose={() => sizeWarningClosed()}>
  <p class="desc">{$warning}</p>
  {#snippet actions()}
    <Button kind="secondary" onClick={() => sizeWarningClosed()}>{$t.cancel}</Button>
    <Button kind="danger" onClick={() => sizeConfirmed()}>{$t.installAnyway}</Button>
  {/snippet}
</Dialog>

<style>
  .desc {
    margin: 0;
  }
</style>
