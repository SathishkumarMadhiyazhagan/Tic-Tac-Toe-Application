# Tic Tac Toe (React 18 + Redux + Nx + MUI)

Browser-based Tic Tac Toe built to the technical exercise specification: two-player and computer modes, move history, undo, session scoreboard, Redux state management, and a local `json-server` REST API.

## Technology stack

- **React 18** (functional components and hooks)
- **Nx** monorepo
- **Redux** + **redux-thunk** (standard actions/reducers, not Redux Toolkit)
- **Material UI (MUI)** for layout and styling
- **json-server** for local persistence (`db.json`)
- **Vitest** + **React Testing Library** (Jest-compatible API; run via Nx)

## Features

- 3×3 board with win/draw detection and winning-cell highlight
- Two Player and Play Against Computer modes
- Computer (O) AI: win → block → centre → corner → first free cell
- Move history table (move number, player, row/column)
- Undo (disabled after game completion; computer mode removes human+computer pair when applicable)
- Session scoreboard (X / O / draws), reset game vs reset scoreboard
- REST sync for games and scoreboard

## Project structure

```
tic-tac-toe/
├── apps/tic-tac-toe/          # React shell app
├── libs/game/
│   ├── util-game-logic/       # Pure rules, validation, computer AI
│   ├── data-access/           # Redux store, thunks, API client
│   ├── ui-board/              # Board UI
│   └── feature-game/          # Main game screen
├── libs/scoreboard/feature-scoreboard/
├── db.json
└── package.json
```

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

```bash
cd tic-tac-toe
npm install
```

## Run locally

**Terminal 1 – mock API (port 3000):**

```bash
npm run api
```

**Terminal 2 – React app (port 4200):**

```bash
npm run start
```

Or both together:

```bash
npm run dev
```

- Frontend: http://localhost:4200
- API: http://localhost:3000

## Mock API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/games` | Create a game record |
| GET | `/games/:id` | Get a game |
| PATCH | `/games/:id` | Update game state |
| GET | `/scoreboard/1` | Read scoreboard |
| PATCH | `/scoreboard/1` | Update or reset scoreboard |

## Tests

```bash
npm test
# or
npx nx test tic-tac-toe
```

## Redux state

- **`game`**: board, turn, mode, status, winner, winning cells, history, computer-move flag, API flags
- **`scoreboard`**: `xWins`, `oWins`, `draws`, loading/error

Async work (init, moves, undo, reset, scoreboard) uses **redux-thunk**.

## Computer-move algorithm

When it is O’s turn, the computer picks the first matching rule:

1. Winning move for O  
2. Block X’s winning line  
3. Centre (cell index 4)  
4. First available corner (0, 2, 6, 8)  
5. First empty cell left-to-right  

Ties at the same priority use the first matching cell in that list.

## Undo behaviour

- **Two Player:** removes only the latest move.  
- **Computer:** removes O’s last move and the preceding X move when both exist; if only X has moved, removes X only.  
- **After win/draw:** undo is **disabled** (no scoreboard rollback).

## Scoreboard

Updated once per completed game (`isResultRecorded`). Unchanged on mode change or reset game. **Reset Scoreboard** clears counts only.

## AI-assisted development

This solution was implemented with AI assistance (Cursor): scaffolding, Redux/MUI wiring, tests, and README. Game rules and computer priority were reviewed against the PDF spec; computer tie-breaking is documented above.

## Assumptions and limitations

- Game rules are enforced in the frontend; the API stores JSON only.
- A single scoreboard record (`id: 1`) is used for the session.
- Computer move uses a short delay for UX (`isComputerMoving`).

## Future improvements

- End-to-end tests with Playwright
- Persist multiple game sessions in the UI
- Stronger API error retry/backoff
