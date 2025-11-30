import React from "react";
import { ALGORITHM_OPTIONS_3P, ALGORITHM_OPTIONS_4P } from "./hanoi-utils.js";

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
    <div className="p-6 bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 space-y-4 text-white">
      <h3 className="text-2xl font-extrabold text-blue-300">
        Game Status & Moves
      </h3>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-900/30 p-4 rounded-xl shadow-inner">
          <p className="text-xs font-semibold text-blue-300 uppercase">
            Disks / Pegs
          </p>
          <p className="text-2xl font-bold">
            {N} / {P}
          </p>
        </div>
        <div className="bg-yellow-900/30 p-4 rounded-xl shadow-inner">
          <p className="text-xs font-semibold text-yellow-300 uppercase">
            User Moves
          </p>
          <p className="text-2xl font-bold">{moveCount}</p>
        </div>
      </div>

      <div className="bg-green-900/30 p-4 rounded-xl shadow-inner text-center">
        <p className="text-xs font-semibold text-green-300 uppercase">
          Optimal Moves (Target)
        </p>
        <p className="text-xl font-bold">{optimalMoves}</p>
      </div>

      {gameStatus === "PLAYING" && (
        <button
          onClick={generateSolution}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition duration-150 transform hover:scale-[1.01] shadow-lg"
          disabled={isAutoSolving}
        >
          Solve for Me!
        </button>
      )}

      {isAutoSolving && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-purple-400 flex justify-between">
            <span>Auto-Solving...</span>
            <span>{progressPercent}%</span>
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            {currentMoveIndex} of {solutionMoves.length} steps complete
          </p>
        </div>
      )}

      {gameStatus === "WON" && (
        <div className="text-center p-4 bg-green-900/30 rounded-xl shadow-inner">
          <p className="text-lg font-bold text-green-300">GAME OVER!</p>
          <p className="text-sm text-green-200">
            Score submitted to leaderboard.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusAndSolver;
