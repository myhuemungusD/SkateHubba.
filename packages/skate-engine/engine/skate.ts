import { Game, Round, GameVisibility } from "../../types/skate";

/**
 * Creates a new Game object with initial state.
 */
export function createGame(
  id: string, 
  challengerId: string, 
  defenderId: string,
  visibility: GameVisibility = "PUBLIC",
  spotId: string | null = null
): Game {
  const now = Date.now();
  return {
    id,
    challengerId,
    defenderId,
    status: "PENDING_ACCEPT",
    currentTurn: "CHALLENGER",
    lettersWord: "SKATE",
    challengerLetters: "",
    defenderLetters: "",
    visibility,
    spotId,
    rounds: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a Round object representing a set trick.
 */
export function createRound(
  id: string,
  gameId: string,
  index: number,
  attackerId: string,
  defenderId: string,
  attackerVideoUrl: string
): Round {
  const now = Date.now();
  // 24 hours from now
  const deadline = now + (24 * 60 * 60 * 1000);
  
  return {
    id,
    gameId,
    index,
    attackerId,
    defenderId,
    attackerVideoUrl,
    defenderVideoUrl: null,
    attackerResult: "MAKE", // Attacker always makes the trick they set
    defenderResult: "PENDING",
    deadlineReplyAt: deadline,
    status: "AWAITING_DEFENDER",
    createdAt: now,
  };
}
