import type { Socket } from "socket.io-client";
declare const io: (url: string) => typeof Socket;

export const createConnection = (): typeof Socket =>
  io("http://localhost:3000");
