<script>
  export let params, game, getGame, startGame, name;
  import Button from "../components/Button.svelte";
  game || getGame(params.code);
</script>

<div>
  <h2 class="text-xl text-center">{params.code}</h2>
  <p class="text-center">Waiting for Other Players</p>
  <div class="text-center">
    {#if game}
      {#each game.players as player}
        <p>{player}</p>
      {/each}
      {#if name === game.players[0]}
        <Button onClick={startGame}>Start Game</Button>
      {/if}
    {/if}
  </div>

</div>
