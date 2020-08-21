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

  const updatedGame = hasBeenDealt(card, game)
    ? game
    : { ...game, dealtCards: [...game.dealtCards, card] };

  return areAllCardsDealt(game) ? game : getCardsToDeal(updatedGame);
};
