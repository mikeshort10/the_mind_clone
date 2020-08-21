import { Games, Game } from "../../../types";

export const updateGames = (games: Games) =>
  (game: Game) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    games[game.code] = game;
    return game;
  };
