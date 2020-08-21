import { createConnection } from "./createConnection";
import { EmitData } from "../../../../../types";

export const configureSocket = (): SocketIOClient.Socket => {
  const socket = createConnection();

  socket.on("CLIENT_ERROR", ({ error }: EmitData) => {
    console.error(error);
  });

  return socket;
};
