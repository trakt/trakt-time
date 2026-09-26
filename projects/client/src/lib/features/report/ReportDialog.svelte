<script lang="ts">
  import BottomSheet from '$lib/components/bottom-sheet/BottomSheet.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import ReportForm from './_internal/ReportForm.svelte';
  import type { ReportParams } from './models/ReportParams.ts';

  type ReportDialogProps = {
    params: ReportParams;
    onClose: () => void;
  };

  const { params, onClose }: ReportDialogProps = $props();
</script>

<BottomSheet title={m.dialog_title_report()} {onClose}>
  <ReportForm {params} {onClose} />
</BottomSheet>
