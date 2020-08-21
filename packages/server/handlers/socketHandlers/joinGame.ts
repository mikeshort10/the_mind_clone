import {
  Game,
  Action,
  actions,
  ActionType,
  EmitData,
  Games,
} from "../../../../types";
import { emit } from "cluster";
import { addPlayerToGame } from "../addPlayerToGame";
import { O } from "../../../../fp";
import { pipe } from "fp-ts/lib/function";
import { emitToRoom } from "../emitToRoom";
import { Namespace } from "socket.io";

export const joinGame = (
  games: Games,
  socket: SocketIO.Socket,
  connection: Namespace
) => {
  const emitAllIn = emitToRoom(socket, connection);
  return (action: Action) => {
    const { code } = action;
    pipe(
      action.playerName,
      O.fromNullable,
      O.map((playerName) => {
        pipe(
          { ...action, playerName },
          addPlayerToGame(games),
          O.map((game) => {
            games[code] = game;
            emitAllIn(code, actions.JOIN_GAME, { game, code }, true);
          })
        );
      }),
      O.getOrElse(() => {
        emit(actions.CLIENT_ERROR, {
          code,
          error: "Please enter a username",
        });
      })
    );
  };
};
