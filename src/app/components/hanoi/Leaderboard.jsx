"use client";

import React, { useEffect, useState } from "react";
import MoveStepsCard from "./MovesCard";

/**
 * Formats milliseconds into human-readable time string (minutes and seconds)
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "5m 30s") or "-" if invalid
 */
const formatTime = (ms) => {
  if (!ms) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

/**
 * Leaderboard component displaying top 10 scores
 * Fetches scores from API and displays them sorted by disks (desc), moves (asc), time (asc)
 */
const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches leaderboard data from API and processes scores
   * Sorts by: disks (descending), then moves (ascending), then time (ascending)
   */
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hanoi/scores");
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch");

      const scores = data.scores.map((s) => ({
        id: s.id,
        playerName: s.player_name || "Anonymous",
        disks: s.disks || 0,
        pegs: s.pegs || 0,
        totalMoves: s.user_moves ?? 0,
        optimalMoves: s.target_moves ?? 0,
        isOptimal: s.is_optimal === 1,
        timeTakenMs: s.time_taken_ms ?? 0,
        steps: s.steps ? JSON.parse(s.steps) : [],
      }));

      scores.sort((a, b) => {
        if (a.disks !== b.disks) return b.disks - a.disks;
        if (a.totalMoves !== b.totalMoves) return a.totalMoves - b.totalMoves;
        return a.timeTakenMs - b.timeTakenMs;
      });

      setLeaderboard(scores.slice(0, 10));
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 rounded-3xl shadow-xl text-center w-full animate-pulse">
        <p className="text-gray-400">Loading Leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 rounded-3xl shadow-xl text-center w-full">
        <p className="text-red-400 font-bold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg mx-auto space-y-6">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center mb-8">
        Leaderboard <br /> (Top 10)
      </h2>

      <div className="flex flex-wrap gap-6 justify-center">
        {leaderboard.length === 0 ? (
          <p className="text-gray-400 text-lg">No scores yet. Play a game!</p>
        ) : (
          leaderboard.map((score, idx) => (
            <div
              key={score.id}
              className={`flex flex-col w-80 bg-gray-800/70 backdrop-blur-md border ${
                score.isOptimal
                  ? "border-green-400/60 bg-green-900/20 shadow-green-500/30"
                  : "border-gray-700/60"
              } rounded-2xl shadow-lg p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40`}
            >
              {/* Player Info */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-white text-lg">
                    {score.playerName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {score.disks} Disks | {score.pegs} Pegs
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    score.isOptimal
                      ? "bg-green-500 text-green-900 shadow-lg"
                      : "bg-yellow-500 text-yellow-900 shadow-sm"
                  }`}
                >
                  {score.isOptimal
                    ? "Optimal"
                    : `+${score.totalMoves - score.optimalMoves}`}
                </span>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-gray-300 text-sm mb-3">
                <p className="font-medium">Moves: {score.totalMoves}</p>
                <p className="font-medium">
                  Time: {formatTime(score.timeTakenMs)}
                </p>
              </div>

              {/* Steps Card */}
              {score.steps?.length > 0 && (
                <div className="mt-2">
                  <MoveStepsCard steps={score.steps} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
