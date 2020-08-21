import { Action, actions, Games } from "../../../../types";
import { addPlayerToGame } from "../addPlayerToGame";
import { O } from "../../../../fp";
import { pipe } from "fp-ts/lib/function";
import { Namespace } from "socket.io";
import { emitError } from "../emitError";
import { updateGames } from "../updateGames";

export const joinGame = (
  games: Games,
  socket: SocketIO.Socket,
  connection: Namespace,
) => {
  return (action: Action) => {
    const { code } = action;
    pipe(
      action.playerName,
      O.fromNullable,
      O.map((playerName): void => {
        // eslint-disable-next-line functional/no-expression-statement
        pipe(
          { ...action, playerName },
          addPlayerToGame(games, socket.id),
          O.map(updateGames(games)),
          O.map((game): void => {
            socket.join(code);
            // eslint-disable-next-line functional/no-expression-statement
            connection.in(code).emit(actions.JOIN_GAME, { game, code });
          }),
        );
      }),
      O.getOrElse(emitError(socket, code, "Please enter a username")),
    );
  };
};
