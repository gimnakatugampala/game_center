import { findMinThrowsBFS_forTesting } from "../lib/gameLogic";

describe("Snake & Ladder Game Logic", () => {
  it("should find the minimum throws using BFS", () => {
    const moves = [
      { start: 2, end: 8, type: "ladder" },
      { start: 7, end: 4, type: "snake" },
    ];
    const N = 3;

    const minThrows = findMinThrowsBFS_forTesting(moves, N);

    expect(minThrows).toBe(2);
  });

  it("should find minimum throws with only snakes", () => {
    const moves = [{ start: 14, end: 2, type: "snake" }];
    const N = 4;

    const minThrows = findMinThrowsBFS_forTesting(moves, N);

    expect(minThrows).toBe(3);
  });
});
