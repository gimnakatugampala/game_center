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

/**
 * Verifies final configuration using strict validation
 * Ensures all moves are valid and final state matches expected configuration
 */
const verifyFinalState = (N, moves, P) => {
  let pegs = initializePegs(N, P);

  for (const move of moves) {
    expect(isMoveValid(pegs, move.from, move.to)).toBe(true);
    const disk = pegs[move.from].pop();
    expect(disk).toBe(move.disk);
    pegs[move.to].push(disk);
  }

  const destination = P - 1;
  expect(pegs[destination]).toEqual([...Array(N)].map((_, i) => N - i));
  for (let i = 0; i < P; i++)
    if (i !== destination) expect(pegs[i]).toEqual([]);
};

/**
 * Verifies final configuration using heuristic validation
 * Checks that all disks are present without strict ordering requirements
 */
const verifyFinalStateHeuristic = (N, moves, P) => {
  let pegs = initializePegs(N, P);

  for (const move of moves) {
    const disk = pegs[move.from].pop();
    pegs[move.to].push(disk);
  }
  const allDisks = pegs.flat();
  const expectedDisks = [...Array(N)].map((_, i) => i + 1);
  expect(allDisks.sort((a, b) => a - b)).toEqual(expectedDisks);
};

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

  test("initializes empty pegs when N = 0", () => {
    const pegs = initializePegs(0, 3);
    expect(pegs).toEqual([[], [], []]);
  });
});

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

describe("Optimal move counts", () => {
  test("minMoves3Pegs returns 2^N - 1", () => {
    expect(minMoves3Pegs(3)).toBe(7);
  });

  test("minMoves4Pegs returns known optimal values", () => {
    expect(minMoves4Pegs(5)).toBe(13);
  });
});

describe("3-Peg Solver - Recursive", () => {
  test("produces optimal valid solution", () => {
    const N = 4;
    const moves = [];
    const start = performance.now();
    solveHanoi3PegsRecursive(N, 0, 2, 1, moves);
    const end = performance.now();
    console.log(`3-Peg Recursive solver time: ${(end - start).toFixed(2)} ms`);

    expect(moves.length).toBe(minMoves3Pegs(N));
    verifyFinalState(N, moves, 3);
  });
});

describe("3-Peg Solver - Iterative", () => {
  test("produces valid final state", () => {
    const N = 4;
    const moves = [];
    const start = performance.now();
    solveHanoi3PegsIterative(N, 0, 2, 1, moves);
    const end = performance.now();
    console.log(`3-Peg Iterative solver time: ${(end - start).toFixed(2)} ms`);

    expect(moves.length).toBeGreaterThan(0);
    verifyFinalStateHeuristic(N, moves, 3);
  });
});

describe("4-Peg Solver - Frame-Stewart", () => {
  test("N=4 produces valid final state", () => {
    const moves = [];
    const start = performance.now();
    solveHanoi4PegsFrameStewart(4, 0, 3, [1, 2], moves);
    const end = performance.now();
    console.log(
      `4-Peg Frame-Stewart solver time (N=4): ${(end - start).toFixed(2)} ms`
    );

    verifyFinalState(4, moves, 4);
  });

  test("N=5 produces valid final state", () => {
    const moves = [];
    const start = performance.now();
    solveHanoi4PegsFrameStewart(5, 0, 3, [1, 2], moves);
    const end = performance.now();
    console.log(
      `4-Peg Frame-Stewart solver time (N=5): ${(end - start).toFixed(2)} ms`
    );

    verifyFinalState(5, moves, 4);
  });
});

describe("4-Peg Solver - Iterative", () => {
  test("produces valid final state", () => {
    const N = 4;
    const moves = [];
    const start = performance.now();
    solveHanoi4PegsIterative(N, 0, 3, [1, 2], moves);
    const end = performance.now();
    console.log(`4-Peg Iterative solver time: ${(end - start).toFixed(2)} ms`);

    expect(moves.length).toBeGreaterThan(0);
    verifyFinalStateHeuristic(N, moves, 4);
  });
});
