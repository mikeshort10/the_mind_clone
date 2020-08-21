<script>
  export let name, updateName, emit;
  import { navigate, link } from "svelte-routing";
  import Button from "../components/Button.svelte";
  import Input from "../components/Input.svelte";
  import FormGroup from "../components/FormGroup.svelte";

  let code;

  const createGame = () => {
    emit("CREATE_GAME", { playerName: name });
  };

  const joinGame = () => {
    emit("JOIN_GAME", { playerName: name, code });
  };

  const handleChangeName = (e) => {
    updateName(e.target.value);
  };

  const handleChangeCode = (e) => {
    code = e.target.value;
  };
</script>

<div class="flex flex-col justify-center items-center h-screen">
  <div
    class="border-2 rounded-lg shadow flex flex-col justify-center items-center
    w-full md:w-1/4 p-10">
    <FormGroup>
      <Input
        id="name"
        label="Name"
        placeholder="Pepe Silvia"
        value={name}
        onChange={handleChangeName} />
    </FormGroup>

    <FormGroup>
      <Input
        id="join-game"
        label="Join Game with Code"
        placeholder="Game Code"
        value={code}
        onChange={handleChangeCode} />
      <Button onClick={joinGame}>Join Game</Button>
    </FormGroup>

    <FormGroup>
      <p class="text-center">OR</p>
    </FormGroup>

    <FormGroup>
      <Button onClick={createGame}>Create Game</Button>
    </FormGroup>
  </div>
</div>
