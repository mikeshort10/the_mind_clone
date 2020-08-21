import { Socket } from "socket.io";
import { generateGameCode } from "../generateGameCode";
import { Action, actions, Games } from "../../../../types";
import { safeGenerateGame } from "../generateGame";
import { updateGames } from "../updateGames";

export const createGame = (games: Games, socket: Socket) => {
  return (action: Action) => {
    const code = generateGameCode(games);
    // eslint-disable-next-line functional/no-expression-statement
    updateGames(games)(safeGenerateGame(action.playerName, games[code]), code);
    socket.join(code);
    socket.emit(actions.CREATE_GAME, { game: games[code], code });
  };
};
