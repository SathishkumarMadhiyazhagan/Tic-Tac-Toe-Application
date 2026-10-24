import type { GameMode, GameStatus, Move, Player } from '@tic-tac-toe/game-util-game-logic';
import type { Board } from '@tic-tac-toe/game-util-game-logic';

const API_BASE = 'http://localhost:3000';

export interface StoredGame {
  id: string;
  mode: GameMode;
  status: GameStatus;
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  winningCells: number[];
  moveHistory: Move[];
  isResultRecorded: boolean;
}

export interface ScoreboardRecord {
  id: number;
  xWins: number;
  oWins: number;
  draws: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function createGameRecord(game: Omit<StoredGame, 'id'>): Promise<StoredGame> {
  const response = await fetch(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  return handleResponse<StoredGame>(response);
}

export async function updateGameRecord(
  id: string,
  game: Partial<StoredGame>
): Promise<StoredGame> {
  const response = await fetch(`${API_BASE}/games/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  return handleResponse<StoredGame>(response);
}

export async function fetchScoreboard(): Promise<ScoreboardRecord> {
  const response = await fetch(`${API_BASE}/scoreboard/1`);
  return handleResponse<ScoreboardRecord>(response);
}

export async function updateScoreboard(
  scores: Pick<ScoreboardRecord, 'xWins' | 'oWins' | 'draws'>
): Promise<ScoreboardRecord> {
  const response = await fetch(`${API_BASE}/scoreboard/1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scores),
  });
  return handleResponse<ScoreboardRecord>(response);
}
