"use client";

import React, { useEffect } from "react";
import {
  PEGS_OPTIONS,
  MIN_DISKS,
  MAX_DISKS,
  ALGORITHM_OPTIONS_3P,
  ALGORITHM_OPTIONS_4P,
} from "./hanoi-utils";
import GameDescription from "./gameDescription";

const SetupPanel = ({
  playerName,
  setPlayerName,
  P,
  setP,
  N,
  setN,
  gameStatus,
  handleSetupGame,
  selectedAlgorithm3P,
  setSelectedAlgorithm3P,
  selectedAlgorithm4P,
  setSelectedAlgorithm4P,
  timeLimit,
  setTimeLimit,
  MIN_TIME = 30,
  MAX_TIME = 600,
}) => {
  const isSetup = gameStatus === "SETUP";

  const currentAlgorithmOptions =
    P === 3 ? ALGORITHM_OPTIONS_3P : ALGORITHM_OPTIONS_4P;
  const currentSelectedAlgorithm =
    P === 3 ? selectedAlgorithm3P : selectedAlgorithm4P;
  const setSelectedAlgorithm =
    P === 3 ? setSelectedAlgorithm3P : setSelectedAlgorithm4P;

  useEffect(() => {
    if (P === 3 && !selectedAlgorithm3P)
      setSelectedAlgorithm3P(ALGORITHM_OPTIONS_3P.RECURSIVE);
    if (P === 4 && !selectedAlgorithm4P)
      setSelectedAlgorithm4P(ALGORITHM_OPTIONS_4P.FRAME_STEWART);
  }, [
    P,
    selectedAlgorithm3P,
    selectedAlgorithm4P,
    setSelectedAlgorithm3P,
    setSelectedAlgorithm4P,
  ]);

  // Hover style class for consistency with GameDescription
  const hoverCardClass =
    "transition-transform duration-200 hover:scale-105 hover:shadow-2xl";

  return (
    <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg mx-auto space-y-6">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center">
        Tower of Hanoi Setup
      </h2>

      {/* Player Name */}
      <div className={`space-y-2 ${hoverCardClass}`}>
        <label className="block text-sm font-semibold text-gray-400">
          Your Name (for Leaderboard)
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          disabled={!isSetup}
          className="w-full rounded-2xl border border-gray-700 bg-gray-800 text-white p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition duration-150 disabled:bg-gray-700/50 disabled:text-gray-500"
        />
      </div>

      {/* Pegs Selection */}
      <div className={`space-y-2 ${hoverCardClass}`}>
        <p className="text-sm font-semibold text-gray-400">
          Number of Pegs (P):
        </p>
        <div className="flex gap-3 flex-wrap">
          {PEGS_OPTIONS.map((peg) => (
            <button
              key={peg}
              onClick={() => setP(peg)}
              disabled={!isSetup}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-200 text-white ${
                P === peg
                  ? "bg-indigo-600 ring-2 ring-indigo-400 shadow-lg"
                  : "bg-gray-800 hover:bg-gray-700 hover:shadow-lg"
              }`}
            >
              {peg} Pegs
            </button>
          ))}
        </div>
      </div>

      {/* Disks Slider */}
      <div
        className={`p-4 border border-gray-700 rounded-2xl bg-gray-800/60 ${hoverCardClass}`}
      >
        <label className="block text-sm font-semibold text-gray-400 mb-3 flex justify-between items-center">
          <span>Number of Disks (N):</span>
          <span className="text-xl font-extrabold text-indigo-400">{N}</span>
        </label>
        <input
          type="range"
          min={MIN_DISKS}
          max={MAX_DISKS}
          value={N}
          onChange={(e) => setN(parseInt(e.target.value))}
          disabled={!isSetup}
          className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{MIN_DISKS}</span>
          <span>{MAX_DISKS}</span>
        </div>
      </div>

      {/* Time Limit Slider */}
      <div
        className={`p-4 border border-gray-700 rounded-2xl bg-gray-800/60 ${hoverCardClass}`}
      >
        <label className="block text-sm font-semibold text-gray-400 mb-3 flex justify-between items-center">
          <span>Time Limit (seconds):</span>
          <span className="text-xl font-extrabold text-green-400">
            {timeLimit}
          </span>
        </label>
        <input
          type="range"
          min={MIN_TIME}
          max={MAX_TIME}
          step={5}
          value={timeLimit || MIN_TIME}
          onChange={(e) => setTimeLimit(parseInt(e.target.value))}
          disabled={!isSetup}
          className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer accent-green-400"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{MIN_TIME}</span>
          <span>{MAX_TIME}</span>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className={`space-y-2 ${hoverCardClass}`}>
        <p className="text-sm font-semibold text-gray-400">
          Solver Algorithm ({P} Pegs)
        </p>
        <div className="flex flex-col gap-2">
          {Object.entries(currentAlgorithmOptions).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedAlgorithm(label)}
              disabled={!isSetup}
              className={`py-3 px-4 rounded-2xl font-medium text-left transition-all duration-200 ${
                currentSelectedAlgorithm === label
                  ? "bg-purple-600 text-white ring-2 ring-purple-400 shadow-2xl"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:shadow-lg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Game */}
      <button
        onClick={() => handleSetupGame(N, P, timeLimit)}
        disabled={!playerName || !isSetup}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition duration-150 hover:scale-105 hover:shadow-2xl"
      >
        Start Round ({N} Disks, {P} Pegs)
      </button>

      {/* Game Description */}
      <div className="mt-6">
        <GameDescription
          N={N}
          P={P}
          selectedAlgorithm3P={selectedAlgorithm3P}
          selectedAlgorithm4P={selectedAlgorithm4P}
        />
      </div>
    </div>
  );
};

export default React.memo(SetupPanel);
