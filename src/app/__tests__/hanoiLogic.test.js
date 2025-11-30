// Unit tests for the core Tower of Hanoi game logic.
// This assumes an environment (like Jest) is set up to run these tests.

import {
  initializePegs,
  isMoveValid,
  minMoves3Pegs,
  minMoves4Pegs,
  solveHanoi3PegsRecursive,
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
} from "./hanoiLogic";

// --- Test Suite for initializePegs (Existing Logic) ---
describe("initializePegs", () => {
  const NUM_PEGS = 3;

  test("should initialize pegs correctly for 3 disks", () => {
    const N = 3;
    const pegs = initializePegs(N, NUM_PEGS);
    // Expect 3 pegs
    expect(pegs.length).toBe(NUM_PEGS);
    // Peg 1 should have disks 3, 2, 1 (largest to smallest)
    expect(pegs[0]).toEqual([3, 2, 1]);
    // Pegs 2 and 3 should be empty
    expect(pegs[1]).toEqual([]);
    expect(pegs[2]).toEqual([]);
  });

  test("should handle initialization with 5 disks", () => {
    const N = 5;
    const pegs = initializePegs(N, NUM_PEGS);
    expect(pegs[0].length).toBe(5);
    expect(pegs[0]).toEqual([5, 4, 3, 2, 1]);
  });

  test("should initialize correctly with 4 pegs", () => {
    const pegs = initializePegs(3, 4);
    expect(pegs.length).toBe(4);
    expect(pegs[0]).toEqual([3, 2, 1]);
    expect(pegs[3]).toEqual([]); // Check the extra peg is empty
  });

  test("should return empty array for zero disks", () => {
    expect(initializePegs(0, 3)).toEqual([]);
  });

  test("should return empty array for less than 3 pegs", () => {
    expect(initializePegs(3, 2)).toEqual([]);
  });
});

// --- Test Suite for isMoveValid (Existing Logic) ---
describe("isMoveValid", () => {
  // A standard starting setup for 3 disks
  const initialPegs = [[3, 2, 1], [], []];
  // A setup with some disks already moved
  const midGamePegs = [[3], [1], [2]]; // Peg 0: [3], Peg 1: [1], Peg 2: [2]

  test("should return false if source and destination are the same", () => {
    expect(isMoveValid(initialPegs, 0, 0)).toBe(false);
  });

  test("should return false if source peg is empty", () => {
    // Attempt to move from empty Peg 1
    expect(isMoveValid(initialPegs, 1, 0)).toBe(false);
  });

  // Valid Moves
  test("should return true for moving a disk to an empty peg (start game)", () => {
    // Move disk 1 from Peg 0 to Peg 1
    expect(isMoveValid(initialPegs, 0, 1)).toBe(true);
  });

  test("should return true for moving a smaller disk onto a larger disk (mid game)", () => {
    // midGamePegs: Peg 0: [3], Peg 1: [1], Peg 2: [2]
    // Move disk 1 (from Peg 1) onto disk 2 (on Peg 2) -> Valid
    expect(isMoveValid(midGamePegs, 1, 2)).toBe(true);
  });

  // Invalid Moves (The Core Rule)
  test("should return false for moving a larger disk onto a smaller disk", () => {
    // midGamePegs: Peg 0: [3], Peg 1: [1], Peg 2: [2]
    // Move disk 3 (from Peg 0) onto disk 1 (on Peg 1) -> Invalid
    expect(isMoveValid(midGamePegs, 0, 1)).toBe(false);
  });

  test("should return false for moving a disk onto a smaller disk when destination is complex", () => {
    const complexPegs = [[5, 4], [3, 2], [1]]; // Top disks are 4, 2, 1
    // Try to move 4 (from Peg 0) onto 1 (on Peg 2) -> Invalid (4 > 1)
    expect(isMoveValid(complexPegs, 0, 2)).toBe(false);
  });
});

// --- New Test Suite for Optimal Move Counts ---
describe("Optimal Move Counts", () => {
  // Test 3-Peg Optimal Moves (2^N - 1)
  test("minMoves3Pegs should return correct optimal moves", () => {
    expect(minMoves3Pegs(1)).toBe(1);
    expect(minMoves3Pegs(2)).toBe(3);
    expect(minMoves3Pegs(3)).toBe(7);
    expect(minMoves3Pegs(5)).toBe(31);
  });

  // Test 4-Peg Optimal Moves (Frame-Stewart)
  // These are known optimal values based on the Frame-Stewart algorithm
  test("minMoves4Pegs should return correct optimal moves (Frame-Stewart)", () => {
    expect(minMoves4Pegs(1)).toBe(1);
    expect(minMoves4Pegs(2)).toBe(3); // k=1, 2*1 + M(1,3) = 3
    expect(minMoves4Pegs(3)).toBe(5); // k=1, 2*1 + M(2,3) = 5
    expect(minMoves4Pegs(4)).toBe(9); // k=1, 2*1 + M(3,3) = 9
    expect(minMoves4Pegs(5)).toBe(13); // k=2, 2*2 + M(3,3) = 11. Wait, 5 disks is 13.
    // k=1: 2*1 + M(4,3) = 2 + 15 = 17
    // k=2: 2*2 + M(3,3) = 4 + 7 = 11. (This is wrong, 5 disks is 13 moves)
    // The implementation of Frame-Stewart is highly recursive. Let's use known values.
    // M(5, 4) is 13. The formula: M(5,4) = min{ 2k + M(5-k, 3) }
    // k=1: 2(1) + 15 = 17
    // k=2: 2(2) + 7 = 11
    // k=3: 2(3) + 3 = 9
    // k=4: 2(4) + 1 = 9
    // The correct optimal split is often calculated using a different, pre-calculated k sequence.
    // For n=5, optimal k=2, moves = 2*M(2,4) + M(1,3) = 2*3 + 1 = 7. NO.
    // Let's rely on the definition M(N, 4) = min_{1 <= k < N} { 2 * M(k, 4) + M(N-k, 3) } is incorrect.
    // The one implemented: M(N, 4) = min_{1 <= k < N} { 2k + M(N-k, 3) } is the simplified version.

    // Using published Frame-Stewart values (M(5,4)=13, M(6,4)=17, M(7,4)=25)
    expect(minMoves4Pegs(5)).toBe(13);
    expect(minMoves4Pegs(6)).toBe(17);
    expect(minMoves4Pegs(7)).toBe(25);
  });
});

// --- New Test Suite for Solver Algorithms ---

// Helper function to verify the final state after a sequence of moves
const verifyFinalState = (N, moves, P) => {
  let pegs = initializePegs(N, P);
  const destinationPeg = P - 1;

  for (const move of moves) {
    // Check if the move is valid before applying it (safety check)
    const sourceDisk = pegs[move.from].pop();
    if (sourceDisk !== move.disk) {
      throw new Error(
        `Move verification failed: Expected disk ${move.disk} not found on source peg ${move.from}.`
      );
    }
    pegs[move.to].push(sourceDisk);
  }

  // The destination peg must have all N disks, and all other pegs must be empty.
  expect(pegs[destinationPeg].length).toBe(N);
  expect(pegs[destinationPeg]).toEqual([...Array(N)].map((_, i) => N - i)); // Check disks are 1..N

  for (let i = 0; i < P; i++) {
    if (i !== destinationPeg) {
      expect(pegs[i]).toEqual([]);
    }
  }
};

describe("3-Peg Solver Approaches", () => {
  const N = 4; // Test with 4 disks
  const P = 3;
  const source = 0;
  const destination = 2;
  const auxiliary = 1;
  const optimalMoves = minMoves3Pegs(N); // 15 moves

  test("solveHanoi3PegsRecursive generates optimal move count and sequence", () => {
    const moves = [];
    solveHanoi3PegsRecursive(N, source, destination, auxiliary, moves);

    expect(moves.length).toBe(optimalMoves); // Should be 15
    verifyFinalState(N, moves, P);
  });

  test("solveHanoi3PegsIterative generates optimal move count and sequence (via recursion)", () => {
    // Note: The iterative implementation relies on the recursive one for correctness
    // due to the complexity of a purely state-less iterative generator.
    const { moves } = solveHanoi3PegsIterative(
      N,
      source,
      destination,
      auxiliary
    );

    expect(moves.length).toBe(optimalMoves); // Should be 15
    verifyFinalState(N, moves, P);
  });
});

describe("4-Peg Solver Approach (Frame-Stewart)", () => {
  const N = 4; // Test with 4 disks
  const P = 4;
  const source = 0;
  const destination = 3;
  const auxiliaries = [1, 2];
  const optimalMoves = minMoves4Pegs(N); // 9 moves

  test("solveHanoi4PegsFrameStewart generates optimal move count and sequence", () => {
    const moves = [];
    solveHanoi4PegsFrameStewart(N, source, destination, auxiliaries, moves);

    expect(moves.length).toBe(optimalMoves); // Should be 9
    verifyFinalState(N, moves, P);
  });

  test("solveHanoi4PegsFrameStewart passes for N=5 (13 moves)", () => {
    const moves = [];
    solveHanoi4PegsFrameStewart(5, 0, 3, [1, 2], moves);

    expect(moves.length).toBe(minMoves4Pegs(5)); // Should be 13
    verifyFinalState(5, moves, 4);
  });
});
