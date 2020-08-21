import { Action, actions, Games, Hand } from "../../../../types";
import { pipe, flow } from "fp-ts/lib/function";
import { O, R, A } from "../../../../fp";
import { getCardsToDeal } from "../getCardsToDeal";
import { dealCards } from "../dealCards";
import { emit } from "cluster";
import { Game } from "../../../../types";
import { Namespace } from "socket.io";

const startGameByCode = (games: Games) => {
  return (code: string): O.Option<Game> => {
    return pipe(
      code,
      (code) => R.lookup(code)(games),
      O.map((game): Game => ({ ...game, status: "playing" }))
    );
  };
};

const safeGetLast = <T>(t: T) => (arr: T[]) =>
  pipe(
    arr,
    A.last,
    O.getOrElse(() => t)
  );

export const startGame = (
  games: Games,
  socket: SocketIO.Socket,
  connection: Namespace
) => (action: Action) => {
  console.log(action);
  const { code } = action;
  pipe(
    code,
    startGameByCode(games),
    O.map(getCardsToDeal),
    O.map(
      flow(
        (game) => (games[code] = game),
        dealCards,
        ([hands, game]) => {
          Object.keys(connection.sockets).forEach((id, i) => {
            socket.to(id).emit(actions.START_GAME, {
              game,
              hand: hands[i] || [],
            });
          });
          socket.emit(actions.START_GAME, {
            game,
            hand: safeGetLast<Hand>([])(hands),
          });
        }
      )
    ),
    O.getOrElse(() => {
      emit("CLIENT_ERROR", {
        error: `Invalid Game Code ${JSON.stringify(code)}`,
        code,
      });
    })
  );
};
