<script>
  import Tailwind from "./Tailwind.svelte";
  import StartPage from "./views/StartPage.svelte";
  import { createConnection } from "./handlers/socket/createConnection";

  const socket = createConnection();

  console.log(socket);
</script>

<main>
  <Tailwind />
  <StartPage />
</main>
