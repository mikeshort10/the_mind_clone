<script>
  import { Router, Route, navigate } from "svelte-routing";
  import Tailwind from "./Tailwind.svelte";
  import StartPage from "./views/StartPage.svelte";
  import { createConnection } from "./handlers/socket/createConnection";
  import WaitScreen from "./views/WaitScreen.svelte";
  import { onGetGame } from "./handlers/socket/getGame";
  import { onStartGame } from "./handlers/socket/startGame";

  import PlayScreen from "./views/PlayScreen.svelte";

  const socket = createConnection();

  let game;
  let name = window.sessionStorage.getItem("playerName") || "";
  let hand;

  const updateName = (playerName) => {
    name = playerName;
    window.sessionStorage.setItem("playerName", playerName);
  };

  const updateGame = (data) => {
    data.game && (game = data.game);
  };

  const setHand = (data) => {
    data.hand && (hand = data.hand.sort());
  };

  socket.on("JOIN_GAME", (data) => {
    updateGame(data);
    navigate(`/${data.code}`);
  });

  socket.on("START_GAME", (data) => {
    updateGame(data);
    setHand(data);
  });

  const getGame = onGetGame(socket, updateGame);
  const startGame = onStartGame(socket, updateGame);

  socket &&
    socket.on("connect", () => {
      console.log("Connected!");
    });
  export let url = "";
</script>

<Router {url}>
  <main>
    <Tailwind />
    <Route path="/:code" let:params>
      {#if game == null || game.status === 'join'}
        <WaitScreen {params} {game} {getGame} {name} {startGame} />
      {:else}
        <PlayScreen {game} {hand} />
      {/if}
    </Route>
    <Route path="/">
      <StartPage {name} {updateName} />
    </Route>
  </main>
</Router>
