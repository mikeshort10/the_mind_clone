import { Games, Game } from "../../../types";

export const updateGames = (games: Games) =>
  (game: Game, code: string) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    games[code] = game;
    return game;
  };
