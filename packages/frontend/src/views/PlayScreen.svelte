<script>
  export let game, hand;
  console.log(hand);
</script>

<div>
  {#if game.lastPlayedIndex === -1}
    <p>Game Start</p>
  {:else}
    <p>{game.dealtCards[game.lastPlayedIndex]}</p>
  {/if}

  {#if hand}
    <p>{hand[0]}</p>
  {/if}

</div>
