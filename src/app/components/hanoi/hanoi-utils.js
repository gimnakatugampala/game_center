// Constants for Tower of Hanoi application
export const MIN_DISKS = 3;
export const MAX_DISKS = 10;
export const PEGS_OPTIONS = [3, 4];

export const ALGORITHM_OPTIONS_3P = {
  RECURSIVE: "Recursive Optimal Solution",
};

export const ALGORITHM_OPTIONS_4P = {
  FRAME_STEWART: "Frame-Stewart Optimal Solution",
  NON_OPTIMAL: "Non-Optimal Heuristic Solution",
};

// --- Initialization ---
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
  return minMoves3Pegs(N);
};

// --- Solvers ---
export const solveHanoi3PegsRecursive = (
  N,
  source,
  destination,
  auxiliary,
  moves
) => {
  if (N === 0) return;
  solveHanoi3PegsRecursive(N - 1, source, auxiliary, destination, moves);
  moves.push({ from: source, to: destination });
  solveHanoi3PegsRecursive(N - 1, auxiliary, destination, source, moves);
};

export const solveHanoi4PegsFrameStewart = (
  N,
  source,
  destination,
  auxiliaries,
  moves
) => {
  if (N === 0) return;
  if (N === 1) {
    moves.push({ from: source, to: destination });
    return;
  }
  let k = Math.floor(N / 2);
  if (k === 0) k = 1;
  const [aux1, aux2] = auxiliaries;

  solveHanoi3PegsRecursive(k, source, aux1, aux2, moves);
  for (let i = 0; i < N - k; i++) moves.push({ from: source, to: destination });
  solveHanoi3PegsRecursive(k, aux1, destination, aux2, moves);
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
