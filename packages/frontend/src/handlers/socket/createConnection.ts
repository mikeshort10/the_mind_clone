import type { EmitData } from "../../../../..//types";
import type { Socket } from "socket.io-client";
declare var io: (url: string) => typeof Socket;

export const createConnection = (): typeof Socket =>
  io("http://localhost:3000");
