import { Socket } from "socket.io";
import { generateGameCode } from "../generateGameCode";
import { Action, actions, Games } from "../../../../types";
import { generateGame } from "../generateGame";
import { updateGames } from "../updateGames";
import { pipe } from "fp-ts/lib/function";
import { O } from "../../../../fp";

export const createGame = (games: Games, socket: Socket) => {
  return (action: Omit<Action, "code">) => {
    const code = generateGameCode(games);
    // eslint-disable-next-line functional/no-expression-statement
    pipe(
      { ...action, code },
      generateGame(socket.id),
      O.map(updateGames(games)),
    );

    socket.join(code);
    socket.emit(actions.CREATE_GAME, { game: games[code], code });
  };
};
