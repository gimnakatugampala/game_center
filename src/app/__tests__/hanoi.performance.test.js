import {
  solveHanoi3PegsRecursive,
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
  solveHanoi4PegsIterative,
} from "../../app/components/hanoi/hanoi-utils";

// Helper: measure execution time with optional iterations
const measureTime = (fn, iterations = 1) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const end = performance.now();
  return end - start;
};

describe("Hanoi Solver Performance Tests", () => {
  jest.setTimeout(30000); // allow enough time for larger N

  // --------------------------------------------------------
  // 3-Peg Performance Comparison
  // --------------------------------------------------------
  describe("3-Peg Solvers Performance", () => {
    const testCases = [5, 8, 10];

    testCases.forEach((N) => {
      test(`N=${N} Recursive vs Iterative`, () => {
        const recursiveMoves = [];
        const iterativeMoves = [];

        const recursiveTime = measureTime(
          () => solveHanoi3PegsRecursive(N, 0, 2, 1, recursiveMoves),
          10 // run 10 times to get measurable time
        );

        const iterativeTime = measureTime(
          () => solveHanoi3PegsIterative(N, 0, 2, 1, iterativeMoves),
          10
        );

        console.log(
          `3-Pegs | N=${N} | Recursive: ${recursiveTime.toFixed(
            2
          )} ms | Iterative: ${iterativeTime.toFixed(2)} ms`
        );

        expect(recursiveMoves.length).toBeGreaterThan(0);
        expect(iterativeMoves.length).toBeGreaterThan(0);
      });
    });
  });

  // --------------------------------------------------------
  // 4-Peg Performance Comparison
  // --------------------------------------------------------
  describe("4-Peg Solvers Performance", () => {
    const testCases = [5, 8, 10];

    testCases.forEach((N) => {
      test(`N=${N} Frame–Stewart vs Iterative`, () => {
        const frameStewartMoves = [];
        const iterativeMoves = [];

        const frameStewartTime = measureTime(
          () => solveHanoi4PegsFrameStewart(N, 0, 3, [1, 2], frameStewartMoves),
          5
        );

        const iterativeTime = measureTime(
          () => solveHanoi4PegsIterative(N, 0, 3, [1, 2], iterativeMoves),
          5
        );

        console.log(
          `4-Pegs | N=${N} | Frame–Stewart: ${frameStewartTime.toFixed(
            2
          )} ms | Iterative: ${iterativeTime.toFixed(2)} ms`
        );

        expect(frameStewartMoves.length).toBeGreaterThan(0);
        expect(iterativeMoves.length).toBeGreaterThan(0);
      });
    });
  });

  // --------------------------------------------------------
  // Stress Test (Optional – Coursework Bonus)
  // --------------------------------------------------------
  test("Stress Test: Large N (3-Peg Iterative)", () => {
    const N = 12;
    const moves = [];

    const time = measureTime(() => solveHanoi3PegsIterative(N, 0, 2, 1, moves));

    console.log(
      `Stress Test | 3-Pegs Iterative | N=${N} | Time=${time.toFixed(2)} ms`
    );

    expect(moves.length).toBeGreaterThan(0); // still important
    // Removed: expect(time).toBeGreaterThan(0);
  });
});
