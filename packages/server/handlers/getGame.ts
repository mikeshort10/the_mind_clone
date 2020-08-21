import { Action, Game } from "../../..//types";
import { R } from "../../../fp";

export const getGame = (games: Record<string, Game>) => {
  return ({ code }: Action) => R.lookup(code)(games);
};
