import {
  solveHanoi3PegsRecursive,
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
  solveHanoi4PegsIterative,
} from "../../app/components/hanoi/hanoi-utils";

/**
 * Measures execution time of a function with optional iterations
 * @param {Function} fn - Function to measure
 * @param {number} iterations - Number of times to run the function
 * @returns {number} Total execution time in milliseconds
 */
const measureTime = (fn, iterations = 1) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const end = performance.now();
  return end - start;
};

describe("Hanoi Solver Performance Tests", () => {
  jest.setTimeout(30000);
  describe("3-Peg Solvers Performance", () => {
    const testCases = [5, 8, 10];

    testCases.forEach((N) => {
      test(`N=${N} Recursive vs Iterative`, () => {
        const recursiveMoves = [];
        const iterativeMoves = [];

        const recursiveTime = measureTime(
          () => solveHanoi3PegsRecursive(N, 0, 2, 1, recursiveMoves),
          10
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

  test("Stress Test: Large N (3-Peg Iterative)", () => {
    const N = 12;
    const moves = [];

    const time = measureTime(() => solveHanoi3PegsIterative(N, 0, 2, 1, moves));

    console.log(
      `Stress Test | 3-Pegs Iterative | N=${N} | Time=${time.toFixed(2)} ms`
    );

    expect(moves.length).toBeGreaterThan(0);
  });
});
