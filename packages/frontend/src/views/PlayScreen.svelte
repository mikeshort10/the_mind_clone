<script>
  export let game, hand;
</script>

<div>
  {#if game.lastPlayedIndex === -1}
    <p>Game Start</p>
  {:else}
    <p>{game.dealtCards[game.lastPlayedIndex]}</p>
  {/if}

</div>
