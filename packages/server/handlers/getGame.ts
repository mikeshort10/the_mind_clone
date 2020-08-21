import { Action, Game, Games } from "../../..//types";
import { R } from "../../../fp";

export const getGame = (games: Games) => {
  return ({ code }: Action) => R.lookup(code)(games);
};
