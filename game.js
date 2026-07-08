// ============================================================
// GAME.JS -- Maze definition, rendering, and state transitions
//
// READ ONLY -- do not modify this file.
// All your work goes in reward.js.
// ============================================================


// ============================================================
// MAZE CONFIGURATION
// ============================================================

const ROWS      = 10;
const COLS      = 10;
const CELL_SIZE = 48;

// The maze grid.
// 0 = open path the agent can walk on
// 1 = wall the agent cannot pass through
//
// Open areas are intentional -- rows 2 and 4 are wide open
// so the agent has room to explore before learning.
const MAZE = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],   // row 0
  [0, 1, 1, 0, 1, 0, 1, 1, 1, 0],   // row 1
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],   // row 2  -- wide open area
  [1, 1, 0, 1, 1, 1, 0, 0, 1, 0],   // row 3
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],   // row 4  -- completely open
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1],   // row 5
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],   // row 6
  [0, 1, 0, 1, 1, 0, 0, 0, 0, 0],   // row 7  -- open right side
  [0, 1, 0, 0, 0, 0, 1, 1, 1, 0],   // row 8
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],   // row 9
];

const START = { row: 0, col: 0 };
const GOAL  = { row: 9, col: 9 };


// ============================================================
// ACTIONS
// ============================================================

const ACTIONS = ["up", "right", "down", "left"];

const ACTION_DELTAS = [
  { drow: -1, dcol:  0 },  // up
  { drow:  0, dcol:  1 },  // right
  { drow:  1, dcol:  0 },  // down
  { drow:  0, dcol: -1 },  // left
];


// ============================================================
// STATE ENCODING
// ============================================================

function stateToIndex(row, col) {
  return row * COLS + col;
}

function indexToState(index) {
  return {
    row: Math.floor(index / COLS),
    col: index % COLS,
  };
}


// ============================================================
// WORLD QUERIES
// ============================================================

function isWall(row, col) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
  return MAZE[row][col] === 1;
}

function isGoal(row, col) {
  return row === GOAL.row && col === GOAL.col;
}

function getDistToGoal(row, col) {
  return Math.abs(row - GOAL.row) + Math.abs(col - GOAL.col);
}


// ============================================================
// STATE TRANSITIONS
// ============================================================

function takeAction(stateIndex, actionIndex, stepCount) {
  const { row, col } = indexToState(stateIndex);
  const delta = ACTION_DELTAS[actionIndex];

  const newRow = row + delta.drow;
  const newCol = col + delta.dcol;

  const hitWall   = isWall(newRow, newCol);
  const actualRow = hitWall ? row : newRow;
  const actualCol = hitWall ? col : newCol;

  return {
    stateIndex: stateToIndex(actualRow, actualCol),

    // The cell the agent tried to enter (may be out of bounds or a wall).
    // Used by the renderer to highlight the blocked cell.
    hitWallPos: hitWall ? { row: newRow, col: newCol } : null,

    prevStateObj: {
      row,
      col,
      distToGoal: getDistToGoal(row, col),
      steps: stepCount,
    },

    newStateObj: {
      row:         actualRow,
      col:         actualCol,
      distToGoal:  getDistToGoal(actualRow, actualCol),
      reachedGoal: isGoal(actualRow, actualCol),
      hitWall:     hitWall,
      steps:       stepCount + 1,
    },
  };
}


// ============================================================
// RENDERING
//
// hitWallPos (optional): { row, col } of the cell the agent
// tried to enter. If in-grid, that wall cell is highlighted
// orange. If out of bounds, the canvas edge is highlighted.
// ============================================================

function drawMaze(canvas, agentRow, agentCol, hitWallPos = null) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Determine if a hit-wall position is inside the grid
  const hitInGrid = hitWallPos &&
    hitWallPos.row >= 0 && hitWallPos.row < ROWS &&
    hitWallPos.col >= 0 && hitWallPos.col < COLS;

  // Draw each cell
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE;

      const isHit = hitInGrid &&
        hitWallPos.row === r && hitWallPos.col === c;

      if (isHit) {
        // Wall that was just hit -- highlight orange
        ctx.fillStyle = "#f97316";
      } else if (MAZE[r][c] === 1) {
        ctx.fillStyle = "#2c2c2c";
      } else if (r === GOAL.row && c === GOAL.col) {
        ctx.fillStyle = "#dcfce7";
      } else if (r === START.row && c === START.col) {
        ctx.fillStyle = "#eff6ff";
      } else {
        ctx.fillStyle = "#f8f8f8";
      }

      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth   = 0.5;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    }
  }

  // Highlight canvas boundary if agent tried to walk out of bounds
  if (hitWallPos && !hitInGrid) {
    const thickness = 5;
    ctx.fillStyle = "#f97316";

    if (hitWallPos.row < 0) {
      // tried to go up past row 0
      ctx.fillRect(agentCol * CELL_SIZE, 0, CELL_SIZE, thickness);
    } else if (hitWallPos.row >= ROWS) {
      // tried to go down past last row
      ctx.fillRect(agentCol * CELL_SIZE, canvas.height - thickness, CELL_SIZE, thickness);
    } else if (hitWallPos.col < 0) {
      // tried to go left past col 0
      ctx.fillRect(0, agentRow * CELL_SIZE, thickness, CELL_SIZE);
    } else if (hitWallPos.col >= COLS) {
      // tried to go right past last col
      ctx.fillRect(canvas.width - thickness, agentRow * CELL_SIZE, thickness, CELL_SIZE);
    }
  }

  // Labels
  const labelSize = Math.round(CELL_SIZE * 0.2);
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#16a34a";
  ctx.font      = `bold ${labelSize}px sans-serif`;
  ctx.fillText(
    "GOAL",
    GOAL.col * CELL_SIZE + CELL_SIZE / 2,
    GOAL.row * CELL_SIZE + CELL_SIZE / 2
  );

  ctx.fillStyle = "#1d4ed8";
  ctx.font      = `${labelSize - 1}px sans-serif`;
  ctx.fillText(
    "START",
    START.col * CELL_SIZE + CELL_SIZE / 2,
    START.row * CELL_SIZE + CELL_SIZE / 2
  );

  // Agent (drawn last so it appears on top of everything)
  const ax = agentCol * CELL_SIZE + CELL_SIZE / 2;
  const ay = agentRow * CELL_SIZE + CELL_SIZE / 2;

  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.arc(ax, ay, CELL_SIZE * 0.32, 0, Math.PI * 2);
  ctx.fill();
}


// ============================================================
// POLICY VISUALIZATION
// ============================================================

function visualizePolicy(canvas) {
  const ctx    = canvas.getContext("2d");
  const arrows = ["↑", "→", "↓", "←"];
  const size   = Math.round(CELL_SIZE * 0.32);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === 1) continue;
      if (r === GOAL.row && c === GOAL.col) continue;

      const state     = stateToIndex(r, c);
      const qValues   = qTable[state];
      const bestIndex = qValues.indexOf(Math.max(...qValues));

      ctx.fillStyle    = "rgba(60, 60, 60, 0.4)";
      ctx.font         = `${size}px sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        arrows[bestIndex],
        c * CELL_SIZE + CELL_SIZE / 2,
        r * CELL_SIZE + CELL_SIZE / 2
      );
    }
  }
}