import { Action, actions, Games, Hand } from "../../../../types";
import { pipe, flow } from "fp-ts/lib/function";
import { O, R } from "../../../../fp";
import { getCardsToDeal } from "../getCardsToDeal";
import { dealCards } from "../dealCards";
import { Game } from "../../../../types";
import { updateGames } from "../updateGames";
import { snd } from "fp-ts/lib/ReadonlyTuple";

const startGameByCode = (games: Games) => {
  return (code: string): O.Option<Game> => {
    return pipe(
      code,
      (code) => R.lookup(code)(games),
      O.map((game): Game => ({ ...game, status: "playing" })),
    );
  };
};

const getPlayers = ({ players }: Game) => (players);

const getSocketIds = flow(getPlayers, R.keys);

const emitToAllPlayers = (
  socket: SocketIO.Socket,
  [hands, game]: readonly [readonly Hand[], Game],
) =>
  (socketIds: readonly string[]): void => {
    console.log(socketIds);
    return socketIds.forEach((id, i) => {
      socket.to(id).emit(actions.START_GAME, {
        game,
        hand: hands[i] || [],
      });
    });
  };

const emitHands = (socket: SocketIO.Socket) => {
  return (gameInfo: readonly [readonly Hand[], Game]): void => {
    return pipe(
      gameInfo,
      snd,
      getSocketIds,
      emitToAllPlayers(socket, gameInfo),
    );
  };
};

const dealNewRound = (socket: SocketIO.Socket, games: Games) =>
  flow(
    getCardsToDeal,
    (game) => updateGames(games)(game),
    dealCards,
    emitHands(socket),
  );

export const startGame = (
  games: Games,
  socket: SocketIO.Socket,
) =>
  (action: Action) => {
    const { code } = action;
    return pipe(
      code,
      startGameByCode(games),
      O.map(dealNewRound(socket, games)),
      O.getOrElse(() => {
        socket.emit("CLIENT_ERROR", {
          error: `Invalid Game Code ${JSON.stringify(code)}`,
          code,
        });
      }),
    );
  };
