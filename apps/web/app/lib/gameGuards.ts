import type { Game, Round } from "@skatehubba/types";

export function assertCanCreateGame(challengerId: string, defenderId: string) {
  if (!challengerId || !defenderId) {
    throw new Error("Both challenger and defender are required");
  }
  if (challengerId === defenderId) {
    throw new Error("You cannot challenge yourself");
  }
}

export function assertCanAcceptGame(game: Game, userId: string) {
  if (game.state.status !== "PENDING_ACCEPT") {
    throw new Error("Game is not pending acceptance");
  }
  if (game.players[1] !== userId) {
    throw new Error("Only the invited defender can accept");
  }
}

export function assertCanDeclineGame(game: Game, userId: string) {
  if (game.state.status !== "PENDING_ACCEPT") {
    throw new Error("Game is not pending acceptance");
  }
  if (!game.players.includes(userId)) {
    throw new Error("User is not a player in this game");
  }
}

export function assertCanSetTrick(game: Game, attackerId: string) {
  if (game.state.status !== "ACTIVE") {
    throw new Error("Game is not active");
  }
  if (game.state.turn !== attackerId) {
    throw new Error("It is not your turn");
  }
  if (game.openRoundId) {
    throw new Error("Cannot set a new trick while a defender reply is pending");
  }
}

export function assertCanSubmitReply(game: Game, round: Round, defenderId: string) {
  if (game.state.status !== "ACTIVE") {
    throw new Error("Game is not active");
  }
  if (round.status !== "AWAITING_DEFENDER") {
    throw new Error("Round is not awaiting defender");
  }
  if (round.defenderId !== defenderId) {
    throw new Error("Not the defender for this round");
  }
  if (game.openRoundId && game.openRoundId !== round.id) {
    throw new Error("Another round is pending; cannot reply to this round");
  }
}
