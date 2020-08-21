import { Game, Hand } from "../../..//types";
import { A, O } from "../../../fp";
import { pipe } from "fp-ts/lib/function";

export const dealCards = (game: Game): [Hand[], Game] => {
  const { players, dealtCards } = game;
  const totalPlayers = players.length;
  const hands = A.array.reduceWithIndex(
    dealtCards,
    A.makeBy(totalPlayers, (): Hand => []),
    (i, acc, card) => {
      return pipe(
        acc,
        A.modifyAt(i % totalPlayers, (hand: Hand) => [...hand, card]),
        O.getOrElse(() => acc)
      );
    }
  );
  return [hands, game];
};
