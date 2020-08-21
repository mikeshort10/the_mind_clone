import { EmitData } from "../../../../../types";

export const onGetGame = (
  socket: SocketIOClient.Socket,
  fn: (x: EmitData) => void
) => {
  const action = "GET_GAME";
  socket.on(action, (data: EmitData) => {
    fn(data);
  });
  return (code: string) => {
    socket.emit(action, { code });
  };
};
