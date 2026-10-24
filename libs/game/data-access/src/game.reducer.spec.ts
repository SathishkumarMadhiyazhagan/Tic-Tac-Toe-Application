import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from '@tic-tac-toe/game-util-game-logic';
import { gameActions } from './game.actions';
import { gameReducer, initialGameState } from './game.reducer';

describe('game reducer', () => {
  it('resets the current game while keeping mode', () => {
    const busy = {
      ...initialGameState,
      mode: 'Computer' as const,
      board: createEmptyBoard(),
      moveHistory: [],
      status: 'Won' as const,
      winner: 'X' as const,
    };
    busy.board[0] = 'X';
    const next = gameReducer(busy, gameActions.resetGame());
    expect(next.status).toBe('InProgress');
    expect(next.board.every((cell) => cell === null)).toBe(true);
    expect(next.mode).toBe('Computer');
  });

  it('undoes the last move in two-player mode', () => {
    const withMoves = gameReducer(
      initialGameState,
      gameActions.applyMove({
        board: ['X', null, null, null, null, null, null, null, null],
        currentPlayer: 'O',
        status: 'InProgress',
        winner: null,
        winningCells: [],
        move: {
          id: 'm1',
          moveNumber: 1,
          player: 'X',
          row: 1,
          column: 1,
          cellIndex: 0,
        },
      })
    );
    const undone = gameReducer(withMoves, gameActions.undoMoves(1));
    expect(undone.moveHistory).toHaveLength(0);
    expect(undone.currentPlayer).toBe('X');
  });
});
