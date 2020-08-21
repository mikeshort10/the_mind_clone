/* eslint-disable functional/no-expression-statement */
import http from "http";
import https from "https";
import * as dotenv from "dotenv";
import socketIO from "socket.io";
import { actions, Games } from "../../types";
import { startGame } from "./handlers/socketHandlers/startGame";
import {
  joinGame,
  createGame,
  getGameHandler,
  playCardHandler,
} from "./handlers/socketHandlers";

// configs and servers
dotenv.config();
const port = process.env.PORT || 3000;
const { createServer } = process.env.NODE_ENV === "production" ? https : http;
const server = createServer();
const io = socketIO(server);

const games: Games = {};

const connection = io.on("connection", (socket) => {
  socket.on(actions.CREATE_GAME, createGame(games, socket));
  socket.on(actions.JOIN_GAME, joinGame(games, socket, connection));
  socket.on(actions.START_GAME, startGame(games, socket, connection));
  socket.on(actions.PLAY, playCardHandler(games, socket, connection));
  socket.on(actions.GET_GAME, getGameHandler(games, socket));

  socket.on(actions.STAR, () => {});
});

server.listen(port, () => {
  console.info(`🤖 Server listening on port ${port}`);
});
