<script lang="ts">
  import { EditorPage } from "$lib/modules/editor/pages";
  import { editorModel } from "$lib/modules/editor/model";
  import { t } from "../../i18n";

  window.wfEd = editorModel; // console access for debugging/automated runs
</script>

<svelte:head><title>{$t.editorTitle}</title></svelte:head>

<EditorPage />
