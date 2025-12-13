"use client";

import React, { useMemo, useState } from "react";
import {
  minMoves3Pegs,
  minMoves4Pegs,
  ALGORITHM_OPTIONS_3P,
  ALGORITHM_OPTIONS_4P,
} from "./hanoi-utils";

const GameDescription = ({
  N,
  P,
  selectedAlgorithm3P,
  selectedAlgorithm4P,
  isStrictAlgorithmMode = false,
  solutionMoves = [],
  gameStatus,
  setGameStatus = () => {},
  resetGame = () => {},
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

    if (P === 4 && selectedAlgorithm4P === ALGORITHM_OPTIONS_4P.FRAME_STEWART)
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
    if (P === 3) {
      return {
        movesCount: minMoves3Pegs(N),
        estimatedTimeComplexity: `O(2^${N})`,
        estimatedSpaceComplexity: `O(${N})`,
      };
    }
    if (P === 4) {
      return {
        movesCount: minMoves4Pegs(N),
        estimatedTimeComplexity: `O(2^√${N}) approx.`,
        estimatedSpaceComplexity: `O(√${N}) approx.`,
      };
    }
    return null;
  }, [N, P]);

  const moveBreakdown = useMemo(() => {
    const breakdown = [];
    if (P === 3) {
      for (let i = 1; i <= N; i++) {
        const moves = 2 ** (i - 1);
        breakdown.push(`Move disk ${i}: contributes ${moves} moves`);
      }
    } else if (P === 4) {
      for (let i = 1; i <= N; i++) {
        breakdown.push(`Disk ${i}: counted in Frame-Stewart optimal moves`);
      }
    }
    return breakdown;
  }, [N, P]);

  return (
    <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl text-gray-100 space-y-6">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center">
        Tower of Hanoi Overview
      </h2>

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
        <p className="font-bold text-gray-200">{algorithmDescription.title}</p>
        <p className="text-gray-400 mt-1">{algorithmDescription.desc}</p>
        <div className="text-yellow-300 mt-2 font-semibold">
          Theoretical Complexity:{" "}
          {typeof algorithmDescription.complexity === "string"
            ? algorithmDescription.complexity
            : algorithmDescription.complexity}
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
    </div>
  );
};

export default React.memo(GameDescription);
