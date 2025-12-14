/**
 * Generates random snakes and ladders for the game board
 * Ensures no cell is used more than once and excludes start/end cells
 * @param {number} N - Board size (N x N)
 * @returns {Array} Array of move objects with start, end, and type
 */
function generateMoves(N) {
  const boardSize = N * N;
  const moves = new Map();
  const count = N - 2;

  const usedCells = new Set();
  usedCells.add(1);
  usedCells.add(boardSize);

  for (let i = 0; i < count; i++) {
    let start, end;
    do {
      start = Math.floor(Math.random() * (boardSize - 1)) + 1;
      end = Math.floor(Math.random() * (boardSize - start)) + start + 1;
    } while (usedCells.has(start) || usedCells.has(end));
    moves.set(start, end);
    usedCells.add(start);
    usedCells.add(end);
  }

  for (let i = 0; i < count; i++) {
    let start, end;
    do {
      start = Math.floor(Math.random() * (boardSize - 2)) + 2;
      end = Math.floor(Math.random() * (start - 1)) + 1;
    } while (usedCells.has(start) || usedCells.has(end));
    moves.set(start, end);
    usedCells.add(start);
    usedCells.add(end);
  }

  const movesArray = [];
  for (let [start, end] of moves.entries()) {
    movesArray.push({
      start: start,
      end: end,
      type: start < end ? "ladder" : "snake",
    });
  }
  return movesArray;
}

/**
 * Finds minimum throws using BFS algorithm
 * Uses breadth-first search to find shortest path from start to end
 * @param {Array} moves - Array of snake and ladder moves
 * @param {number} N - Board size (N x N)
 * @returns {number} Minimum throws required, or -1 if unreachable
 */
export function findMinThrowsBFS_forTesting(moves, N) {
  const boardSize = N * N;
  const movesMap = new Map();
  for (let move of moves) {
    movesMap.set(move.start, move.end);
  }

  const queue = [];
  queue.push([1, 0]);

  const visited = new Set();
  visited.add(1);

  while (queue.length > 0) {
    const [currentCell, throws] = queue.shift();

    for (let i = 1; i <= 6; i++) {
      let nextCell = currentCell + i;

      if (nextCell > boardSize) {
        continue;
      }

      if (movesMap.has(nextCell)) {
        nextCell = movesMap.get(nextCell);
      }

      if (nextCell === boardSize) {
        return throws + 1;
      }

      if (!visited.has(nextCell)) {
        visited.add(nextCell);
        queue.push([nextCell, throws + 1]);
      }
    }
  }

  return -1;
}

/**
 * Finds minimum throws using Dijkstra's algorithm
 * Uses priority queue to find shortest path from start to end
 * @param {Array} moves - Array of snake and ladder moves
 * @param {number} N - Board size (N x N)
 * @returns {number} Minimum throws required, or -1 if unreachable
 */
function findMinThrowsDijkstra(moves, N) {
  const boardSize = N * N;
  const movesMap = new Map();
  for (let move of moves) {
    movesMap.set(move.start, move.end);
  }

  const distances = new Array(boardSize + 1).fill(Infinity);
  const pq = [];

  distances[1] = 0;
  pq.push([0, 1]);

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);

    const [d, currentCell] = pq.shift();

    if (d > distances[currentCell]) {
      continue;
    }

    for (let i = 1; i <= 6; i++) {
      let nextCell = currentCell + i;

      if (nextCell > boardSize) {
        continue;
      }

      if (movesMap.has(nextCell)) {
        nextCell = movesMap.get(nextCell);
      }

      if (distances[nextCell] > d + 1) {
        distances[nextCell] = d + 1;
        pq.push([d + 1, nextCell]);
      }
    }
  }

  if (distances[boardSize] === Infinity) {
    return -1;
  }
  return distances[boardSize];
}

/**
 * Runs the game logic for Snake and Ladder
 * Generates random snakes and ladders, then calculates minimum throws using BFS and Dijkstra's algorithms
 * @param {number} N - Board size (N x N)
 * @returns {Object} Game result with board size, moves, minimum throws, and execution times
 */
export function runGameLogic(N) {
  const moves = generateMoves(N);

  const startTimeBFS = performance.now();
  const minThrowsBFS = findMinThrowsBFS_forTesting(moves, N);
  const endTimeBFS = performance.now();

  const startTimeDijkstra = performance.now();
  const minThrowsDijkstra = findMinThrowsDijkstra(moves, N);
  const endTimeDijkstra = performance.now();

  return {
    boardSize: N,
    snakesAndLadders: moves,
    minThrows: minThrowsBFS,
    timeTaken: {
      bfs_ms: endTimeBFS - startTimeBFS,
      dijkstra_ms: endTimeDijkstra - startTimeDijkstra,
    },
  };
}
