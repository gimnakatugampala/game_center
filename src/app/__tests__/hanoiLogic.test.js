import {
  initializePegs,
  isMoveValid,
  minMoves3Pegs,
  minMoves4Pegs,
  solveHanoi3PegsRecursive,
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
} from "./hanoiLogic";

// --- initializePegs ---
describe("initializePegs", () => {
  test("should initialize 3 pegs with 3 disks correctly", () => {
    const pegs = initializePegs(3, 3);
    expect(pegs.length).toBe(3);
    expect(pegs[0]).toEqual([3, 2, 1]);
    expect(pegs[1]).toEqual([]);
    expect(pegs[2]).toEqual([]);
  });

  test("should initialize 4 pegs correctly", () => {
    const pegs = initializePegs(3, 4);
    expect(pegs.length).toBe(4);
    expect(pegs[0]).toEqual([3, 2, 1]);
    expect(pegs[1]).toEqual([]);
    expect(pegs[2]).toEqual([]);
    expect(pegs[3]).toEqual([]);
  });

  test("should return empty array for invalid N or P", () => {
    expect(initializePegs(0, 3)).toEqual([]);
    expect(initializePegs(3, 2)).toEqual([]);
  });
});

// --- isMoveValid ---
describe("isMoveValid", () => {
  const pegs = [[3, 2, 1], [], []];
  test("invalid if source and destination are the same", () => {
    expect(isMoveValid(pegs, 0, 0)).toBe(false);
  });

  test("invalid if source peg empty", () => {
    expect(isMoveValid(pegs, 1, 0)).toBe(false);
  });

  test("valid move to empty peg", () => {
    expect(isMoveValid(pegs, 0, 1)).toBe(true);
  });

  test("valid move onto larger disk", () => {
    const mid = [[3], [1], [2]];
    expect(isMoveValid(mid, 1, 2)).toBe(true);
  });

  test("invalid move onto smaller disk", () => {
    const mid = [[3], [1], [2]];
    expect(isMoveValid(mid, 0, 1)).toBe(false);
  });
});

// --- Optimal move counts ---
describe("Optimal Move Counts", () => {
  test("minMoves3Pegs returns 2^N - 1", () => {
    expect(minMoves3Pegs(1)).toBe(1);
    expect(minMoves3Pegs(2)).toBe(3);
    expect(minMoves3Pegs(3)).toBe(7);
    expect(minMoves3Pegs(5)).toBe(31);
  });

  test("minMoves4Pegs returns correct values", () => {
    expect(minMoves4Pegs(1)).toBe(1);
    expect(minMoves4Pegs(2)).toBe(3);
    expect(minMoves4Pegs(3)).toBe(5);
    expect(minMoves4Pegs(4)).toBe(9);
    expect(minMoves4Pegs(5)).toBe(13);
  });
});

// --- Solver verification ---
const verifyFinalState = (N, moves, P) => {
  let pegs = initializePegs(N, P);
  const destination = P - 1;

  for (const move of moves) {
    const disk = pegs[move.from].pop();
    if (disk !== move.disk) {
      throw new Error(`Expected disk ${move.disk} at peg ${move.from}`);
    }
    pegs[move.to].push(disk);
  }

  expect(pegs[destination].length).toBe(N);
  expect(pegs[destination]).toEqual([...Array(N)].map((_, i) => N - i));
  for (let i = 0; i < P; i++)
    if (i !== destination) expect(pegs[i]).toEqual([]);
};

describe("3-Peg Solver", () => {
  const N = 4,
    P = 3;
  const source = 0,
    destination = 2,
    auxiliary = 1;
  const optimalMoves = minMoves3Pegs(N);

  test("solveHanoi3PegsRecursive", () => {
    const moves = [];
    solveHanoi3PegsRecursive(N, source, destination, auxiliary, moves);
    expect(moves.length).toBe(optimalMoves);
    verifyFinalState(N, moves, P);
  });

  test("solveHanoi3PegsIterative", () => {
    const { moves } = solveHanoi3PegsIterative(
      N,
      source,
      destination,
      auxiliary
    );
    expect(moves.length).toBe(optimalMoves);
    verifyFinalState(N, moves, P);
  });
});

describe("4-Peg Solver (Frame-Stewart)", () => {
  const P = 4,
    source = 0,
    destination = 3,
    auxiliaries = [1, 2];

  test("solveHanoi4PegsFrameStewart N=4", () => {
    const N = 4,
      optimalMoves = minMoves4Pegs(N);
    const moves = [];
    solveHanoi4PegsFrameStewart(N, source, destination, auxiliaries, moves);
    expect(moves.length).toBe(optimalMoves);
    verifyFinalState(N, moves, P);
  });

  test("solveHanoi4PegsFrameStewart N=5", () => {
    const N = 5,
      optimalMoves = minMoves4Pegs(N);
    const moves = [];
    solveHanoi4PegsFrameStewart(N, source, destination, auxiliaries, moves);
    expect(moves.length).toBe(optimalMoves);
    verifyFinalState(N, moves, P);
  });
});
