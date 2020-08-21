<script>
  export let onClick;
</script>

<style>
  button {
    min-width: 8rem;
  }
</style>

<button
  on:click|preventDefault={onClick}
  class="text-white px-3 py-2 border rounded bg-blue-400">
  <slot />
</button>
