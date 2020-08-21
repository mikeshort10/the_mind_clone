import { actions } from "./actions";

export { actions };

export type Game = {
  players: string[];
  round: number;
  stars: number;
  accruedLives: number;
  lastPlayedIndex: number;
  mistakes: number;
  status: "join" | "playing" | "win" | "lose";
  dealtCards: number[];
};

export type Games = Record<string, Game>;

export type EmitData = {
  code: string;
  game?: Game;
  hand?: Hand;
  error?: string;
};

export type Hand = number[];

export type Action = {
  code: string;
  playerName?: string;
  card?: number;
};

export type ActionType = keyof typeof actions;
