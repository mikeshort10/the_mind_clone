import { Game, Action, Games } from "../../../types";
import { pipe } from "fp-ts/lib/function";
import { getGame } from "./getGame";
import { O } from "../../../fp";

export const addPlayerToGame = (games: Games) => {
  return ({ playerName, ...action }: Action) => {
    return pipe(
      action,
      getGame(games),
      O.map(
        ({ players: ps, ...game }): Game => {
          const players = playerName ? [...ps, playerName] : ps;
          return { ...game, players };
        }
      )
    );
  };
};
