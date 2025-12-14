import {
  initializePegs,
  isMoveValid,
  minMoves3Pegs,
  minMoves4Pegs,
  solveHanoi3PegsRecursive,
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
  solveHanoi4PegsIterative,
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
// 3-Peg Solver - Iterative
// --------------------------------------------------------
describe("3-Peg Solver - Iterative", () => {
  test("iterative solver produces valid final state", () => {
    const N = 4;
    const moves = [];
    solveHanoi3PegsIterative(N, 0, 2, 1, moves);
    expect(moves.length).toBeGreaterThan(0);
    verifyFinalState(N, moves, 3);
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
// 4-Peg Solver - Iterative
// --------------------------------------------------------
describe("4-Peg Solver - Iterative", () => {
  test("iterative solver produces valid final state", () => {
    const N = 4;
    const moves = [];
    solveHanoi4PegsIterative(N, 0, 3, [1, 2], moves);
    expect(moves.length).toBeGreaterThan(0);
    verifyFinalState(N, moves, 4);
  });
});
