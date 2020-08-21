<script>
  export let params, game, getGame, startGame, name;
  import Button from "../components/Button.svelte";
  import { isGameOwner } from "../handlers/findGameOwner";
  import { R } from "../../../../fp";
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
      {#each R.toArray(game.players) as [_, { playerName }]}
        <p>{playerName}</p>
      {/each}
      {#if isGameOwner(game, name)}
        <Button onClick={start}>Start Game</Button>
      {/if}
    {/if}
  </div>

</div>
