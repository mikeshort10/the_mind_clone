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
  let name;

  const updateName = (playerName) => {
    name = playerName;
  };

  socket.on("JOIN_GAME", (data) => {
    console.log("updating");
    navigate;
    game = data.game;
    navigate(`/${data.code}`);
  });

  const updateGame = ({ game: gameData }) => {
    game = gameData;
  };

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
        <PlayScreen {game} />
      {/if}
    </Route>
    <Route path="/" component={StartPage} {name} {updateName} />
  </main>
</Router>
