import { flow, pipe } from "fp-ts/lib/function";
import { randomInt } from "fp-ts/lib/Random";
import { A, R, O } from "../../../fp";
import { Game, Games } from "../../../types";

const randomLetter = flow(randomInt(65, 90), (x: number) =>
  String.fromCharCode(x)
);

const gameExists = (games: Games, code: string) =>
  pipe(games, R.lookup(code), O.isSome);

export const generateGameCode = (games: Games): string => {
  const gameCode = A.makeBy(4, randomLetter).join("");
  return gameExists(games, gameCode) === false
    ? gameCode
    : generateGameCode(games);
};
