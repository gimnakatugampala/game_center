import {
  solveHanoi3PegsRecursive,
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
  solveHanoi4PegsIterative,
} from "../../app/components/hanoi/hanoi-utils";

// Helper: measure execution time
const measureTime = (fn) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

// Helper: get random integer between min and max inclusive
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

describe("Hanoi Solver Performance - 15 Rounds Random Disks", () => {
  jest.setTimeout(60000); // allow enough time

  const rounds = 15;

  for (let round = 1; round <= rounds; round++) {
    const N = randomInt(5, 10); // random disks 5-10

    test(`Round ${round} | Random N=${N}`, () => {
      const moves3Rec = [];
      const moves3Iter = [];
      const moves4FS = [];
      const moves4Iter = [];

      const time3Rec = measureTime(() =>
        solveHanoi3PegsRecursive(N, 0, 2, 1, moves3Rec)
      );

      const time3Iter = measureTime(() =>
        solveHanoi3PegsIterative(N, 0, 2, 1, moves3Iter)
      );

      const time4FS = measureTime(() =>
        solveHanoi4PegsFrameStewart(N, 0, 3, [1, 2], moves4FS)
      );

      const time4Iter = measureTime(() =>
        solveHanoi4PegsIterative(N, 0, 3, [1, 2], moves4Iter)
      );

      console.log(
        `Round ${round} | N=${N} | 3-Rec: ${time3Rec.toFixed(
          2
        )}ms | 3-Iter: ${time3Iter.toFixed(2)}ms | 4-FS: ${time4FS.toFixed(
          2
        )}ms | 4-Iter: ${time4Iter.toFixed(2)}ms`
      );

      // Verify moves exist
      expect(moves3Rec.length).toBeGreaterThan(0);
      expect(moves3Iter.length).toBeGreaterThan(0);
      expect(moves4FS.length).toBeGreaterThan(0);
      expect(moves4Iter.length).toBeGreaterThan(0);
    });
  }
});
