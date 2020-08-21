import { Game, Hand } from "../../..//types";
import { A, O } from "../../../fp";
import { pipe } from "fp-ts/lib/function";

export const dealCards = ({ players, dealtCards }: Game) => {
  const totalPlayers = players.length;
  return A.array.reduceWithIndex(
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
};
