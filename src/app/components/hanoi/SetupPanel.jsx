import React from "react";
import {
  PEGS_OPTIONS,
  MIN_DISKS,
  MAX_DISKS,
  ALGORITHM_OPTIONS_3P,
  ALGORITHM_OPTIONS_4P,
} from "./hanoi-utils"; // FIXED: Changed to sibling import

const SetupPanel = React.memo(
  ({
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
  }) => {
    const currentAlgorithmOptions =
      P === 3 ? ALGORITHM_OPTIONS_3P : ALGORITHM_OPTIONS_4P;
    const currentSelectedAlgorithm =
      P === 3 ? selectedAlgorithm3P : selectedAlgorithm4P;
    const setSelectedAlgorithm =
      P === 3 ? setSelectedAlgorithm3P : setSelectedAlgorithm4P;

    // Use useEffect to set a default algorithm when the component loads or P changes
    React.useEffect(() => {
      // Added null/undefined check for the setter function before calling it
      if (P === 3 && !selectedAlgorithm3P && setSelectedAlgorithm3P) {
        setSelectedAlgorithm3P(ALGORITHM_OPTIONS_3P.RECURSIVE);
      } else if (P === 4 && !selectedAlgorithm4P && setSelectedAlgorithm4P) {
        setSelectedAlgorithm4P(ALGORITHM_OPTIONS_4P.FRAME_STEWART);
      }
    }, [
      P,
      selectedAlgorithm3P,
      selectedAlgorithm4P,
      setSelectedAlgorithm3P,
      setSelectedAlgorithm4P,
    ]);

    const isSetup = gameStatus === "SETUP";

    return (
      <div className="p-6 bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 space-y-6">
        <h2 className="text-3xl font-extrabold text-blue-300">
          Tower of Hanoi Setup
        </h2>

        {/* Player Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-400">
            Your Name (for Leaderboard)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-gray-600 bg-gray-700 text-white shadow-inner p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 disabled:bg-gray-700/50 disabled:text-gray-500"
            disabled={!isSetup}
          />
        </div>

        {/* Number of Pegs */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-400">
            Number of Pegs (P):
          </p>
          <div className="flex space-x-4">
            {PEGS_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setP(p)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                  P === p
                    ? "bg-blue-600 text-white ring-2 ring-blue-400 transform scale-[1.02]"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } disabled:opacity-50 disabled:shadow-none`}
                disabled={!isSetup}
              >
                {p} Pegs
              </button>
            ))}
          </div>
        </div>

        {/* Number of Disks Slider */}
        <div className="p-4 border border-gray-700 rounded-xl bg-gray-700/50">
          <label className="block text-sm font-semibold text-gray-400 mb-3 flex justify-between items-center">
            <span>Number of Disks (N):</span>{" "}
            <span className="text-xl font-extrabold text-blue-300">{N}</span>
          </label>
          <input
            type="range"
            min={MIN_DISKS}
            max={MAX_DISKS}
            step="1"
            value={N}
            onChange={(e) => setN(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 disabled:[&::-webkit-slider-thumb]:bg-gray-500"
            disabled={!isSetup}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{MIN_DISKS}</span>
            <span>{MAX_DISKS}</span>
          </div>
        </div>

        {/* Algorithm Selection (Conditional) */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-400">
            Optimal Solver Algorithm ({P} Pegs)
          </p>
          <div className="flex flex-col space-y-2">
            {Object.entries(currentAlgorithmOptions).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedAlgorithm(label)}
                className={`py-2 px-4 rounded-lg font-medium transition-colors duration-150 text-left ${
                  currentSelectedAlgorithm === label
                    ? "bg-purple-600 text-white shadow-inner ring-2 ring-purple-400"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } disabled:opacity-50 disabled:shadow-none`}
                disabled={!isSetup}
              >
                {label}
                {label.includes("Optimal") && (
                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">
                    Optimal
                  </span>
                )}
                {label.includes("Non-Optimal") && (
                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-red-400 text-red-900">
                    Heuristic
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={() => handleSetupGame(N, P)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.01] text-lg mt-4 disabled:bg-gray-600 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          disabled={!playerName || !isSetup}
        >
          Start Round ({N} Disks, {P} Pegs)
        </button>
      </div>
    );
  }
);

export default SetupPanel;
