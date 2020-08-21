import { EmitData } from "../../../../../types";

export const onGetGame = (
  socket: SocketIOClient.Socket,
  fn: (x: EmitData) => void
) => {
  const action = "GET_GAME";
  socket.on(action, (data: EmitData) => {
    console.log("receiving game");
    fn(data);
  });
  console.log("creating getGame");
  return (code: string) => {
    console.log("calling getGame");
    socket.emit(action, { code });
  };
};
