import { Game, Action } from "../../..//types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

type PlayerAction = Action & {
  readonly playerName: string;
};

const hasPlayerName = (
  action: Action,
): action is PlayerAction => pipe(action.playerName, O.fromNullable, O.isSome);

export const generateGame = (socketId: string) =>
  (action: Action): O.Option<Game> =>
    pipe(
      action,
      O.fromPredicate(hasPlayerName),
      O.map(({ playerName, code }) => ({
        code,
        round: 1,
        dealtCards: [],
        lastPlayedIndex: -1,
        players: {
          [socketId]: {
            playerName,
            hand: [],
            gameOwner: true,
          },
        },
        stars: 3,
        accruedLives: 3,
        mistakes: 0,
        status: "join",
      })),
    );

//  const safeGenerateGame = (
//   socketId: string,
//   action: Action,
//   orElse: Game,
// ): Game =>
//   pipe(
//     action,
//     generateGame(socketId),
//     O.getOrElse(() => orElse),
//   );
