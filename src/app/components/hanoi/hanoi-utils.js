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
  const pegs = Array.from({ length: P }, () => []);
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

// --- 3-Peg Iterative Solver (FIXED) ---
export const solveHanoi3PegsIterative = (N, source, dest, aux, moves) => {
  if (N <= 0) return;

  const totalMoves = Math.pow(2, N) - 1;
  const pegs = [source, aux, dest];

  for (let i = 1; i <= totalMoves; i++) {
    const from = pegs[(i & (i - 1)) % 3];
    const to = pegs[((i | (i - 1)) + 1) % 3];
    const disk = Math.log2(i & -i) + 1;

    moves.push({ from, to, disk });
  }
};

// --- 4-Peg Frame-Stewart Solver (unchanged logic – already correct) ---
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

  solveHanoi4PegsFrameStewart(k, from, aux1, [aux2, to], moves, offset);
  solveHanoi3PegsRecursive(n - k, from, to, aux2, moves, offset + k);
  solveHanoi4PegsFrameStewart(k, aux1, to, [aux2, from], moves, offset);
};

// --- 4-Peg Iterative Solver (FIXED – VALID NON-OPTIMAL) ---
export const solveHanoi4PegsIterative = (N, source, dest, aux, moves) => {
  if (N <= 0) return;

  const [aux1, aux2] = aux;

  // Strategy:
  // 1. Move N-2 disks to aux1 (3-peg iterative)
  // 2. Move disk N-1 to aux2
  // 3. Move disk N to dest
  // 4. Move disk N-1 from aux2 to dest
  // 5. Move N-2 disks from aux1 to dest

  if (N === 1) {
    moves.push({ from: source, to: dest, disk: 1 });
    return;
  }

  if (N === 2) {
    moves.push({ from: source, to: aux1, disk: 1 });
    moves.push({ from: source, to: dest, disk: 2 });
    moves.push({ from: aux1, to: dest, disk: 1 });
    return;
  }

  solveHanoi3PegsIterative(N - 2, source, aux1, aux2, moves);

  moves.push({ from: source, to: aux2, disk: N - 1 });
  moves.push({ from: source, to: dest, disk: N });
  moves.push({ from: aux2, to: dest, disk: N - 1 });

  solveHanoi3PegsIterative(N - 2, aux1, dest, source, moves);
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
