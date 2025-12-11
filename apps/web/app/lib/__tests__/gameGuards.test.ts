import { describe, expect, it } from "vitest";
import type { Game, Round } from "@skatehubba/types";
import {
  assertCanAcceptGame,
  assertCanCreateGame,
  assertCanDeclineGame,
  assertCanSetTrick,
  assertCanSubmitReply,
} from "../gameGuards";

const baseGame = (overrides: Partial<Game> = {}): Game => ({
  id: "g1",
  players: ["p1", "p2"],
  createdBy: "p1",
  createdAt: 0,
  lastActionAt: 0,
  roundsCount: 0,
  openRoundId: null,
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

const baseRound = (overrides: Partial<Round> = {}): Round => ({
  id: "r1",
  gameId: "g1",
  index: 1,
  attackerId: "p1",
  defenderId: "p2",
  attackerVideoUrl: "https://a",
  defenderVideoUrl: null,
  defenderResult: "PENDING",
  deadlineReplyAt: 0,
  status: "AWAITING_DEFENDER",
  disputeStatus: "NONE",
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

describe("game guards", () => {
  it("rejects self-challenge", () => {
    expect(() => assertCanCreateGame("p1", "p1")).toThrow();
  });

  it("allows defender to accept pending game and blocks others", () => {
    const game = baseGame({
      state: { ...baseGame().state, status: "PENDING_ACCEPT", turn: "p1" },
    });
    expect(() => assertCanAcceptGame(game, "p2")).not.toThrow();
    expect(() => assertCanAcceptGame(game, "p1")).toThrow();
  });

  it("allows decline for either player in pending state", () => {
    const game = baseGame({
      state: { ...baseGame().state, status: "PENDING_ACCEPT", turn: "p1" },
    });
    expect(() => assertCanDeclineGame(game, "p2")).not.toThrow();
    expect(() => assertCanDeclineGame(game, "p1")).not.toThrow();
    expect(() => assertCanDeclineGame(game, "p3")).toThrow();
  });

  it("requires active status, correct turn, and no open round to set trick", () => {
    const activeGame = baseGame();
    expect(() => assertCanSetTrick(activeGame, "p1")).not.toThrow();

    const wrongTurn = baseGame({ state: { ...baseGame().state, turn: "p2" } });
    expect(() => assertCanSetTrick(wrongTurn, "p1")).toThrow();

    const withOpenRound = baseGame({ openRoundId: "r1" });
    expect(() => assertCanSetTrick(withOpenRound, "p1")).toThrow();
  });

  it("requires active status, awaiting defender round, matching defender, and matching open round", () => {
    const game = baseGame({ openRoundId: "r1" });
    const round = baseRound();
    expect(() => assertCanSubmitReply(game, round, "p2")).not.toThrow();

    expect(() =>
      assertCanSubmitReply(
        baseGame({ state: { ...baseGame().state, status: "COMPLETED" } }),
        round,
        "p2"
      )
    ).toThrow();

    expect(() =>
      assertCanSubmitReply(game, { ...round, status: "COMPLETE" }, "p2")
    ).toThrow();

    expect(() => assertCanSubmitReply(game, round, "p1")).toThrow();

    expect(() =>
      assertCanSubmitReply(baseGame({ openRoundId: "other" }), round, "p2")
    ).toThrow();
  });
});
