/**
 * Tower of Hanoi core logic functions
 * Provides algorithms for solving Tower of Hanoi puzzles with 3 or 4 pegs
 */

/**
 * Minimum and maximum number of disks for random generation
 */
export const MIN_DISKS_FOR_RANDOM = 3;
export const MAX_DISKS_FOR_RANDOM = 10;

/**
 * Calculates minimum moves required for 3-peg Tower of Hanoi
 * @param {number} N - Number of disks
 * @returns {number} Minimum moves (2^N - 1)
 */
export const minMoves3Pegs = (N) => Math.pow(2, N) - 1;

/**
 * Memoization cache for 4-peg Frame-Stewart minimum moves
 */
const memo4Pegs = {};

/**
 * Calculates minimum moves required for 4-peg Tower of Hanoi using Frame-Stewart algorithm
 * @param {number} N - Number of disks
 * @returns {number} Minimum moves
 */
export const minMoves4Pegs = (N) => {
  if (N in memo4Pegs) return memo4Pegs[N];
  if (N <= 0) return 0;
  if (N === 1) return 1;

  let min = Infinity;
  for (let k = 1; k < N; k++) {
    const moves = 2 * k + minMoves3Pegs(N - k);
    if (moves < min) min = moves;
  }

  memo4Pegs[N] = min;
  return min;
};

/**
 * Initializes pegs with all disks on the first peg
 * @param {number} N - Number of disks
 * @param {number} P - Number of pegs
 * @returns {Array} Array of pegs with disks on the first peg
 */
export const initializePegs = (N, P) => {
  if (N <= 0 || P < 3) return [];
  const pegs = Array(P)
    .fill(0)
    .map(() => []);
  for (let i = N; i >= 1; i--) pegs[0].push(i);
  return pegs;
};

/**
 * Validates if a move is legal according to Tower of Hanoi rules
 * @param {Array} pegs - Array of peg arrays
 * @param {number} sourceIndex - Index of source peg
 * @param {number} destIndex - Index of destination peg
 * @returns {boolean} True if move is valid
 */
export const isMoveValid = (pegs, sourceIndex, destIndex) => {
  if (sourceIndex === destIndex) return false;
  const sourcePeg = pegs[sourceIndex];
  const destPeg = pegs[destIndex];
  if (!sourcePeg || sourcePeg.length === 0) return false;
  const movingDisk = sourcePeg[sourcePeg.length - 1];
  const topDestDisk = destPeg[destPeg.length - 1];
  return !topDestDisk || movingDisk < topDestDisk;
};

/**
 * Solves 3-peg Tower of Hanoi recursively (optimal solution)
 * @param {number} n - Number of disks
 * @param {number} source - Source peg index
 * @param {number} destination - Destination peg index
 * @param {number} auxiliary - Auxiliary peg index
 * @param {Array} moves - Array to store moves
 */
export const solveHanoi3PegsRecursive = (
  n,
  source,
  destination,
  auxiliary,
  moves
) => {
  if (n === 0) return;
  solveHanoi3PegsRecursive(n - 1, source, auxiliary, destination, moves);
  moves.push({ disk: n, from: source, to: destination });
  solveHanoi3PegsRecursive(n - 1, auxiliary, destination, source, moves);
};

/**
 * Solves 3-peg Tower of Hanoi iteratively (non-optimal)
 * @param {number} n - Number of disks
 * @param {number} source - Source peg index
 * @param {number} destination - Destination peg index
 * @param {number} auxiliary - Auxiliary peg index
 * @param {Array} moves - Array to store moves
 */
export const solveHanoi3PegsIterative = (
  n,
  source,
  destination,
  auxiliary,
  moves
) => {
  if (n === 0) return;
  if (n === 1) {
    moves.push({ disk: 1, from: source, to: destination });
    return;
  }
  moves.push({ disk: n - 1, from: source, to: auxiliary });
  solveHanoi3PegsIterative(n - 1, source, destination, auxiliary, moves);
  moves.push({ disk: n - 1, from: auxiliary, to: destination });
};

/**
 * Solves 4-peg Tower of Hanoi using Frame-Stewart algorithm (optimal)
 * @param {number} n - Number of disks
 * @param {number} source - Source peg index
 * @param {number} destination - Destination peg index
 * @param {Array} auxiliaries - Array of two auxiliary peg indices
 * @param {Array} moves - Array to store moves
 */
export const solveHanoi4PegsFrameStewart = (
  n,
  source,
  destination,
  auxiliaries,
  moves
) => {
  if (n === 0) return;
  if (n === 1) {
    moves.push({ disk: 1, from: source, to: destination });
    return;
  }

  const [aux1, aux2] = auxiliaries;

  let minMoves = Infinity;
  let k = 1;
  for (let i = 1; i < n; i++) {
    const currentMoves = 2 * i + minMoves3Pegs(n - i);
    if (currentMoves < minMoves) {
      minMoves = currentMoves;
      k = i;
    }
  }

  const n_minus_k = n - k;

  solveHanoi4PegsFrameStewart(k, source, aux1, [destination, aux2], moves);
  solveHanoi3PegsRecursive(n_minus_k, source, destination, aux2, moves);
  solveHanoi4PegsFrameStewart(k, aux1, destination, [source, aux2], moves);
};

/**
 * Solves 4-peg Tower of Hanoi iteratively (non-optimal)
 * @param {number} n - Number of disks
 * @param {number} source - Source peg index
 * @param {number} destination - Destination peg index
 * @param {Array} auxiliaries - Array of two auxiliary peg indices
 * @param {Array} moves - Array to store moves
 */
export const solveHanoi4PegsIterative = (
  n,
  source,
  destination,
  auxiliaries,
  moves
) => {
  if (n === 0) return;
  if (n === 1) {
    moves.push({ disk: 1, from: source, to: destination });
    return;
  }
  const [aux1, aux2] = auxiliaries;

  solveHanoi4PegsIterative(n - 1, source, aux1, [destination, aux2], moves);
  moves.push({ disk: n, from: source, to: destination });
  solveHanoi4PegsIterative(n - 1, aux1, destination, [source, aux2], moves);
};
