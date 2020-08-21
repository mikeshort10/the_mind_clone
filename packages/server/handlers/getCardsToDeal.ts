import { Game } from "../../..//types";
import { A } from "../../../fp";
import { randomInt } from "fp-ts/lib/Random";
import { eqNumber } from "fp-ts/lib/Eq";

export const TOTAL_CARDS = 100;

const areAllCardsDealt = ({ players, round, dealtCards }: Game) =>
  dealtCards.length === players.length * round;

const hasBeenDealt = (card: number, game: Game): boolean =>
  A.elem(eqNumber)(card)(game.dealtCards);

export const getCardsToDeal = (game: Game): Game => {
  const card = randomInt(1, TOTAL_CARDS)();
  if (areAllCardsDealt(game)) {
    return game;
  } else if (hasBeenDealt(card, game)) {
    return getCardsToDeal(game);
  }
  return getCardsToDeal({ ...game, dealtCards: [...game.dealtCards, card] });
};
