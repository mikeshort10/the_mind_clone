import { Action, actions, Games } from "../../../../types";
import { addPlayerToGame } from "../addPlayerToGame";
import { O } from "../../../../fp";
import { pipe } from "fp-ts/lib/function";
import { emitToRoom } from "../emitToRoom";
import { Namespace } from "socket.io";
import { emitError } from "../emitError";
import { updateGames } from "../updateGames";

export const joinGame = (
  games: Games,
  socket: SocketIO.Socket,
  connection: Namespace,
) => {
  const emitAllIn = emitToRoom(socket, connection);
  return (action: Action) => {
    const { code } = action;
    pipe(
      action.playerName,
      O.fromNullable,
      O.map((playerName) => {
        // eslint-disable-next-line functional/no-expression-statement
        pipe(
          { ...action, playerName },
          addPlayerToGame(games),
          O.map((game): void => {
            // eslint-disable-next-line functional/no-expression-statement
            updateGames(games)(game, code);
            // eslint-disable-next-line functional/no-expression-statement
            emitAllIn(actions.JOIN_GAME, { game, code }, true);
          }),
        );
      }),
      O.getOrElse(emitError(socket, code, "Please enter a username")),
    );
  };
};
