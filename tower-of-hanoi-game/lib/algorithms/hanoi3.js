// 3-peg Tower of Hanoi (recursive)
export function hanoi3_recursive(n, source, target, auxiliary, moves = []) {
  if (n === 0) return moves;
  if (n === 1) {
    moves.push({ from: source, to: target });
    return moves;
  }

  hanoi3_recursive(n - 1, source, auxiliary, target, moves);
  moves.push({ from: source, to: target });
  hanoi3_recursive(n - 1, auxiliary, target, source, moves);

  return moves;
}

// Optional: iterative version
export function hanoi3_iterative(n, source, target, auxiliary) {
  const moves = [];
  const pegs = [source, auxiliary, target];
  const totalMoves = Math.pow(2, n) - 1;

  for (let i = 1; i <= totalMoves; i++) {
    const from = pegs[(i & (i - 1)) % 3];
    const to = pegs[((i | (i - 1)) + 1) % 3];
    moves.push({ from, to });
  }

  return moves;
}
