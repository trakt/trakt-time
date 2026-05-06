<script lang="ts">
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import RenameIcon from '$lib/components/icons/RenameIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
  import { uploadAvatarRequest } from '$lib/requests/queries/users/uploadAvatarRequest.ts';
  import { useInvalidator } from '$lib/stores/useInvalidator.ts';
  import { fade } from 'svelte/transition';
  import ProfileImageContextMenu from './ProfileImageContextMenu.svelte';
  import ProfileImageCropDialog from './ProfileImageCropDialog.svelte';
  import ProfileImageViewDialog from './ProfileImageViewDialog.svelte';

  const {
    name,
    src,
    isEditable = false,
  }: {
    name: string;
    src: string;
    isEditable?: boolean;
  } = $props();

  const { invalidate } = useInvalidator();

  type Dialog = 'none' | 'view' | 'crop';

  const imageEdit = $state<{
    dialog: Dialog;
    pendingBase64: string | null;
    isUploading: boolean;
  }>({
    dialog: 'none',
    pendingBase64: null,
    isUploading: false,
  });

  function openFilePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (!input.files?.length) return;
      readFile(input.files[0]!);
    };
    input.click();
  }

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imageEdit.pendingBase64 = ev.target?.result as string;
      imageEdit.dialog = 'crop';
    };
    reader.readAsDataURL(file);
  }

  function handleFilesDropped(files: FileList) {
    const file = files.item(0);
    if (file) readFile(file);
  }

  async function handleCropConfirmed(base64: string) {
    imageEdit.dialog = 'none';
    imageEdit.pendingBase64 = null;
    imageEdit.isUploading = true;
    const success = await uploadAvatarRequest({ avatar: base64 });
    imageEdit.isUploading = false;
    if (!success) return;
    invalidate(InvalidateAction.User.Avatar);
  }

  function generateTransparentAvatar(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/png');
  }

  async function handleRemovePhoto() {
    imageEdit.isUploading = true;
    const success = await uploadAvatarRequest({
      avatar: generateTransparentAvatar(),
    });
    imageEdit.isUploading = false;
    if (!success) return;
    invalidate(InvalidateAction.User.Avatar);
  }
</script>

<div class="profile-image-container">
  <figure class="profile-image" data-sentry-block>
    <figcaption class="visually-hidden">
      {m.image_alt_user_avatar({ username: name })}
    </figcaption>

    {#if isEditable}
      <ProfileImageContextMenu
        onViewPhoto={() => (imageEdit.dialog = 'view')}
        onUploadPhoto={openFilePicker}
        onRemovePhoto={handleRemovePhoto}
      >
        {#snippet trigger(props)}
          <div
            {...props}
            class="editable-image-wrapper"
            role="button"
            tabindex="0"
            aria-label={m.button_label_upload_photo()}
            ondragover={(ev) => {
              ev.preventDefault();
              ev.currentTarget.classList.add('dragover');
            }}
            ondragleave={(ev) => ev.currentTarget.classList.remove('dragover')}
            ondrop={(ev) => {
              ev.preventDefault();
              ev.currentTarget.classList.remove('dragover');
              const { files } = ev.dataTransfer ?? {};
              if (files?.length) handleFilesDropped(files);
            }}
          >
            <CrossOriginImage
              {src}
              alt={m.image_alt_user_avatar({ username: name })}
            />
          </div>
        {/snippet}
      </ProfileImageContextMenu>
      <div class="edit-badge" aria-hidden="true">
        <RenameIcon />
      </div>
    {:else}
      <CrossOriginImage
        {src}
        alt={m.image_alt_user_avatar({ username: name })}
      />
    {/if}
  </figure>

  {#if imageEdit.isUploading}
    <div class="upload-overlay" transition:fade={{ duration: 150 }}>
      <div class="upload-spinner">
        <LoaderIcon />
      </div>
    </div>
  {/if}
</div>

{#if imageEdit.dialog === 'view'}
  <ProfileImageViewDialog
    {src}
    alt={m.image_alt_user_avatar({ username: name })}
    onClose={() => (imageEdit.dialog = 'none')}
  />
{/if}

{#if imageEdit.dialog === 'crop' && imageEdit.pendingBase64}
  <ProfileImageCropDialog
    src={imageEdit.pendingBase64}
    onConfirm={handleCropConfirmed}
    onClose={() => {
      imageEdit.dialog = 'none';
      imageEdit.pendingBase64 = null;
    }}
  />
{/if}

<style lang="scss">
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .profile-image-container {
    position: relative;
    width: var(--trakttime-avatar-size);
    height: var(--trakttime-avatar-size);
  }

  .profile-image {
    margin: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    box-sizing: border-box;
    background: var(--color-card-background);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .editable-image-wrapper {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    transition: outline-color 0.15s ease;
    outline: 2px solid transparent;

    &:focus-visible {
      outline: 2px solid var(--trakttime-accent);
      outline-offset: 2px;
    }

    &:global(.dragover) {
      outline: 2px dashed var(--trakttime-accent);
      outline-offset: 2px;
    }
  }

  .edit-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(15%, 15%);

    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background-color: var(--color-card-background);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    opacity: 0.85;
    transition:
      opacity 0.15s ease-in-out,
      transform 0.15s ease-in-out;

    :global(svg) {
      width: 0.75rem;
      height: 0.75rem;
      color: var(--color-text-primary);
    }
  }

  .profile-image-container:has(.editable-image-wrapper:hover) .edit-badge,
  .profile-image-container:has(.editable-image-wrapper:focus-visible)
    .edit-badge {
    opacity: 1;
    transform: translate(15%, 15%) scale(1.1);
  }

  .upload-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    background-color: color-mix(in srgb, black 55%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--layer-raised);
    cursor: wait;
  }

  .upload-spinner {
    display: flex;
    animation: upload-spin 1.2s linear infinite;

    :global(svg) {
      width: 1.75rem;
      height: 1.75rem;
      color: white;
    }
  }

  @keyframes upload-spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
