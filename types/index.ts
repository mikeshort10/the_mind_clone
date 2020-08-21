import { actions } from "./actions";

export { actions };

export type Hand = readonly number[];

export type Player = {
  readonly playerName: string;
  readonly hand: Hand;
  readonly gameOwner: boolean;
};

export type Players = Record<string, Player>;

export type Game = {
  readonly code: string;
  readonly players: Players;
  readonly round: number;
  readonly stars: number;
  readonly accruedLives: number;
  readonly lastPlayedIndex: number;
  readonly mistakes: number;
  readonly status: "join" | "playing" | "win" | "lose";
  readonly dealtCards: readonly number[];
};

export type Games = Record<string, Game>;

export type EmitData = {
  readonly code: string;
  readonly game?: Game;
  readonly hand?: Hand;
  readonly error?: string;
};

export type Action = {
  readonly code: string;
  readonly playerName?: string;
  readonly card?: number;
};

export type ActionType = keyof typeof actions;
