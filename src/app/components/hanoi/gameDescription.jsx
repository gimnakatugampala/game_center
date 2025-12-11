"use client";

import React, { useMemo, useState } from "react";
import {
  minMoves3Pegs,
  minMoves4Pegs,
  ALGORITHM_OPTIONS_3P,
  ALGORITHM_OPTIONS_4P,
} from "./hanoi-utils";

const analyzeHanoiComplexity = (N, P, algorithm) => {
  let movesCount = 0;
  let maxRecursionDepth = 0;
  let currentDepth = 0;

  const trackMove = () => movesCount++;

  const hanoi3 = (n) => {
    if (n === 0) return;
    currentDepth++;
    maxRecursionDepth = Math.max(maxRecursionDepth, currentDepth);
    hanoi3(n - 1);
    trackMove();
    hanoi3(n - 1);
    currentDepth--;
  };

  const hanoi4 = (n) => {
    if (n === 0) return;
    if (n === 1) {
      trackMove();
      return;
    }

    let k = n - Math.round(Math.sqrt(2 * n + 1)) + 1;
    if (k < 1) k = 1;

    currentDepth++;
    maxRecursionDepth = Math.max(maxRecursionDepth, currentDepth);
    hanoi4(k);
    hanoi3(n - k);
    hanoi4(k);
    currentDepth--;
  };

  if (P === 3 && algorithm === ALGORITHM_OPTIONS_3P.RECURSIVE) hanoi3(N);
  else if (P === 4 && algorithm === ALGORITHM_OPTIONS_4P.FRAME_STEWART)
    hanoi4(N);

  return {
    movesCount,
    estimatedTimeComplexity: P === 3 ? `O(2^${N})` : `O(2^√${N})`,
    estimatedSpaceComplexity: `O(${maxRecursionDepth})`,
  };
};

const getMoveBreakdown = (N, P) => {
  const breakdown = [];

  if (P === 3) {
    for (let i = 1; i <= N; i++) {
      const moves = 2 ** (i - 1);
      breakdown.push(`Move disk ${i}: contributes ${moves} moves`);
    }
  } else if (P === 4) {
    const movesFor4P = (n) => {
      if (n === 0) return 0;
      if (n === 1) return 1;
      let k = n - Math.round(Math.sqrt(2 * n + 1)) + 1;
      if (k < 1) k = 1;
      const moves = movesFor4P(k) + 2 ** (n - k) - 1 + movesFor4P(k); // Frame-Stewart approximation
      return moves;
    };

    let remaining = N;
    let stepNum = 1;
    while (remaining > 0) {
      let k = remaining - Math.round(Math.sqrt(2 * remaining + 1)) + 1;
      if (k < 1) k = 1;
      const movesK = movesFor4P(k);
      const moves3Peg = 2 ** (remaining - k) - 1;

      breakdown.push(
        `Step ${stepNum++}: Move ${k} disks to auxiliary peg (≈${movesK} moves)`
      );
      breakdown.push(
        `Step ${stepNum++}: Move remaining ${
          remaining - k
        } disks to target peg using 3 pegs (≈${moves3Peg} moves)`
      );
      breakdown.push(
        `Step ${stepNum++}: Move ${k} disks from auxiliary to target peg (≈${movesK} moves)`
      );

      remaining = k - 1;
    }
  }

  return breakdown;
};

const GameDescription = ({
  N,
  P,
  selectedAlgorithm3P,
  selectedAlgorithm4P,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const optimalMoves = useMemo(
    () => (P === 3 ? minMoves3Pegs(N) : minMoves4Pegs(N)),
    [P, N]
  );

  const algorithmDescription = useMemo(() => {
    if (P === 3) {
      if (selectedAlgorithm3P === ALGORITHM_OPTIONS_3P.RECURSIVE)
        return {
          title: "Recursive Optimal Solution",
          desc: "Classical 3-peg optimal algorithm.",
          complexity: (
            <div className="space-y-1">
              <div>Time: O(2^N)</div>
              <div>Space: O(N)</div>
            </div>
          ),
          key: ALGORITHM_OPTIONS_3P.RECURSIVE,
        };
      return {
        title: "Non-Optimal Heuristic",
        desc: "Faster but not minimal.",
        complexity: "Varies — not optimal.",
      };
    }
    if (selectedAlgorithm4P === ALGORITHM_OPTIONS_4P.FRAME_STEWART)
      return {
        title: "Frame-Stewart Optimal Algorithm",
        desc: "Efficient 4-peg solution using recursive partitioning.",
        complexity: (
          <div className="space-y-1">
            <div>Time: O(2^√N) approx.</div>
            <div>Space: O(√N) approx.</div>
          </div>
        ),
        key: ALGORITHM_OPTIONS_4P.FRAME_STEWART,
      };

    return {
      title: "Non-Optimal Heuristic (4 Pegs)",
      desc: "Demonstration only.",
      complexity: "Non-optimal — no closed form.",
    };
  }, [P, selectedAlgorithm3P, selectedAlgorithm4P]);

  const programmaticComplexity = useMemo(() => {
    if (algorithmDescription.key)
      return analyzeHanoiComplexity(N, P, algorithmDescription.key);
    return null;
  }, [N, P, algorithmDescription]);

  const moveBreakdown = useMemo(() => getMoveBreakdown(N, P), [N, P]);

  return (
    <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl text-gray-100 space-y-6">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center">
        Tower of Hanoi Overview
      </h2>

      <div className="space-y-4">
        {/* Game Stats */}
        <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            Game Stats
          </h3>
          <p>
            <span className="font-semibold">Disks:</span>{" "}
            <span className="text-indigo-400 font-bold">{N}</span>
          </p>
          <p>
            <span className="font-semibold">Pegs:</span>{" "}
            <span className="text-indigo-400 font-bold">{P}</span>
          </p>
          <p className="mt-2">
            <span className="font-semibold">Optimal Moves:</span>{" "}
            <span className="text-green-400 font-bold">{optimalMoves}</span>
          </p>
        </div>

        {/* Programmatic Complexity */}
        {programmaticComplexity && (
          <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
            <h3 className="text-xl font-semibold text-indigo-300 mb-2">
              Programmatic Analysis
            </h3>
            <p>
              <span className="font-semibold">Moves Count:</span>{" "}
              <span className="text-green-400 font-bold">
                {programmaticComplexity.movesCount}
              </span>
            </p>
            <p>
              <span className="font-semibold">Time Complexity:</span>{" "}
              <span className="text-yellow-300 font-semibold">
                {programmaticComplexity.estimatedTimeComplexity}
              </span>
            </p>
            <p>
              <span className="font-semibold">Space Complexity:</span>{" "}
              <span className="text-yellow-300 font-semibold">
                {programmaticComplexity.estimatedSpaceComplexity}
              </span>
            </p>
          </div>
        )}

        {/* Algorithm Info */}
        <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            Algorithm Selected
          </h3>
          <p className="font-bold text-gray-200">
            {algorithmDescription.title}
          </p>
          <p className="text-gray-400 mt-1">{algorithmDescription.desc}</p>
          <div className="text-yellow-300 mt-2 font-semibold">
            Theoretical Complexity: {algorithmDescription.complexity}
          </div>
        </div>

        {/* Algorithm Execution Time */}
        <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-3">
            Algorithm Execution Time
          </h3>

          <div className="space-y-2 text-gray-300">
            {timeRecursive !== undefined && (
              <p>
                <span className="font-semibold text-yellow-300">
                  Recursive Solver:
                </span>{" "}
                <span className="text-green-400 font-bold">
                  {timeRecursive} ms
                </span>
              </p>
            )}

            {timeThreaded !== undefined && (
              <p>
                <span className="font-semibold text-yellow-300">
                  Threaded / 4-Peg Solver:
                </span>{" "}
                <span className="text-green-400 font-bold">
                  {timeThreaded} ms
                </span>
              </p>
            )}

            {timeRecursive === undefined && timeThreaded === undefined && (
              <p className="text-gray-500 italic">
                Run the game to view execution times.
              </p>
            )}
          </div>
        </div>

        {/* Move Breakdown */}
        <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <h3 className="text-xl font-semibold text-indigo-300">
              Move Calculation Breakdown
            </h3>
            <span className="text-indigo-400 font-bold">
              {showBreakdown ? "▲" : "▼"}
            </span>
          </div>
          {showBreakdown && (
            <ul className="mt-3 list-disc list-inside text-gray-300 space-y-1">
              {moveBreakdown.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          )}
        </div>

        {/* How Game Works */}
        <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            How the Game Works
          </h3>
          <p className="text-gray-400">
            Move all disks from Peg 1 to Peg {P} without placing a larger disk
            on top of a smaller one. Supports both manual play and automatic
            solving algorithms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameDescription;
