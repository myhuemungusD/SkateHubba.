export interface User {
  uid: string;
  handle: string;
  avatarUrl: string;
  fcmToken?: string;
  stats: {
    wins: number;
    losses: number;
    streak: number;
  };
}

export type GameStatus = "PENDING_ACCEPT" | "ACTIVE" | "DECLINED" | "COMPLETED";
export type GameVisibility = "PUBLIC" | "PRIVATE";
export type PlayerRole = "CHALLENGER" | "DEFENDER";

export interface Game {
  id: string;
  challengerId: string;
  defenderId: string;
  status: GameStatus;
  currentTurn: PlayerRole;
  lettersWord: string; // e.g. "SKATE"
  challengerLetters: string; // e.g. "SK"
  defenderLetters: string; // e.g. ""
  visibility: GameVisibility;
  spotId?: string | null;
  winnerId?: string;
  rounds: string[]; // Array of roundIds
  createdAt: number;
  updatedAt: number;
}

export type RoundStatus = "AWAITING_DEFENDER" | "COMPLETE" | "TIMEOUT";
export type TrickResult = "MAKE" | "BAIL" | "PENDING" | "TIMEOUT";

export interface Round {
  id: string;
  gameId: string;
  index: number;
  attackerId: string;
  defenderId: string;
  attackerVideoUrl: string;
  defenderVideoUrl?: string | null;
  attackerResult: TrickResult;
  defenderResult: TrickResult;
  deadlineReplyAt: number;
  status: RoundStatus;
  createdAt: number;
}

export interface Follow {
  followerId: string;
  targetId: string;
}
