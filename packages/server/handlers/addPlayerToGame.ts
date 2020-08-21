import { Game, Action, Games, Player } from "../../../types";
import { pipe } from "fp-ts/lib/function";
import { getGame } from "./getGame";
import { O } from "../../../fp";

const createNewPlayer = (playerName: string): Player => ({
  hand: [],
  gameOwner: false,
  playerName,
});

export const addPlayerToGame = (games: Games, socketId: string) => {
  return ({ playerName, ...action }: Action) => {
    return pipe(
      action,
      getGame(games),
      O.map(
        ({ players: ps, ...game }): Game => {
          const players = playerName
            ? { ...ps, [socketId]: createNewPlayer(playerName) }
            : ps;
          return { ...game, players };
        },
      ),
    );
  };
};
