import {
  initializePegs,
  isMoveValid,
  minMoves3Pegs,
  minMoves4Pegs,
  solveHanoi3PegsRecursive,
  solveHanoi3PegsHeuristic,
  solveHanoi4PegsFrameStewart,
  solveHanoi4PegsHeuristic,
} from "../../app/components/hanoi/hanoi-utils";

// Utility: verify final configuration
const verifyFinalState = (N, moves, P) => {
  let pegs = initializePegs(N, P);
  const destination = P - 1;

  for (const move of moves) {
    const disk = pegs[move.from].pop();
    expect(disk).toBe(move.disk);
    pegs[move.to].push(disk);
  }

  // Destination peg must contain all disks (largest at bottom)
  expect(pegs[destination]).toEqual([...Array(N)].map((_, i) => N - i));

  // Other pegs empty
  for (let i = 0; i < P; i++) {
    if (i !== destination) expect(pegs[i]).toEqual([]);
  }
};

//
// --------------------------------------------------------
// initializePegs Tests
// --------------------------------------------------------
describe("initializePegs", () => {
  test("initializes 3 pegs with correct disk order", () => {
    const pegs = initializePegs(3, 3);
    expect(pegs.length).toBe(3);
    expect(pegs[0]).toEqual([3, 2, 1]);
  });

  test("initializes 4 pegs correctly", () => {
    const pegs = initializePegs(3, 4);
    expect(pegs.length).toBe(4);
    expect(pegs[0]).toEqual([3, 2, 1]);
  });

  test("returns [] for invalid inputs", () => {
    const pegs = initializePegs(0, 3);
    expect(pegs).toEqual([]);
  });
});

//
// --------------------------------------------------------
// isMoveValid Tests
// --------------------------------------------------------
describe("isMoveValid", () => {
  const pegs = [[3, 2, 1], [], []];

  test("fails when source peg is empty", () => {
    expect(isMoveValid(pegs, 1, 0)).toBe(false);
  });

  test("allows moving to empty peg", () => {
    expect(isMoveValid(pegs, 0, 1)).toBe(true);
  });

  test("allows moving disk onto larger disk", () => {
    const mid = [[3], [1], [2]];
    expect(isMoveValid(mid, 1, 2)).toBe(true);
  });

  test("blocks move onto smaller disk", () => {
    const mid = [[3], [1], [2]];
    expect(isMoveValid(mid, 0, 1)).toBe(false);
  });
});

//
// --------------------------------------------------------
// Optimal moves
// --------------------------------------------------------
describe("Optimal move counts", () => {
  test("minMoves3Pegs returns 2^N - 1", () => {
    expect(minMoves3Pegs(3)).toBe(7);
  });

  test("minMoves4Pegs returns known optimal values", () => {
    expect(minMoves4Pegs(5)).toBe(13);
  });
});

//
// --------------------------------------------------------
// 3-Peg Solver - Recursive Optimal
// --------------------------------------------------------
describe("3-Peg Solver - Recursive", () => {
  const N = 4;
  const optimal = minMoves3Pegs(N);

  test("recursive solver produces correct sequence", () => {
    const moves = [];
    solveHanoi3PegsRecursive(N, 0, 2, 1, moves);
    expect(moves.length).toBe(optimal);
    verifyFinalState(N, moves, 3);
  });
});

//
// --------------------------------------------------------
// 3-Peg Solver - Heuristic
// --------------------------------------------------------
describe("3-Peg Solver - Heuristic", () => {
  test("heuristic solver produces some moves", () => {
    const N = 4;
    const moves = [];
    solveHanoi3PegsHeuristic(N, 0, 2, 1, moves);
    expect(moves.length).toBeGreaterThan(0);
  });
});

//
// --------------------------------------------------------
// 4-Peg Solver - Frame-Stewart
// --------------------------------------------------------
describe("4-Peg Solver - Frame-Stewart", () => {
  test("N = 4 produces valid final state", () => {
    const N = 4;
    const moves = [];
    solveHanoi4PegsFrameStewart(N, 0, 3, [1, 2], moves);
    verifyFinalState(N, moves, 4);
  });

  test("N = 5 produces valid final state", () => {
    const N = 5;
    const moves = [];
    solveHanoi4PegsFrameStewart(N, 0, 3, [1, 2], moves);
    verifyFinalState(N, moves, 4);
  });
});

//
// --------------------------------------------------------
// 4-Peg Solver - Heuristic
// --------------------------------------------------------
describe("4-Peg Solver - Heuristic", () => {
  test("heuristic solver produces some moves", () => {
    const N = 4;
    const moves = [];
    solveHanoi4PegsHeuristic(N, 0, 3, [1, 2], moves);
    expect(moves.length).toBeGreaterThan(0);
  });
});

//
// --------------------------------------------------------
// Benchmark – 15 Rounds for All Algorithms
// --------------------------------------------------------
const ROUNDS = 15;
const ITERATIONS = 1; // Keep 1 for heavy computations like 10-20 disks

const benchmark = (label, solveFn, argsBuilder) => {
  const timesTotal = [];

  for (let i = 0; i < ROUNDS; i++) {
    const N = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Random disks 5 - 10
    const start = performance.now();

    for (let j = 0; j < ITERATIONS; j++) {
      const moves = []; // create new moves array every iteration
      const args = argsBuilder(N, moves);
      solveFn(...args);
    }

    const end = performance.now();
    const total = end - start;
    const avg = total / ITERATIONS;

    timesTotal.push({ N, total, avg });
  }

  console.log(`\n=== ${label} ===`);
  timesTotal.forEach(({ N, total, avg }, idx) => {
    console.log(
      `Round ${idx + 1} (N=${N}): total ${total.toFixed(
        6
      )} ms, avg per iteration ${avg.toFixed(6)} ms`
    );
  });

  const avgTotal = timesTotal.reduce((sum, t) => sum + t.avg, 0) / ROUNDS;
  console.log(
    "Average time per iteration across all rounds:",
    avgTotal.toFixed(6),
    "ms\n"
  );
};

test("Run 15 benchmarks for each algorithm", () => {
  benchmark("3-Peg Recursive", solveHanoi3PegsRecursive, (N, moves) => [
    N,
    0,
    2,
    1,
    moves,
  ]);

  benchmark("3-Peg Heuristic", solveHanoi3PegsHeuristic, (N, moves) => [
    N,
    0,
    2,
    1,
    moves,
  ]);

  benchmark("4-Peg Frame-Stewart", solveHanoi4PegsFrameStewart, (N, moves) => [
    N,
    0,
    3,
    [1, 2],
    moves,
  ]);

  benchmark("4-Peg Heuristic", solveHanoi4PegsHeuristic, (N, moves) => [
    N,
    0,
    3,
    [1, 2],
    moves,
  ]);
});
