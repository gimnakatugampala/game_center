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

  // Optimal moves for given N and P
  const optimalMoves = useMemo(
    () => (P === 3 ? minMoves3Pegs(N) : minMoves4Pegs(N)),
    [P, N]
  );

  // Algorithm Description
  const algorithmDescription = useMemo(() => {
    if (P === 3) {
      if (selectedAlgorithm3P === ALGORITHM_OPTIONS_3P.RECURSIVE)
        return {
          title: "Recursive Optimal Solution",
          desc: "Classical 3-peg optimal algorithm using recursion. Always produces minimal moves.",
          complexity: {
            time: `O(2^${N})`,
            space: `O(${N})`,
          },
        };
      return {
        title: "Non-Optimal Iterative Solution",
        desc: "3-peg iterative algorithm. Faster to compute but may not follow minimal move sequence.",
        complexity: {
          time: `O(2^${N}) (approx.)`,
          space: `O(${N})`,
        },
      };
    }

    if (P === 4) {
      if (selectedAlgorithm4P === ALGORITHM_OPTIONS_4P.FRAME_STEWART)
        return {
          title: "Frame-Stewart Optimal Solution",
          desc: "Recursive 4-peg algorithm using Frame-Stewart partitioning. Produces near-minimal moves.",
          complexity: {
            time: `O(2^√${N}) approx.`,
            space: `O(√${N}) approx.`,
          },
        };
      return {
        title: "Non-Optimal Iterative Solution",
        desc: "4-peg iterative algorithm. Demonstration only, moves may exceed optimal count.",
        complexity: {
          time: `O(N^2) approx.`,
          space: `O(N) approx.`,
        },
      };
    }

    return {
      title: "Unknown Algorithm",
      desc: "No description available.",
      complexity: {
        time: "-",
        space: "-",
      },
    };
  }, [P, selectedAlgorithm3P, selectedAlgorithm4P, N]);

  // Programmatic Analysis: Recursive vs Iterative
  const programmaticComplexity = useMemo(() => {
    if (P === 3) {
      return {
        optimalMoves: minMoves3Pegs(N),
        recursive: {
          time: `O(2^${N})`,
          space: `O(${N})`,
        },
        iterative: {
          time: `O(2^${N}) (approx.)`,
          space: `O(${N})`,
        },
      };
    }
    if (P === 4) {
      return {
        optimalMoves: minMoves4Pegs(N),
        recursive: {
          time: `O(2^√${N}) approx.`,
          space: `O(√${N}) approx.`,
        },
        iterative: {
          time: `O(N^2) approx.`,
          space: `O(N) approx.`,
        },
      };
    }
    return null;
  }, [N, P]);

  // Move breakdown per disk
  const moveBreakdown = useMemo(() => {
    const breakdown = [];
    if (P === 3) {
      for (let i = 1; i <= N; i++) {
        const moves = 2 ** (i - 1);
        breakdown.push(`Disk ${i}: contributes ${moves} moves`);
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
          <span className="text-green-400 font-bold">
            {programmaticComplexity.optimalMoves}
          </span>
        </p>
      </div>

      {/* Programmatic Analysis */}
      {programmaticComplexity && (
        <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl shadow-lg hover:scale-105 hover:shadow-purple-500/50 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            Programmatic Analysis
          </h3>

          {/* Recursive */}
          <p>
            <span className="font-semibold">Recursive:</span> Time:{" "}
            <span className="text-yellow-300">
              {programmaticComplexity.recursive.time}
            </span>
            , Space:{" "}
            <span className="text-yellow-300">
              {programmaticComplexity.recursive.space}
            </span>
          </p>

          {/* Iterative */}
          <p>
            <span className="font-semibold">Iterative:</span> Time:{" "}
            <span className="text-yellow-300">
              {programmaticComplexity.iterative.time}
            </span>
            , Space:{" "}
            <span className="text-yellow-300">
              {programmaticComplexity.iterative.space}
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
          Theoretical Complexity: Time: {algorithmDescription.complexity.time},
          Space: {algorithmDescription.complexity.space}
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
