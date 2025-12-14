"use client";

import React from "react";

/**
 * Displays game summary with user moves vs optimal moves
 * @param {number} userMoves - Number of moves made by user
 * @param {number} optimalMoves - Optimal number of moves
 * @param {boolean} isOptimal - Whether user achieved optimal solution
 * @param {string} mode - Game mode (default: "MANUAL")
 */
const MovesCard = ({ userMoves, optimalMoves, isOptimal, mode = "MANUAL" }) => {
  const isPartial = userMoves > optimalMoves;

  return (
    <div className="mt-6 p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-xl text-center animate-fadeIn">
      <h3 className="text-2xl font-extrabold text-indigo-400 mb-4">
        🧮 Game Summary
      </h3>

      <div className="grid grid-cols-2 gap-4 text-lg text-slate-200 mb-6">
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Your Moves</p>
          <p className="text-3xl font-bold text-pink-400">{userMoves}</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Optimal Moves</p>
          <p className="text-3xl font-bold text-indigo-400">{optimalMoves}</p>
        </div>
      </div>

      {isOptimal ? (
        <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-green-300 font-semibold text-lg">
          🏆 Perfect! You solved the puzzle using the optimal number of moves.
        </div>
      ) : isPartial ? (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-4 text-yellow-300 font-semibold text-lg">
          ✅ Puzzle solved! You used more moves than the optimal solution, but
          your solution is valid.
        </div>
      ) : null}

      <p className="mt-4 text-slate-400 text-sm italic">
        Optimal moves represent the minimum number of moves required to solve
        the puzzle using an ideal algorithm.
      </p>
    </div>
  );
};

export default MovesCard;
