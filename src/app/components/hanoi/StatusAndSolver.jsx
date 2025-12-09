"use client";

import React from "react";

// ----------------------
// 3-Peg Recursive Solver
// ----------------------
export function solveHanoi3PegsRecursive(n, from, to, aux, moves) {
  if (n === 0) return;
  solveHanoi3PegsRecursive(n - 1, from, aux, to, moves);
  moves.push({ from, to });
  solveHanoi3PegsRecursive(n - 1, aux, to, from, moves);
}

// ----------------------
// 4-Peg Frame-Stewart Solver
// ----------------------
export function solveHanoi4PFrameStewart(n, from, to, aux, moves) {
  if (n === 0) return;

  if (n === 1) {
    moves.push({ from, to });
    return;
  }

  // Frame-Stewart heuristic: k ≈ n - round(sqrt(2*n+1)) + 1
  let k = n - Math.round(Math.sqrt(2 * n + 1)) + 1;
  if (k < 1) k = 1;

  // Move k disks to first auxiliary peg
  solveHanoi4PFrameStewart(k, from, aux[0], [aux[1], to], moves);

  // Move remaining disks using 3-peg solution
  solveHanoi3PegsRecursive(n - k, from, to, aux[1], moves);

  // Move k disks from first auxiliary peg to target
  solveHanoi4PFrameStewart(k, aux[0], to, [aux[1], from], moves);
}

// ----------------------
// Component
// ----------------------
const StatusAndSolver = ({
  N,
  P,
  moveCount,
  optimalMoves,
  gameStatus,
  currentMoveIndex,
  solutionMoves,
  generateSolution,
  isAutoSolving,
}) => {
  const progressPercent =
    solutionMoves.length > 0
      ? Math.round((currentMoveIndex / solutionMoves.length) * 100)
      : 0;

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 space-y-5 text-white w-full">
      <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
        Game Status & Moves
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Disks / Pegs */}
        <div className="bg-gray-800/70 p-4 rounded-2xl shadow-md flex flex-col items-center justify-center transition-transform transform hover:scale-105">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Disks / Pegs
          </p>
          <p className="text-2xl font-bold text-indigo-400">
            {N} / {P}
          </p>
        </div>

        {/* User Moves */}
        <div className="bg-gray-800/70 p-4 rounded-2xl shadow-md flex flex-col items-center justify-center transition-transform transform hover:scale-105">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            User Moves
          </p>
          <p className="text-2xl font-bold text-yellow-400">{moveCount}</p>
        </div>
      </div>

      {/* Optimal Moves */}
      <div className="bg-gray-800/70 p-4 rounded-2xl shadow-md flex flex-col items-center justify-center transition-transform transform hover:scale-105">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Optimal Moves (Target)
        </p>
        <p className="text-xl font-bold text-green-400">{optimalMoves}</p>
      </div>

      {/* Solve Button */}
      {gameStatus === "PLAYING" && (
        <button
          onClick={generateSolution}
          disabled={isAutoSolving}
          className={`w-full py-3 rounded-2xl font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${
            isAutoSolving
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          }`}
        >
          Solve for Me!
        </button>
      )}

      {/* Auto-Solving Progress */}
      {isAutoSolving && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-purple-400 flex justify-between">
            <span>Auto-Solving...</span>
            <span>{progressPercent}%</span>
          </p>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            {currentMoveIndex} of {solutionMoves.length} steps complete
          </p>
        </div>
      )}

      {/* Game Won */}
      {gameStatus === "WON" && (
        <div className="p-4 bg-green-900/60 rounded-2xl shadow-inner text-center">
          <p className="text-xl font-extrabold text-green-400 tracking-wide">
            🎉 GAME WON!
          </p>
          <p className="text-sm text-green-200 mt-1">
            Score submitted to leaderboard.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusAndSolver;
