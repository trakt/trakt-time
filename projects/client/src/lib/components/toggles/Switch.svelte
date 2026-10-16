<script lang="ts">
  type SwitchProps = {
    label: string;
    checked: boolean;
    onchange: (checked: boolean) => void;
    disabled?: boolean;
  };

  const { label, checked, onchange, disabled = false }: SwitchProps = $props();
</script>

<label class="trakt-switch">
  <input
    type="checkbox"
    role="switch"
    aria-label={label}
    {checked}
    {disabled}
    onchange={(event) => onchange(event.currentTarget.checked)}
  />
  <span class="trakt-switch-thumb"></span>
</label>

<style lang="scss">
  .trakt-switch {
    --track-width: var(--ni-44);
    --track-height: var(--ni-24);
    --thumb-size: var(--ni-18);
    --thumb-inset: calc((var(--track-height) - var(--thumb-size)) / 2);
    --thumb-travel: calc(
      var(--track-width) - var(--thumb-size) - 2 * var(--thumb-inset)
    );

    position: relative;
    display: block;
    flex: none;
    box-sizing: border-box;
    width: var(--track-width);
    height: var(--track-height);
    border-radius: var(--trakttime-radius-pill);
    background-color: color-mix(
      in srgb,
      var(--color-text-primary) 18%,
      transparent
    );
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--transition-increment) ease-in-out;

    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    &:has(input:checked) {
      background-color: var(--trakttime-accent);
    }

    &:has(input:focus-visible) {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }

    &:has(input:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .trakt-switch-thumb {
    position: absolute;
    top: var(--thumb-inset);
    inset-inline-start: var(--thumb-inset);
    width: var(--thumb-size);
    height: var(--thumb-size);
    border-radius: 50%;
    background-color: var(--trakttime-accent-foreground);
    pointer-events: none;
    transition: transform var(--transition-increment) ease-in-out;
  }

  .trakt-switch:has(input:checked) .trakt-switch-thumb {
    transform: translateX(calc(var(--rtl-sign) * var(--thumb-travel)));
  }
</style>
