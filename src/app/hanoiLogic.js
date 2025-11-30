// Tower of Hanoi Core Logic

// --- Constants ---
export const MIN_DISKS_FOR_RANDOM = 3;
export const MAX_DISKS_FOR_RANDOM = 10;

// --- Minimum Moves Calculations ---
export const minMoves3Pegs = (N) => Math.pow(2, N) - 1;

// Memoization cache for 4-peg Frame-Stewart
const memo4Pegs = {};
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

// --- Initialize Pegs ---
export const initializePegs = (N, P) => {
  if (N <= 0 || P < 3) return [];
  const pegs = Array(P)
    .fill(0)
    .map(() => []);
  for (let i = N; i >= 1; i--) pegs[0].push(i);
  return pegs;
};

// --- Move Validation ---
export const isMoveValid = (pegs, sourceIndex, destIndex) => {
  if (sourceIndex === destIndex) return false;
  const sourcePeg = pegs[sourceIndex];
  const destPeg = pegs[destIndex];
  if (!sourcePeg || sourcePeg.length === 0) return false;
  const movingDisk = sourcePeg[sourcePeg.length - 1];
  const topDestDisk = destPeg[destPeg.length - 1];
  return !topDestDisk || movingDisk < topDestDisk;
};

// --- 3-Peg Solvers ---
// Recursive Optimal
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

// Non-Optimal Heuristic (moves largest disk later)
export const solveHanoi3PegsHeuristic = (
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
  solveHanoi3PegsHeuristic(n - 1, source, destination, auxiliary, moves);
  moves.push({ disk: n - 1, from: auxiliary, to: destination });
};

// --- 4-Peg Solvers ---
// Frame-Stewart Optimal
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

  // Find optimal split k
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

  // Move top k disks to aux1 recursively (4 pegs)
  solveHanoi4PegsFrameStewart(k, source, aux1, [destination, aux2], moves);

  // Move remaining n-k disks to destination using 3 pegs
  solveHanoi3PegsRecursive(n_minus_k, source, destination, aux2, moves);

  // Move top k disks from aux1 to destination recursively
  solveHanoi4PegsFrameStewart(k, aux1, destination, [source, aux2], moves);
};

// 4-Peg Non-Optimal Heuristic
export const solveHanoi4PegsHeuristic = (
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

  // Move n-1 disks to aux1
  solveHanoi4PegsHeuristic(n - 1, source, aux1, [destination, aux2], moves);

  // Move largest disk to destination
  moves.push({ disk: n, from: source, to: destination });

  // Move n-1 disks from aux1 to destination
  solveHanoi4PegsHeuristic(n - 1, aux1, destination, [source, aux2], moves);
};
