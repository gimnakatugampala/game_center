import { hanoi3_recursive } from "./hanoi3";

// 4-peg Tower of Hanoi (Frame-Stewart algorithm)
export function hanoi4_frame_stewart(
  n,
  source,
  target,
  aux1,
  aux2,
  moves = []
) {
  if (n === 0) return moves;
  if (n === 1) {
    moves.push({ from: source, to: target });
    return moves;
  }

  const k = n - Math.floor(Math.sqrt(2 * n + 1)) + 1;

  // Move top k disks to aux1 using 4 pegs
  hanoi4_frame_stewart(k, source, aux1, aux2, target, moves);

  // Move remaining n-k disks to target using 3 pegs
  hanoi3_recursive(n - k, source, target, aux2, moves);

  // Move k disks from aux1 to target using 4 pegs
  hanoi4_frame_stewart(k, aux1, target, source, aux2, moves);

  return moves;
}
