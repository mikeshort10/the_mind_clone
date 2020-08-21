import { Socket, Namespace } from "socket.io";
import { Action, actions, Game, Games } from "../../../../types";
import { pipe } from "fp-ts/lib/function";
import { getGame } from "../getGame";
import { O, E } from "../../../../fp";
import { emit } from "cluster";
import { emitToRoom } from "../emitToRoom";
import { playCard } from "../playCard";

export const playCardHandler = (
  games: Games,
  socket: Socket,
  connection: Namespace
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
        emitAllIn(action.code, actions.PLAY, { game, code: action.code });
      }),
      E.getOrElse((error) => {
        emit(actions.CLIENT_ERROR, { code: action.code, error });
      })
    );
  };
};
