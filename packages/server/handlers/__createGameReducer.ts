import { Game, Games } from "../../../types";
import { ReadonlyRecord } from "fp-ts/lib/ReadonlyRecord";
import { pipe } from "fp-ts/lib/function";
import { R, O } from "../../../fp";

const createGameReducer = (
  handlers: Record<string, (u: Record<string, unknown>) => Games>,
  games: Readonly<Games> = {}
) => {
  return (type: string, payload: Record<string, unknown>) => {
    const newGames = pipe(
      type,
      (type) => R.lookup(type)(handlers),
      O.map((handler) => handler(payload)),
      O.getOrElse(() => games)
    );
    return newGames;
  };
};
