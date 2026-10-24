import type { GameMode, Move, Player } from '@tic-tac-toe/game-util-game-logic';
import type { Board, GameStatus } from '@tic-tac-toe/game-util-game-logic';

export const GAME_ACTION_TYPES = {
  INIT_START: 'game/INIT_START',
  INIT_SUCCESS: 'game/INIT_SUCCESS',
  INIT_FAILURE: 'game/INIT_FAILURE',
  SET_MODE: 'game/SET_MODE',
  SET_ERROR: 'game/SET_ERROR',
  CLEAR_ERROR: 'game/CLEAR_ERROR',
  APPLY_MOVE: 'game/APPLY_MOVE',
  SET_COMPUTER_MOVING: 'game/SET_COMPUTER_MOVING',
  RESET_GAME: 'game/RESET_GAME',
  UNDO_MOVES: 'game/UNDO_MOVES',
  SET_RESULT_RECORDED: 'game/SET_RESULT_RECORDED',
  SYNC_GAME_START: 'game/SYNC_GAME_START',
  SYNC_GAME_SUCCESS: 'game/SYNC_GAME_SUCCESS',
  SYNC_GAME_FAILURE: 'game/SYNC_GAME_FAILURE',
} as const;

export interface ApplyMovePayload {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  move: Move;
}

export const gameActions = {
  initStart: () => ({ type: GAME_ACTION_TYPES.INIT_START }),
  initSuccess: (gameId: string) => ({
    type: GAME_ACTION_TYPES.INIT_SUCCESS,
    payload: { gameId },
  }),
  initFailure: (error: string) => ({
    type: GAME_ACTION_TYPES.INIT_FAILURE,
    payload: { error },
  }),
  setMode: (mode: GameMode) => ({
    type: GAME_ACTION_TYPES.SET_MODE,
    payload: { mode },
  }),
  setError: (error: string) => ({
    type: GAME_ACTION_TYPES.SET_ERROR,
    payload: { error },
  }),
  clearError: () => ({ type: GAME_ACTION_TYPES.CLEAR_ERROR }),
  applyMove: (payload: ApplyMovePayload) => ({
    type: GAME_ACTION_TYPES.APPLY_MOVE,
    payload,
  }),
  setComputerMoving: (isComputerMoving: boolean) => ({
    type: GAME_ACTION_TYPES.SET_COMPUTER_MOVING,
    payload: { isComputerMoving },
  }),
  resetGame: () => ({ type: GAME_ACTION_TYPES.RESET_GAME }),
  undoMoves: (removedCount: number) => ({
    type: GAME_ACTION_TYPES.UNDO_MOVES,
    payload: { removedCount },
  }),
  setResultRecorded: () => ({ type: GAME_ACTION_TYPES.SET_RESULT_RECORDED }),
  syncGameStart: () => ({ type: GAME_ACTION_TYPES.SYNC_GAME_START }),
  syncGameSuccess: () => ({ type: GAME_ACTION_TYPES.SYNC_GAME_SUCCESS }),
  syncGameFailure: (error: string) => ({
    type: GAME_ACTION_TYPES.SYNC_GAME_FAILURE,
    payload: { error },
  }),
};

export type GameAction = ReturnType<
  (typeof gameActions)[keyof typeof gameActions]
>;
