import { EmitData } from "../../../../../types";

export const onStartGame = (
  socket: SocketIOClient.Socket,
  fn: (x: EmitData) => void,
) => {
  const action = "START_GAME";
  socket.on(action, fn);
  return (code: string) => {
    socket.emit(action, { code });
  };
};
