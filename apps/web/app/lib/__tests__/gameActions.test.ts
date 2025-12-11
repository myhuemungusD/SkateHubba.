import { describe, expect, it } from "vitest";
import { computePrimaryAction } from "../gameActions";
import type { Game, Round } from "@skatehubba/types";

const baseGame = (overrides: Partial<Game> = {}): Game => ({
  id: "game-1",
  players: ["p1", "p2"],
  createdBy: "p1",
  createdAt: 0,
  lastActionAt: 0,
  state: {
    p1Letters: 0,
    p2Letters: 0,
    turn: "p1",
    status: "ACTIVE",
  },
  winnerId: null,
  finishedAt: null,
  ...overrides,
});

const round = (overrides: Partial<Round> = {}): Round => ({
  id: "r1",
  gameId: "game-1",
  index: 1,
  attackerId: "p1",
  defenderId: "p2",
  attackerVideoUrl: "https://example.com/a",
  defenderVideoUrl: null,
  defenderResult: "PENDING",
  deadlineReplyAt: 0,
  status: "AWAITING_DEFENDER",
  disputeStatus: "NONE",
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

describe("computePrimaryAction", () => {
  it("returns waiting when user is not a player", () => {
    const action = computePrimaryAction(baseGame(), [], "outsider");
    expect(action.kind).toBe("waiting");
  });

  it("returns completed for completed games", () => {
    const game = baseGame({
      state: { ...baseGame().state, status: "COMPLETED", turn: null },
      winnerId: "p2",
    });
    const action = computePrimaryAction(game, [], "p1");
    expect(action).toEqual({ kind: "completed", winnerId: "p2" });
  });

  it("returns accept/decline for defender on pending accept", () => {
    const game = baseGame({
      state: { ...baseGame().state, status: "PENDING_ACCEPT", turn: "p1" },
    });
    const action = computePrimaryAction(game, [], "p2");
    expect(action.kind).toBe("acceptOrDecline");
  });

  it("returns waiting for challenger on pending accept", () => {
    const game = baseGame({
      state: { ...baseGame().state, status: "PENDING_ACCEPT", turn: "p1" },
    });
    const action = computePrimaryAction(game, [], "p1");
    expect(action.kind).toBe("waiting");
  });

  it("prioritizes reply when defender has a pending round", () => {
    const game = baseGame();
    const rounds = [round()];
    const action = computePrimaryAction(game, rounds, "p2");
    expect(action.kind).toBe("replyToTrick");
    expect(action.kind === "replyToTrick" ? action.round.id : undefined).toBe("r1");
  });

  it("returns setTrick when it is current user's turn and no pending reply", () => {
    const game = baseGame({ state: { ...baseGame().state, turn: "p1", status: "ACTIVE" } });
    const action = computePrimaryAction(game, [], "p1");
    expect(action.kind).toBe("setTrick");
  });

  it("returns waiting when active but not user's turn and no pending reply", () => {
    const game = baseGame({ state: { ...baseGame().state, turn: "p2", status: "ACTIVE" } });
    const action = computePrimaryAction(game, [], "p1");
    expect(action.kind).toBe("waiting");
  });
});
