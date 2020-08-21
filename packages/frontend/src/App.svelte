<script>
  import { Router, Route, navigate } from "svelte-routing";
  import Tailwind from "./Tailwind.svelte";
  import StartPage from "./views/StartPage.svelte";
  import { configureSocket } from "./handlers/socket/configureSocket";
  import WaitScreen from "./views/WaitScreen.svelte";
  import { onGetGame } from "./handlers/socket/getGame";
  import { onStartGame } from "./handlers/socket/startGame";

  import PlayScreen from "./views/PlayScreen.svelte";

  const socket = configureSocket();

  const emit = (type, message) => {
    socket.emit(type, message);
  };

  socket.on("CREATE_GAME", (data) => {
    navigate(`/${data.code}`);
  });

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
    console.log(data);
    data.hand && (hand = data.hand.sort());
  };

  socket.on("JOIN_GAME", (data) => {
    console.log("someone wants to play!");
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
      <StartPage {name} {updateName} {emit} />
    </Route>
  </main>
</Router>
