<script>
  export let params, game, getGame, startGame, name;
  import Button from "../components/Button.svelte";
  game || getGame(params.code);

  const { code } = params;

  const start = () => startGame(code);
</script>

<div>
  <h2 class="text-xl text-center">{code}</h2>
  {#if game}
    <p class="text-center">Waiting for Other Players</p>
  {:else}
    <p class="text-center text-red-500">Invalid Game Code</p>
  {/if}

  <div class="text-center">
    {#if game}
      {#each game.players as player}
        <p>{player}</p>
      {/each}
      {#if name === game.players[0]}
        <Button onClick={start}>Start Game</Button>
      {/if}
    {/if}
  </div>

</div>
