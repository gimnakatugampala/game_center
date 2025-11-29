// lib/algorithms.js
export function hanoi3_recursive(n, from, to, aux, moves) {
  if (n === 0) return;
  hanoi3_recursive(n - 1, from, aux, to, moves);
  moves.push({ from, to });
  hanoi3_recursive(n - 1, aux, to, from, moves);
}

export function hanoi4_frame_stewart(n, from, to, aux1, aux2, moves) {
  if (n === 0) return;
  if (n === 1) {
    moves.push({ from, to });
    return;
  }
  const k = n - Math.floor(Math.sqrt(2 * n + 1)) + 1;
  hanoi4_frame_stewart(k, from, aux1, aux2, to, moves);
  hanoi3_recursive(n - k, from, to, aux2, moves);
  hanoi4_frame_stewart(k, aux1, to, from, aux2, moves);
}
