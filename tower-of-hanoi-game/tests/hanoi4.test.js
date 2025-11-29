// tests/hanoi3.test.js
import {
  hanoi3_recursive,
  hanoi3_iterative,
} from "../lib/algorithms/hanoi3.js";

describe("Hanoi 3 Pegs", () => {
  it("should generate correct number of moves for n disks", () => {
    const n = 3;
    const recursive = hanoi3_recursive(n, "A", "C", "B");
    const iterative = hanoi3_iterative(n, "A", "C", "B");

    const expectedMoves = Math.pow(2, n) - 1;
    expect(recursive.length).toBe(expectedMoves);
    expect(iterative.length).toBe(expectedMoves);
  });

  it("first and last move should be correct for 2 disks", () => {
    const moves = hanoi3_recursive(2, "A", "C", "B");
    expect(moves[0]).toEqual({ from: "A", to: "B" });
    expect(moves[moves.length - 1]).toEqual({ from: "B", to: "C" });
  });

  it("all moves should be valid (no larger disk on smaller)", () => {
    const n = 3;
    const moves = hanoi3_recursive(n, "A", "C", "B");
    const pegs = { A: [3, 2, 1], B: [], C: [] };

    for (const move of moves) {
      const disk = pegs[move.from].pop();
      const targetTop = pegs[move.to][pegs[move.to].length - 1] || Infinity;
      expect(disk < targetTop).toBe(true);
      pegs[move.to].push(disk);
    }
  });
});
