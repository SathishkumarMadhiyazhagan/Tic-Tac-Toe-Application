import {
  applyMoveToBoard,
  selectComputerMove,
  validateMove,
  type GameMode,
  type Player,
} from '@tic-tac-toe/game-util-game-logic';
import type { ThunkAction, UnknownAction } from 'redux-thunk';
import {
  createGameRecord,
  fetchScoreboard,
  updateGameRecord,
  updateScoreboard,
} from './api';
import { gameActions } from './game.actions';
import { scoreboardActions } from './scoreboard.actions';
import type { RootState } from './types';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

function createMoveId(): string {
  return `move-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function serializeGame(state: RootState) {
  const { game } = state;
  return {
    mode: game.mode,
    status: game.status,
    board: game.board,
    currentPlayer: game.currentPlayer,
    winner: game.winner,
    winningCells: game.winningCells,
    moveHistory: game.moveHistory,
    isResultRecorded: game.isResultRecorded,
  };
}

export const initializeApp = (): AppThunk => async (dispatch) => {
  dispatch(gameActions.initStart());
  dispatch(scoreboardActions.loadStart());
  try {
    const scoreboard = await fetchScoreboard();
    dispatch(
      scoreboardActions.loadSuccess({
        xWins: scoreboard.xWins,
        oWins: scoreboard.oWins,
        draws: scoreboard.draws,
      })
    );

    const created = await createGameRecord({
      mode: 'TwoPlayer',
      status: 'InProgress',
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      winningCells: [],
      moveHistory: [],
      isResultRecorded: false,
    });
    dispatch(gameActions.initSuccess(String(created.id)));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to initialize the application.';
    dispatch(gameActions.initFailure(message));
    dispatch(scoreboardActions.loadFailure(message));
  }
};

export const changeGameMode = (mode: GameMode): AppThunk => async (dispatch, getState) => {
  dispatch(gameActions.setMode(mode));
  const state = getState();
  if (state.game.gameId) {
    try {
      await updateGameRecord(state.game.gameId, serializeGame(getState()));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to sync game mode with the API.';
      dispatch(gameActions.setError(message));
    }
  }
};

function dispatchMove(
  dispatch: (action: UnknownAction) => void,
  getState: () => RootState,
  cellIndex: number,
  player: Player,
  actingAsHuman: boolean
): boolean {
  const state = getState().game;
  const validation = validateMove({
    board: state.board,
    cellIndex,
    player,
    currentPlayer: state.currentPlayer,
    status: state.status,
    mode: state.mode,
    isComputerMoving: state.isComputerMoving,
    actingAsHuman,
  });

  if (!validation.valid) {
    if (validation.message) {
      dispatch(gameActions.setError(validation.message));
    }
    return false;
  }

  const result = applyMoveToBoard(
    state.board,
    cellIndex,
    player,
    state.moveHistory.length + 1,
    createMoveId()
  );

  dispatch(
    gameActions.applyMove({
      board: result.board,
      currentPlayer: result.nextPlayer,
      status: result.status,
      winner: result.winner,
      winningCells: result.winningCells,
      move: result.move,
    })
  );

  return true;
}

export const recordGameResultIfNeeded = (): AppThunk => async (dispatch, getState) => {
  const { game, scoreboard } = getState();
  if (game.status === 'InProgress' || game.isResultRecorded) {
    return;
  }

  const nextScores = {
    xWins: scoreboard.xWins + (game.status === 'Won' && game.winner === 'X' ? 1 : 0),
    oWins: scoreboard.oWins + (game.status === 'Won' && game.winner === 'O' ? 1 : 0),
    draws: scoreboard.draws + (game.status === 'Draw' ? 1 : 0),
  };

  try {
    const updated = await updateScoreboard(nextScores);
    dispatch(
      scoreboardActions.applyScores({
        xWins: updated.xWins,
        oWins: updated.oWins,
        draws: updated.draws,
      })
    );
    dispatch(gameActions.setResultRecorded());
    await updateGameRecord(game.gameId, {
      ...serializeGame(getState()),
      isResultRecorded: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update the scoreboard.';
    dispatch(gameActions.setError(message));
  }
};

export const syncGameState = (): AppThunk => async (dispatch, getState) => {
  const { game } = getState();
  if (!game.gameId) {
    return;
  }
  dispatch(gameActions.syncGameStart());
  try {
    await updateGameRecord(game.gameId, serializeGame(getState()));
    dispatch(gameActions.syncGameSuccess());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to sync the game with the API.';
    dispatch(gameActions.syncGameFailure(message));
  }
};

export const playComputerTurn = (): AppThunk => async (dispatch, getState) => {
  const state = getState().game;
  if (
    state.mode !== 'Computer' ||
    state.status !== 'InProgress' ||
    state.currentPlayer !== 'O' ||
    state.isComputerMoving
  ) {
    return;
  }

  dispatch(gameActions.setComputerMoving(true));

  await new Promise((resolve) => setTimeout(resolve, 400));

  const latest = getState().game;
  const cellIndex = selectComputerMove(latest.board);
  if (cellIndex === null) {
    dispatch(gameActions.setComputerMoving(false));
    return;
  }

  dispatchMove(dispatch, getState, cellIndex, 'O', false);
  dispatch(gameActions.setComputerMoving(false));
  await dispatch(recordGameResultIfNeeded());
  await dispatch(syncGameState());
};

export const playMove =
  (cellIndex: number): AppThunk =>
  async (dispatch, getState) => {
    dispatch(gameActions.clearError());
    const player = getState().game.currentPlayer;
    const moved = dispatchMove(dispatch, getState, cellIndex, player, true);
    if (!moved) {
      return;
    }

    await dispatch(recordGameResultIfNeeded());
    await dispatch(syncGameState());

    const afterMove = getState().game;
    if (
      afterMove.mode === 'Computer' &&
      afterMove.status === 'InProgress' &&
      afterMove.currentPlayer === 'O'
    ) {
      await dispatch(playComputerTurn());
    }
  };

export const undoLastMove = (): AppThunk => async (dispatch, getState) => {
  const state = getState().game;
  if (state.status !== 'InProgress') {
    return;
  }
  if (state.moveHistory.length === 0 || state.isComputerMoving) {
    return;
  }

  let removedCount = 1;
  if (state.mode === 'Computer') {
    const last = state.moveHistory[state.moveHistory.length - 1];
    if (last.player === 'O') {
      removedCount = 2;
    }
  }

  removedCount = Math.min(removedCount, state.moveHistory.length);
  dispatch(gameActions.undoMoves(removedCount));
  await dispatch(syncGameState());
};

export const resetCurrentGame = (): AppThunk => async (dispatch, getState) => {
  dispatch(gameActions.resetGame());
  await dispatch(syncGameState());
};

export const resetScoreboard = (): AppThunk => async (dispatch) => {
  dispatch(scoreboardActions.resetStart());
  try {
    const updated = await updateScoreboard({ xWins: 0, oWins: 0, draws: 0 });
    dispatch(
      scoreboardActions.applyScores({
        xWins: updated.xWins,
        oWins: updated.oWins,
        draws: updated.draws,
      })
    );
    dispatch(scoreboardActions.resetSuccess());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reset the scoreboard.';
    dispatch(scoreboardActions.resetFailure(message));
  }
};
