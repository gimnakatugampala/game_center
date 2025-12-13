// --- Constants ---
export const MIN_DISKS = 3;
export const MAX_DISKS = 10;

export const RANDOM_DISKS = Math.floor(Math.random() * 6) + 5;
export const PEGS_OPTIONS = [3, 4];

// --- Solver Algorithm Options ---
export const ALGORITHM_OPTIONS_3P = {
  RECURSIVE: "Recursive Optimal Solution",
  NON_OPTIMAL: "Non-Optimal Iterative Solution",
};

export const ALGORITHM_OPTIONS_4P = {
  FRAME_STEWART: "Frame-Stewart Optimal Solution",
  NON_OPTIMAL: "Non-Optimal Iterative Solution",
};

// --- Initialize Pegs ---
export const initializePegs = (N, P) => {
  const pegs = Array(P)
    .fill(0)
    .map(() => []);
  for (let i = N; i >= 1; i--) pegs[0].push(i);
  return pegs;
};

// --- Move Validation ---
export const isMoveValid = (pegs, sourceIndex, destIndex) => {
  const sourcePeg = pegs[sourceIndex];
  const destPeg = pegs[destIndex];
  if (!sourcePeg || sourcePeg.length === 0) return false;
  const movingDisk = sourcePeg[sourcePeg.length - 1];
  const topDestDisk = destPeg[destPeg.length - 1];
  return destPeg.length === 0 || movingDisk < topDestDisk;
};

// --- Optimal Moves ---
export const minMoves3Pegs = (N) => Math.pow(2, N) - 1;

// Known optimal moves for 4 pegs (0..10 disks)
export const minMoves4Pegs = (N) => {
  const knownOptimal = [0, 1, 3, 5, 9, 13, 17, 25, 33, 41, 49];
  return N < knownOptimal.length ? knownOptimal[N] : minMoves3Pegs(N);
};

// --- 3-Peg Recursive Solver ---
export const solveHanoi3PegsRecursive = (
  N,
  source,
  dest,
  aux,
  moves,
  offset = 0
) => {
  if (N === 0) return;
  solveHanoi3PegsRecursive(N - 1, source, aux, dest, moves, offset);
  moves.push({ from: source, to: dest, disk: N + offset });
  solveHanoi3PegsRecursive(N - 1, aux, dest, source, moves, offset);
};

// --- 3-Peg Iterative Solver (correct Hanoi sequence) ---
export const solveHanoi3PegsIterative = (N, source, dest, aux, moves) => {
  if (N <= 0) return;
  const totalMoves = Math.pow(2, N) - 1;
  const pegsMap = [source, aux, dest];
  for (let i = 1; i <= totalMoves; i++) {
    const from = pegsMap[(i & (i - 1)) % 3];
    const to = pegsMap[((i | (i - 1)) + 1) % 3];
    moves.push({ from, to, disk: Math.ceil(Math.log2(i & -i) + 1) });
  }
};

// --- 4-Peg Frame-Stewart Solver ---
export const solveHanoi4PegsFrameStewart = (
  n,
  from,
  to,
  aux,
  moves,
  offset = 0
) => {
  if (n === 0) return;
  if (n === 1) {
    moves.push({ from, to, disk: 1 + offset });
    return;
  }
  let k = n - Math.round(Math.sqrt(2 * n + 1)) + 1;
  if (k < 1) k = 1;

  const [aux1, aux2] = aux;

  // Step 1: Move k smallest disks to aux1
  solveHanoi4PegsFrameStewart(k, from, aux1, [aux2, to], moves, offset);

  // Step 2: Move remaining n-k largest disks using 3 pegs
  solveHanoi3PegsRecursive(n - k, from, to, aux2, moves, offset + k);

  // Step 3: Move k smallest disks from aux1 to destination
  solveHanoi4PegsFrameStewart(k, aux1, to, [aux2, from], moves, offset);
};

// --- 4-Peg Iterative Solver (non-optimal) ---
export const solveHanoi4PegsIterative = (N, source, dest, aux, moves) => {
  if (N <= 0) return;
  const [aux1, aux2] = aux;
  for (let i = N; i >= 1; i--) {
    moves.push({ from: source, to: aux1, disk: i });
    moves.push({ from: source, to: aux2, disk: i });
    moves.push({ from: aux1, to: dest, disk: i });
    moves.push({ from: aux2, to: dest, disk: i });
  }
};

// --- API Integration ---
export const fetchLeaderboard = async () => {
  try {
    const res = await fetch("/api/hanoi/scores", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
    const data = await res.json();
    return data.success ? data.scores : [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const postScore = async (scoreData) => {
  try {
    const res = await fetch("/api/hanoi/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scoreData),
    });
    const data = await res.json();
    return res.ok && data.success;
  } catch (error) {
    console.error("Error posting score:", error);
    return false;
  }
};
