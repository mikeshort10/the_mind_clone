import { Socket, Namespace } from "socket.io";
import { Action, actions, Games } from "../../../../types";
import { pipe } from "fp-ts/lib/function";
import { getGame } from "../getGame";
import { O, E } from "../../../../fp";
import { emitToRoom } from "../emitToRoom";
import { playCard } from "../playCard";
import { emitError } from "../emitError";

export const playCardHandler = (
  games: Games,
  socket: Socket,
  connection: Namespace,
) => {
  const emitAllIn = emitToRoom(socket, connection);
  return (action: Action) => {
    pipe(
      action,
      getGame(games),
      O.map(playCard(action)),
      E.fromOption(() => "Invalid Code"),
      (e) => e,
      E.map((game) => {
        // eslint-disable-next-line functional/no-expression-statement
        emitAllIn(actions.PLAY, { game, code: action.code });
      }),
      E.getOrElse(emitError(socket, action.code)),
    );
  };
};
