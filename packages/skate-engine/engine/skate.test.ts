import { describe, it, expect } from 'vitest';
import { createGame, createRound } from './skate';

describe('Skate Engine', () => {
  describe('createGame', () => {
    it('should initialize a game with correct player states', () => {
      const game = createGame('game-123', 'player-A', 'player-B');

      expect(game.id).toBe('game-123');
      expect(game.challengerId).toBe('player-A');
      expect(game.defenderId).toBe('player-B');
      expect(game.status).toBe('PENDING_ACCEPT');
      expect(game.currentTurn).toBe('CHALLENGER');
      expect(game.rounds).toEqual([]);
      expect(game.createdAt).toBeDefined();
      expect(game.updatedAt).toBeDefined();
    });
  });

  describe('createRound', () => {
    it('should create a round object with initial state', () => {
      const round = createRound(
        'round-1',
        'game-123',
        1,
        'player-A',
        'player-B',
        'http://example.com/video.mp4'
      );

      expect(round.id).toBe('round-1');
      expect(round.gameId).toBe('game-123');
      expect(round.index).toBe(1);
      expect(round.attackerId).toBe('player-A');
      expect(round.defenderId).toBe('player-B');
      expect(round.attackerVideoUrl).toBe('http://example.com/video.mp4');
      expect(round.status).toBe('AWAITING_DEFENDER');
      expect(round.attackerResult).toBe('PENDING');
      expect(round.defenderResult).toBe('PENDING');
      expect(round.createdAt).toBeDefined();
      expect(round.deadlineReplyAt).toBeGreaterThan(Date.now());
    });
  });
});
