import { hanoi3_recursive, hanoi4_frame_stewart } from "../lib/algorithms.js";

describe("Tower of Hanoi - 3 Pegs", () => {
  test("hanoi3_recursive returns correct number of moves", () => {
    const moves = [];
    hanoi3_recursive(3, "A", "C", "B", moves);
    expect(moves.length).toBe(7); // 2^3 - 1
  });
});

describe("Tower of Hanoi - 4 Pegs (Frame-Stewart)", () => {
  test("hanoi4_frame_stewart returns correct moves", () => {
    const moves = [];
    hanoi4_frame_stewart(4, "A", "D", "B", "C", moves);
    expect(moves.length).toBeGreaterThan(0); // should produce some moves
  });
});
