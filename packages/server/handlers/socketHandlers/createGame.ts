import { Socket } from "socket.io";
import { generateGameCode } from "../generateGameCode";
import { Action, actions, Game, Games } from "../../../../types";
import { safeGenerateGame } from "../generateGame";
import { emitFromSocket } from "../emitFromSocket";

export const createGame = (games: Games, socket: Socket) => {
  const emit = emitFromSocket(socket);
  return (action: Action) => {
    console.log("creating game");
    const code = generateGameCode(games);
    games[code] = safeGenerateGame(action.playerName, games[code]);
    socket.join(code);
    emit(actions.CREATE_GAME, { game: games[code], code });
  };
};
