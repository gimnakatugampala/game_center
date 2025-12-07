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

      const scoresArray = Array.isArray(data)
        ? data
        : data?.success
        ? data.scores
        : [];

      const sortedScores = scoresArray
        .map((s) => ({
          playerName: s.player_name || s.playerName || "Anonymous",
          disks: s.disks || 0,
          pegs: s.pegs || 0,
          totalMoves: s.user_moves || s.totalMoves || 0,
          optimalMoves: s.target_moves || s.optimalMoves || 0,
          isOptimal:
            s.is_optimal === 1 || s.is_optimal === true || s.isOptimal === true,
          timeTakenMs: s.time_taken_ms || s.timeTakenMs || 0,
        }))
        .sort((a, b) => {
          if (a.disks !== b.disks) return b.disks - a.disks;
          if (a.totalMoves !== b.totalMoves) return a.totalMoves - b.totalMoves;
          return (a.timeTakenMs || 0) - (b.timeTakenMs || 0);
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
      <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 text-center">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-700 rounded-full"></div>
          <div className="h-4 bg-gray-700 rounded-full w-5/6 mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded-full w-4/6 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading Leaderboard...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="p-6 bg-red-900/30 rounded-2xl shadow-2xl border border-red-700 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Leaderboard Error
        </h3>
        <p className="text-sm text-red-300">{apiError}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-2xl mx-auto">
      <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4 border-b border-gray-700 pb-2 text-center">
        Leaderboard (Top 10)
      </h3>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-gray-400 text-center">
            No scores posted yet. Play a game to submit one!
          </p>
        ) : (
          leaderboard.map((score, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-4 rounded-xl transition duration-200 transform hover:scale-[1.01] ${
                score.isOptimal
                  ? "bg-green-900/20 border border-green-700"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              <div className="flex items-center space-x-4">
                <span
                  className={`w-8 h-8 flex items-center justify-center font-bold rounded-full border-2 text-sm ${
                    index === 0
                      ? "bg-yellow-500 text-yellow-900 border-yellow-400"
                      : index === 1
                      ? "bg-gray-400 text-gray-900 border-gray-300"
                      : index === 2
                      ? "bg-yellow-700 text-yellow-200 border-yellow-600"
                      : "bg-gray-700 text-gray-300 border-gray-600"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-white font-semibold">{score.playerName}</p>
                  <p className="text-gray-400 text-xs">
                    {score.disks} Disks, {score.pegs} Pegs
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-blue-400 font-bold">
                  {score.totalMoves} Moves
                </p>
                <p className="text-gray-400 text-xs">
                  Time: {formatTime(score.timeTakenMs)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    score.isOptimal ? "text-green-400" : "text-red-400"
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
