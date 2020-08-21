import { Action, actions, Games } from "../../../../types";
import { pipe } from "fp-ts/lib/function";
import { O } from "../../../../fp";
import { getGame } from "../getGame";

export const getGameHandler = (games: Games, socket: SocketIO.Socket) => {
  return (action: Action) => {
    pipe(
      action,
      getGame(games),
      O.map((game) =>
        socket.emit(actions.GET_GAME, { game, code: action.code })
      )
    );
  };
};
