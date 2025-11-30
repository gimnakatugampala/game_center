"use client";

import React, { useEffect, useState } from "react";

const formatTime = (ms) => {
  if (!ms) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/hanoi/scores");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      const sortedScores = data.scores
        .map((s) => ({
          playerName: s.player_name,
          disks: s.disks,
          pegs: s.pegs,
          totalMoves: s.user_moves,
          optimalMoves: s.target_moves,
          isOptimal: s.is_optimal === 1 || s.is_optimal === true,
          timeTakenMs: s.time_taken_ms,
        }))
        .sort((a, b) => {
          if (a.disks !== b.disks) return b.disks - a.disks;
          if (a.totalMoves !== b.totalMoves) return a.totalMoves - b.totalMoves;
          if ((a.timeTakenMs || 0) !== (b.timeTakenMs || 0))
            return (a.timeTakenMs || 0) - (b.timeTakenMs || 0);
          return 0;
        })
        .slice(0, 10);

      setLeaderboard(sortedScores);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      setApiError("Failed to load leaderboard from server.");
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 text-center text-white">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading Leaderboard...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="p-6 bg-red-900 shadow-2xl rounded-2xl border border-red-700 text-white">
        <h3 className="text-xl font-bold mb-2">Leaderboard Error</h3>
        <p className="text-sm">{apiError}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 text-white">
      <h3 className="text-2xl font-extrabold text-blue-300 mb-4 border-b border-gray-700 pb-2">
        Leaderboard (Top 10)
      </h3>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-gray-400">
            No scores posted yet. Play a game to submit one!
          </p>
        ) : (
          leaderboard.map((score, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-3 rounded-xl transition-all duration-150 ${
                score.isOptimal
                  ? "bg-purple-900 border border-purple-600"
                  : "bg-gray-700 border border-gray-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`font-extrabold text-lg w-6 text-center ${
                    score.isOptimal ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  #{index + 1}
                </span>
                <div>
                  <p className="font-semibold text-blue-300">
                    {score.playerName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {score.disks} Disks, {score.pegs} Pegs
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-gray-200">
                  {score.totalMoves} Moves
                </p>
                <p className="text-xs text-gray-400">
                  Time: {formatTime(score.timeTakenMs)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    score.isOptimal ? "text-yellow-400" : "text-red-400"
                  }`}
                >
                  {score.isOptimal
                    ? "Optimal"
                    : `+${score.totalMoves - score.optimalMoves} moves`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
