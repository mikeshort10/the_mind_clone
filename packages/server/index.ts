import express from "express";
import http from "http";
import https from "https";
import * as dotenv from "dotenv";
import socketIO from "socket.io";
import { randomInt } from "fp-ts/lib/Random";
import * as A from "fp-ts/lib/Array";
import { Game, ActionType, actions, Action, Hand, EmitData } from "../../types";
import { safeGenerateGame } from "./handlers/generateGame";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { ReadonlyRecord } from "fp-ts/lib/ReadonlyRecord";
import { getCardsToDeal } from "./handlers/getCardsToDeal";
import { dealCards } from "./handlers/dealCards";
import { playCard } from "./handlers/playCard";
import { getGame } from "./handlers/getGame";
import { E } from "../../fp";

const createGameReducer = (
  handlers: Record<
    string,
    (u: Record<string, unknown>) => Record<string, Game>
  >,
  games: ReadonlyRecord<string, Game> = {}
) => {
  return (type: string, payload: Record<string, unknown>) => {
    const newGames = pipe(
      type,
      (type) => R.lookup(type)(handlers),
      O.map((handler) => handler(payload)),
      O.getOrElse(() => games)
    );
    return newGames;
  };
};

// configs and servers
dotenv.config();
const port = process.env.PORT || 3000;
const { createServer } = process.env.NODE_ENV === "production" ? https : http;
const app = express();
const server = createServer(app);
const io = socketIO(server);

const games: Record<string, Game> = {};

const randomLetter = randomInt(65, 90);

const generateGameCode = (): string => {
  const gameCode = A.makeBy(4, randomLetter).join();
  return games[gameCode] == null ? gameCode : generateGameCode();
};

const emitFromSocket = (socket: SocketIO.Socket) => {
  return <M>(type: ActionType, message: M): void => {
    socket.emit(type, message);
  };
};

const startGameByCode = (games: Record<string, Game>) => {
  return (code: string): Game => ({ ...games[code], status: "playing" });
};

const addPlayerToGame = (games: Record<string, Game>) => {
  return ({ playerName, code }: Action) => {
    if (playerName == null) {
      return games[code];
    }
    const { players, ...game } = games[code];
    return { ...game, players: [...players, playerName] };
  };
};

const startByCode = startGameByCode(games);

const connection = io.on("connection", (socket) => {
  console.log("connected");

  const emit = emitFromSocket(socket);
  const emitAllIn = <M>(code: string, action: ActionType, payload: EmitData) =>
    emitFromSocket(socket.in(code))(action, payload);

  const socketJoin = (code: string) => socket.join(code);

  socket.on(actions.CREATE_GAME, ({ playerName }: Action) => {
    const code = generateGameCode();
    games[code] = safeGenerateGame(playerName, games[code]);
    socketJoin(code);
    emit(actions.CREATE_GAME, games[code]);
  });

  socket.on(actions.JOIN_GAME, (action: Action) => {
    const { code } = action;
    if (action.playerName == null) {
      return emit(actions.CLIENT_ERROR, { error: "Please enter a username" });
    }
    games[code] = addPlayerToGame(games)(action);
    socketJoin(code);
    emitAllIn(code, actions.JOIN_GAME, { game: games[code], code });
  });

  socket.on(actions.START_GAME, ({ code }: Action) => {
    const game = pipe(code, startGameByCode(games), getCardsToDeal);
    games[code] = game;
    const hands = pipe(game, dealCards);
    Object.keys(connection.sockets).forEach((id, i) => {
      socket.to(id).emit(actions.START_GAME, { game, hand: hands[i] || [] });
    });
  });

  socket.on(actions.PLAY, (action: Action) => {
    pipe(
      action,
      getGame(games),
      O.map(playCard(action)),
      E.fromOption(() => "Invalid Code"),
      E.map((game) => {
        emitAllIn(action.code, actions.PLAY, { game, code: action.code });
      }),
      E.getOrElse((error) => emit(actions.CLIENT_ERROR, { error }))
    );
  });

  socket.on(actions.STAR, () => {});
});

server.listen(port, () => {
  console.info(`🤖 Server listening on port ${port}`);
});
