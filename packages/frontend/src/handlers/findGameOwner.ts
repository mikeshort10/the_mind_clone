import { Game, Player } from "../../../../types";
import { R, O } from "../../../../fp";
import { pipe } from "fp-ts/lib/function";

const getTypedNone = <T>(): O.Option<T> => O.none;

export const findGameOwner = ({ players }: Game) => {
  return R.record.reduce(
    players,
    getTypedNone<Player>(),
    (acc, player): O.Option<Player> => {
      return player.gameOwner ? O.some(player) : acc;
    },
  );
};

export const isGameOwner = (game: Game, playerName: string) => {
  return pipe(
    game,
    findGameOwner,
    O.map((gameOwner) => gameOwner.playerName === playerName),
    O.getOrElse(() => false),
  );
};
