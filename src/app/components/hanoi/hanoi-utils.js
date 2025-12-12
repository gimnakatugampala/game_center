// --- Constants ---
export const MIN_DISKS = 3;
export const MAX_DISKS = 10;

const randomValue = Math.floor(Math.random() * 6) + 5;
export const RANDOM_DISKS = randomValue;
export const PEGS_OPTIONS = [3, 4];

// --- Solver Algorithm Options ---
export const ALGORITHM_OPTIONS_3P = {
  RECURSIVE: "Recursive Optimal Solution",
  NON_OPTIMAL: "Non-Optimal Heuristic Solution",
};

export const ALGORITHM_OPTIONS_4P = {
  FRAME_STEWART: "Frame-Stewart Optimal Solution",
  NON_OPTIMAL: "Non-Optimal Heuristic Solution",
};

// --- Initialize Pegs ---
export const initializePegs = (N, P) => {
  if (N <= 0 || P <= 0) return [];
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
  if (sourcePeg.length === 0) return false;
  const movingDisk = sourcePeg[sourcePeg.length - 1];
  const topDestDisk = destPeg[destPeg.length - 1];
  return destPeg.length === 0 || movingDisk < topDestDisk;
};

// --- Optimal Moves ---
export const minMoves3Pegs = (N) => Math.pow(2, N) - 1;

export const minMoves4Pegs = (N) => {
  const knownOptimal = [0, 1, 3, 5, 9, 13, 17, 25, 33, 41, 49];
  if (N < knownOptimal.length) return knownOptimal[N];
  return minMoves3Pegs(N); // fallback
};

// --- 3-Peg Solvers ---
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

export const solveHanoi3PegsHeuristic = (
  N,
  source,
  dest,
  aux,
  moves,
  offset = 0
) => {
  if (N === 0) return;
  if (N === 1) {
    moves.push({ from: source, to: dest, disk: 1 + offset });
    return;
  }
  moves.push({ from: source, to: aux, disk: N + offset });
  solveHanoi3PegsHeuristic(N - 1, source, dest, aux, moves, offset);
  moves.push({ from: aux, to: dest, disk: N + offset });
};

// --- 4-Peg Solvers ---
export const solveHanoi4PegsFrameStewart = (n, from, to, aux, moves) => {
  if (n === 0) return;
  if (n === 1) {
    moves.push({ from, to, disk: 1 });
    return;
  }

  let k = n - Math.round(Math.sqrt(2 * n + 1)) + 1;
  if (k < 1) k = 1;

  const [aux1, aux2] = aux;

  // Step 1: Move k smallest disks (1 to k) to aux1
  solveHanoi4PegsFrameStewart(k, from, aux1, [aux2, to], moves);

  // Step 2: Move remaining n-k largest disks (k+1 to n) using 3 pegs
  solveHanoi3PegsRecursive(n - k, from, to, aux2, moves, k);

  // Step 3: Move k smallest disks from aux1 to to
  solveHanoi4PegsFrameStewart(k, aux1, to, [aux2, from], moves);
};

export const solveHanoi4PegsHeuristic = (
  N,
  source,
  dest,
  aux,
  moves,
  offset = 0
) => {
  if (N === 0) return;
  if (N === 1) {
    moves.push({ from: source, to: dest, disk: 1 + offset });
    return;
  }
  const [aux1] = aux;
  moves.push({ from: source, to: aux1, disk: N + offset });
  solveHanoi4PegsHeuristic(N - 1, source, dest, aux, moves, offset);
  moves.push({ from: aux1, to: dest, disk: N + offset });
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
    if (!res.ok || !data.success) {
      console.error("Failed to post score:", data.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error posting score:", error);
    return false;
  }
};
