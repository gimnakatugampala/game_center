/**
 * Minimum and maximum number of disks allowed in the game
 */
export const MIN_DISKS = 3;
export const MAX_DISKS = 10;

/**
 * Random number of disks between 5 and 10
 */
export const RANDOM_DISKS = Math.floor(Math.random() * 6) + 5;

/**
 * Available peg options for the game
 */
export const PEGS_OPTIONS = [3, 4];

/**
 * Algorithm options for 3-peg Tower of Hanoi
 */
export const ALGORITHM_OPTIONS_3P = {
  RECURSIVE: "Recursive Solution",
  NON_OPTIMAL: "Iterative Solution",
};

/**
 * Algorithm options for 4-peg Tower of Hanoi
 */
export const ALGORITHM_OPTIONS_4P = {
  FRAME_STEWART: "Frame-Stewart Solution",
  NON_OPTIMAL: "Iterative Solution",
};

/**
 * Initializes pegs with all disks on the first peg
 * @param {number} N - Number of disks
 * @param {number} P - Number of pegs
 * @returns {Array} Array of pegs with disks on the first peg
 */
export const initializePegs = (N, P) => {
  const pegs = Array.from({ length: P }, () => []);
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
  const sourcePeg = pegs[sourceIndex];
  const destPeg = pegs[destIndex];
  if (!sourcePeg || sourcePeg.length === 0) return false;
  const movingDisk = sourcePeg[sourcePeg.length - 1];
  const topDestDisk = destPeg[destPeg.length - 1];
  return destPeg.length === 0 || movingDisk < topDestDisk;
};

/**
 * Calculates minimum moves required for 3-peg Tower of Hanoi
 * @param {number} N - Number of disks
 * @returns {number} Minimum moves (2^N - 1)
 */
export const minMoves3Pegs = (N) => Math.pow(2, N) - 1;

/**
 * Calculates minimum moves required for 4-peg Tower of Hanoi
 * Uses known optimal values for small N, falls back to 3-peg formula for larger N
 * @param {number} N - Number of disks
 * @returns {number} Minimum moves
 */
export const minMoves4Pegs = (N) => {
  const knownOptimal = [0, 1, 3, 5, 9, 13, 17, 25, 33, 41, 49];
  return N < knownOptimal.length ? knownOptimal[N] : minMoves3Pegs(N);
};

/**
 * Solves 3-peg Tower of Hanoi recursively (optimal solution)
 * @param {number} N - Number of disks
 * @param {number} source - Source peg index
 * @param {number} dest - Destination peg index
 * @param {number} aux - Auxiliary peg index
 * @param {Array} moves - Array to store moves
 * @param {number} offset - Disk numbering offset
 */
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

/**
 * Solves 3-peg Tower of Hanoi iteratively (non-optimal)
 * Uses bit manipulation to determine moves
 * @param {number} N - Number of disks
 * @param {number} source - Source peg index
 * @param {number} dest - Destination peg index
 * @param {number} aux - Auxiliary peg index
 * @param {Array} moves - Array to store moves
 */
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

/**
 * Solves 4-peg Tower of Hanoi using Frame-Stewart algorithm (optimal)
 * @param {number} n - Number of disks
 * @param {number} from - Source peg index
 * @param {number} to - Destination peg index
 * @param {Array} aux - Array of two auxiliary peg indices
 * @param {Array} moves - Array to store moves
 * @param {number} offset - Disk numbering offset
 */
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

/**
 * Solves 4-peg Tower of Hanoi iteratively (non-optimal)
 * Strategy: Move N-2 disks to aux1, then move largest two disks, then move N-2 disks to destination
 * @param {number} N - Number of disks
 * @param {number} source - Source peg index
 * @param {number} dest - Destination peg index
 * @param {Array} aux - Array of two auxiliary peg indices
 * @param {Array} moves - Array to store moves
 */
export const solveHanoi4PegsIterative = (N, source, dest, aux, moves) => {
  if (N <= 0) return;

  const [aux1, aux2] = aux;

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

/**
 * Fetches leaderboard scores from the API
 * @returns {Promise<Array>} Array of leaderboard entries
 */
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

/**
 * Posts a score to the leaderboard API
 * @param {Object} scoreData - Score data to post
 * @returns {Promise<boolean>} True if successful
 */
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
