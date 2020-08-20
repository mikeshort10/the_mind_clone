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

export type EmitData = {
  game: Game;
  hand?: Hand;
  code: string;
};

export type Hand = number[];

export type Action = {
  code: string;
  playerName?: string;
  card?: number;
};

export const actions = {
  CREATE_GAME: "CREATE_GAME",
  START_GAME: "START_GAME",
  JOIN_GAME: "JOIN_GAME",
  MISTAKE: "MISTAKE",
  PLAY: "PLAY",
  STAR: "STAR",
  CLIENT_ERROR: "CLIENT_ERROR",
} as const;

export type ActionType = keyof typeof actions;
