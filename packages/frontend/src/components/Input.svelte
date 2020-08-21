<script>
  export let placeholder = "",
    onChange,
    value = "",
    id,
    label;
</script>

{#if id && label}
  <div class="flex flex-col w-full pb-2">
    <label for={id} class="text-center text-gray-800">{label}</label>
    <input
      on:keyup={onChange}
      class="border text-center rounded py-1"
      {placeholder}
      {value} />
  </div>
{/if}
