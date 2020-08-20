import { Game, Action } from "../../../types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

export const generateGame = (playerName: string): Game => ({
  round: 1,
  dealtCards: [],
  lastPlayedIndex: -1,
  players: [playerName],
  stars: 3,
  accruedLives: 3,
  mistakes: 0,
  status: "join",
});

export const safeGenerateGame = (
  playerName: string | undefined,
  orElse: Game
): Game =>
  pipe(
    playerName,
    O.fromNullable,
    O.map(generateGame),
    O.getOrElse(() => orElse)
  );
