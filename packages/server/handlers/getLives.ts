import { Game } from "../../../types";

export const getLives = (game: Game): number =>
  Math.max(game.accruedLives - game.mistakes, 0);
