import { createEmptyBoard, rebuildGameFromHistory } from '@tic-tac-toe/game-util-game-logic';
import { GAME_ACTION_TYPES, type GameAction } from './game.actions';
import type { GameState } from './types';

export const initialGameState: GameState = {
  gameId: '',
  board: createEmptyBoard(),
  currentPlayer: 'X',
  mode: 'TwoPlayer',
  status: 'InProgress',
  winner: null,
  winningCells: [],
  moveHistory: [],
  isComputerMoving: false,
  isResultRecorded: false,
  loading: false,
  error: null,
};

export function gameReducer(state = initialGameState, action: GameAction): GameState {
  switch (action.type) {
    case GAME_ACTION_TYPES.INIT_START:
      return { ...state, loading: true, error: null };
    case GAME_ACTION_TYPES.INIT_SUCCESS:
      return {
        ...initialGameState,
        gameId: action.payload.gameId,
        mode: state.mode,
        loading: false,
      };
    case GAME_ACTION_TYPES.INIT_FAILURE:
      return { ...state, loading: false, error: action.payload.error };
    case GAME_ACTION_TYPES.SET_MODE:
      return {
        ...initialGameState,
        gameId: state.gameId,
        mode: action.payload.mode,
      };
    case GAME_ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload.error };
    case GAME_ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    case GAME_ACTION_TYPES.APPLY_MOVE:
      return {
        ...state,
        board: action.payload.board,
        currentPlayer: action.payload.currentPlayer,
        status: action.payload.status,
        winner: action.payload.winner,
        winningCells: action.payload.winningCells,
        moveHistory: [...state.moveHistory, action.payload.move],
        error: null,
      };
    case GAME_ACTION_TYPES.SET_COMPUTER_MOVING:
      return { ...state, isComputerMoving: action.payload.isComputerMoving };
    case GAME_ACTION_TYPES.RESET_GAME:
      return {
        ...state,
        board: createEmptyBoard(),
        currentPlayer: 'X',
        status: 'InProgress',
        winner: null,
        winningCells: [],
        moveHistory: [],
        isComputerMoving: false,
        isResultRecorded: false,
        error: null,
      };
    case GAME_ACTION_TYPES.UNDO_MOVES: {
      const nextHistory = state.moveHistory.slice(
        0,
        state.moveHistory.length - action.payload.removedCount
      );
      const rebuilt = rebuildGameFromHistory(nextHistory);
      return {
        ...state,
        board: rebuilt.board,
        currentPlayer: rebuilt.currentPlayer,
        status: rebuilt.status,
        winner: rebuilt.winner,
        winningCells: rebuilt.winningCells,
        moveHistory: nextHistory,
        isComputerMoving: false,
        isResultRecorded: false,
        error: null,
      };
    }
    case GAME_ACTION_TYPES.SET_RESULT_RECORDED:
      return { ...state, isResultRecorded: true };
    case GAME_ACTION_TYPES.SYNC_GAME_START:
      return { ...state, loading: true };
    case GAME_ACTION_TYPES.SYNC_GAME_SUCCESS:
      return { ...state, loading: false };
    case GAME_ACTION_TYPES.SYNC_GAME_FAILURE:
      return { ...state, loading: false, error: action.payload.error };
    default:
      return state;
  }
}
