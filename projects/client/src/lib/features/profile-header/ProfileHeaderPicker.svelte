<script lang="ts">
  import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useProfileHeader } from './useProfileHeader.ts';

  const { profileHeader, setProfileHeader } = useProfileHeader();

  const options = [
    { value: 'posters' as const, label: m.option_text_profile_header_posters() },
    { value: 'cover' as const, label: m.option_text_profile_header_cover() },
  ];
</script>

<SegmentedControl
  label={m.text_profile_header()}
  value={$profileHeader}
  onChange={setProfileHeader}
  {options}
  surface="card"
/>
