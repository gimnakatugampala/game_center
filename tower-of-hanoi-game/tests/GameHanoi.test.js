// tests/GameHanoi.test.js
import { hanoi3_recursive } from "../lib/algorithms/hanoi3.js";

describe("GameHanoi validation", () => {
  const n = 3;
  const solutionObj = hanoi3_recursive(n, "A", "C", "B");
  const solution = solutionObj.moves; // Correct solution

  it("should validate correct user moves", () => {
    // Simulate user entering the correct moves
    const userMoves = [...solution];

    const solved = userMoves.every(
      (mv, i) => mv.from === solution[i].from && mv.to === solution[i].to
    );

    expect(solved).toBe(true);
  });

  it("should detect incorrect user moves", () => {
    // Simulate user entering an incorrect move
    const userMoves = [...solution];
    userMoves[0] = { from: "A", to: "C" }; // deliberately wrong

    const solved = userMoves.every(
      (mv, i) => mv.from === solution[i].from && mv.to === solution[i].to
    );

    expect(solved).toBe(false);
  });

  it("should allow partial validation (optional)", () => {
    // Simulate user completing first two moves correctly, then wrong
    const userMoves = [
      { ...solution[0] },
      { ...solution[1] },
      { from: "A", to: "C" },
    ];

    const solved = userMoves.every(
      (mv, i) => mv.from === solution[i].from && mv.to === solution[i].to
    );

    expect(solved).toBe(false);
  });
});
