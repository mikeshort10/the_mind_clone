import { Action, Game } from "../../..//types";
import { pipe, increment } from "fp-ts/lib/function";
import { O, A } from "../../../fp";
import { getOrElse } from "fp-ts/lib/Option";

const getCardIndex = (card: number, game: Game): number =>
  pipe(
    A.findIndex((x) => x === card)(game.dealtCards),
    getOrElse(() => game.lastPlayedIndex)
  );

const handleCorrectOrder = ([game, card]: readonly [Game, number]) => {
  return { ...game, lastPlayedIndex: getCardIndex(card, game) };
};

const handleMistake = (game: Game) => {
  return { ...game, mistakes: game.mistakes + 1 };
};

const isCorrectOrder = ([game, card]: readonly [Game, number]) =>
  game.dealtCards[game.lastPlayedIndex + 1] === card;

const getRoundsToWin = (numberOfPlayers: number) => {
  const roundsToWin: Record<number, number> = {
    2: 12,
    3: 10,
    4: 8,
  };
  return roundsToWin[numberOfPlayers];
};

const checkLostGame = ({ mistakes, accruedLives }: Game) =>
  mistakes >= accruedLives;

const checkWonGame = ({ round, players }: Game) => {
  return round === getRoundsToWin(players.length);
};

const checkNextRound = ({ lastPlayedIndex, dealtCards }: Game) => {
  return lastPlayedIndex === dealtCards.length;
};

const checkGameOrRoundOver = (game: Game): Game => {
  return checkLostGame(game)
    ? { ...game, status: "lose" }
    : checkWonGame(game)
    ? { ...game, status: "win" }
    : checkNextRound(game)
    ? { ...game, round: increment(game.round) }
    : game;
};

export const playCard = ({ card }: Action) => (game: Game) => {
  return pipe(
    card,
    O.fromNullable,
    O.map((card): readonly [Game, number] => [game, card]),
    O.chain(O.fromPredicate(isCorrectOrder)),
    O.map(handleCorrectOrder),
    O.getOrElse(() => handleMistake(game)),
    checkGameOrRoundOver
  );
};

// TODO: handle possible game loss; write tests
