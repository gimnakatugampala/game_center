"use client";

import React from "react";

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
  autoPlaySpeed,
  setAutoPlaySpeed,
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
    </div>
  );
};

export default StatusAndSolver;
