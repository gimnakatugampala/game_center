"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import SetupPanel from "../../components/hanoi/SetupPanel";
import StatusAndSolver from "../../components/hanoi/StatusAndSolver";
import PegsDisplay from "../../components/hanoi/PegsDisplay";
import Leaderboard from "../../components/hanoi/Leaderboard";
import MovesCard from "../../components/hanoi/MovesCard";

import {
  initializePegs,
  isMoveValid,
  minMoves3Pegs,
  minMoves4Pegs,
  solveHanoi3PegsRecursive,
  solveHanoi4PFrameStewart,
  fetchLeaderboard,
  postScore,
  RANDOM_DISKS,
  MIN_DISKS,
  ALGORITHM_OPTIONS_3P,
  ALGORITHM_OPTIONS_4P,
} from "../../components/hanoi/hanoi-utils.js";

const Page = () => {
  // --- Game State ---
  const [N, setN] = useState(RANDOM_DISKS);
  const [P, setP] = useState(3);
  const [pegs, setPegs] = useState([]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameStatus, setGameStatus] = useState("SETUP"); // SETUP | PLAYING | SOLVING | WON | GAMEOVER | SHOW_DESCRIPTION
  const [playerName, setPlayerName] = useState("");

  // --- Solver Options ---
  const [selectedAlgorithm3P, setSelectedAlgorithm3P] = useState(
    ALGORITHM_OPTIONS_3P.RECURSIVE
  );
  const [selectedAlgorithm4P, setSelectedAlgorithm4P] = useState(
    ALGORITHM_OPTIONS_4P.FRAME_STEWART
  );

  // --- Auto-Solve / Optimal Solution ---
  const [solutionMoves, setSolutionMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAutoSolving, setIsAutoSolving] = useState(false);

  // --- Timer ---
  const [timeLimit, setTimeLimit] = useState(30);
  const [remainingTime, setRemainingTime] = useState(0);

  // --- Leaderboard ---
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // --- Derived Values ---
  const optimalMoves = useMemo(
    () => (P === 3 ? minMoves3Pegs(N) : minMoves4Pegs(N)),
    [N, P]
  );
  const isGameWon = useMemo(
    () => pegs[P - 1]?.length === N && N > 0,
    [pegs, N, P]
  );

  // --- Load Leaderboard ---
  const loadLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const scores = await fetchLeaderboard();
      setLeaderboard(scores.slice(0, 10));
      if (!scores || scores.length === 0) setApiError("No scores found.");
    } catch (error) {
      setApiError("Failed to load leaderboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // --- Setup Game ---
  const handleSetupGame = useCallback((N_disks, P_pegs, timeSec) => {
    setN(N_disks);
    setP(P_pegs);
    setPegs(initializePegs(N_disks, P_pegs));
    setSelectedPeg(null);
    setMoveCount(0);
    setStartTime(Date.now());
    setGameStatus("PLAYING");
    setSolutionMoves([]);
    setCurrentMoveIndex(0);
    setIsAutoSolving(false);
    setTimeLimit(timeSec);
    setRemainingTime(timeSec);
    setApiError(null);
  }, []);

  // --- Countdown Timer ---
  useEffect(() => {
    if (gameStatus !== "PLAYING") return;
    if (remainingTime <= 0) {
      setGameStatus("GAMEOVER");
      setIsAutoSolving(false);
      return;
    }
    const timer = setTimeout(() => setRemainingTime((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime, gameStatus]);

  // --- Handle Peg Click ---
  const handlePegClick = useCallback(
    (pegIndex) => {
      if (gameStatus !== "PLAYING" || isAutoSolving) return;
      if (selectedPeg === null) {
        if (pegs[pegIndex]?.length > 0) setSelectedPeg(pegIndex);
        return;
      }
      const sourceIndex = selectedPeg;
      const destIndex = pegIndex;
      setSelectedPeg(null);
      if (sourceIndex === destIndex) return;
      if (isMoveValid(pegs, sourceIndex, destIndex)) {
        setPegs((prev) => {
          const newPegs = prev.map((p) => [...p]);
          newPegs[destIndex].push(newPegs[sourceIndex].pop());
          return newPegs;
        });
        setMoveCount((c) => c + 1);
      }
    },
    [pegs, selectedPeg, gameStatus, isAutoSolving]
  );

  // --- Auto-Solve Generation ---
  const generateSolution = useCallback(() => {
    if (N === 0 || gameStatus !== "PLAYING") return;

    const moves = [];
    // Reset pegs and move count before auto-solving
    setPegs(initializePegs(N, P));
    setMoveCount(0);
    setCurrentMoveIndex(0);

    if (P === 3) {
      // 3 Pegs Optimal
      solveHanoi3PegsRecursive(N, 0, P - 1, 1, moves);
    } else if (P === 4) {
      // 4 Pegs Frame-Stewart Optimal
      solveHanoi4PFrameStewart(N, 0, P - 1, [1, 2], moves);
    }

    setSolutionMoves(moves);
    setIsAutoSolving(true);
    setGameStatus("SOLVING");
  }, [N, P, gameStatus]);

  // --- Auto-Solve Moves ---
  useEffect(() => {
    if (!isAutoSolving || currentMoveIndex >= solutionMoves.length) {
      if (isAutoSolving) setGameStatus("WON");
      setIsAutoSolving(false);
      return;
    }

    const timer = setTimeout(() => {
      const { from, to } = solutionMoves[currentMoveIndex];

      setPegs((prev) => {
        const newPegs = prev.map((p) => [...p]);
        newPegs[to].push(newPegs[from].pop());
        return newPegs;
      });

      setMoveCount((c) => c + 1);
      setCurrentMoveIndex((c) => c + 1);
    }, 200); // Adjust speed here (ms)

    return () => clearTimeout(timer);
  }, [isAutoSolving, currentMoveIndex, solutionMoves]);

  // --- Post Score & Generate Optimal Solution on Manual Win ---
  useEffect(() => {
    if (!isGameWon) return;

    if (gameStatus !== "WON" && gameStatus !== "SHOW_DESCRIPTION")
      setGameStatus("WON");

    // Generate optimal moves if not generated yet
    if (solutionMoves.length === 0) {
      const moves = [];
      if (P === 3) solveHanoi3PegsRecursive(N, 0, P - 1, 1, moves);
      else solveHanoi4PegsFrameStewart(N, 0, P - 1, [1, 2], moves);
      setSolutionMoves(moves);
    }

    const timeTakenMs = Date.now() - startTime;
    const scoreData = {
      user_id: "anonymous",
      player_name: playerName || "Anonymous",
      pegs: P,
      disks: N,
      user_moves: moveCount,
      target_moves: optimalMoves,
      is_optimal: moveCount === optimalMoves,
      time_taken_ms: timeTakenMs,
    };

    (async () => {
      try {
        setIsLoading(true);
        await postScore(scoreData);
        await loadLeaderboardData();
      } catch (error) {
        setApiError("Failed to update leaderboard.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isGameWon]);

  // --- Reset Game ---
  const resetGame = useCallback(() => {
    setGameStatus("SETUP");
    setPegs([]);
    setN(RANDOM_DISKS);
    setSelectedPeg(null);
    setMoveCount(0);
    setSolutionMoves([]);
    setCurrentMoveIndex(0);
    setIsAutoSolving(false);
    setRemainingTime(timeLimit || 0);
    setApiError(null);
    setSelectedAlgorithm3P(ALGORITHM_OPTIONS_3P.RECURSIVE);
    setSelectedAlgorithm4P(ALGORITHM_OPTIONS_4P.FRAME_STEWART);
  }, [timeLimit]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-10 font-sans">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-indigo-400 mb-2 tracking-tight">
          Tower of Hanoi Explorer
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Challenge yourself with multiple pegs, custom solvers, and a live
          leaderboard.
        </p>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <SetupPanel
          playerName={playerName}
          setPlayerName={setPlayerName}
          P={P}
          setP={setP}
          N={N}
          setN={setN}
          gameStatus={gameStatus}
          handleSetupGame={(n, p) => handleSetupGame(n, p, timeLimit)}
          selectedAlgorithm3P={selectedAlgorithm3P}
          setSelectedAlgorithm3P={setSelectedAlgorithm3P}
          selectedAlgorithm4P={selectedAlgorithm4P}
          setSelectedAlgorithm4P={setSelectedAlgorithm4P}
          timeLimit={timeLimit}
          setTimeLimit={setTimeLimit}
        />

        {/* Game Display */}
        <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg mx-auto space-y-6">
          {gameStatus === "PLAYING" && (
            <div className="text-lg font-semibold text-yellow-400 animate-pulse">
              Time Remaining: {Math.floor(remainingTime / 60)}:
              {String(remainingTime % 60).padStart(2, "0")}
            </div>
          )}

          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center mb-8">
            {gameStatus === "SETUP"
              ? "Ready to Start"
              : `Game: ${N} Disks, ${P} Pegs`}
          </h2>

          {N > 0 && pegs.length > 0 && (
            <PegsDisplay
              pegs={pegs}
              P={P}
              N={N}
              gameStatus={gameStatus}
              selectedPeg={selectedPeg}
              handlePegClick={handlePegClick}
              isAutoSolving={isAutoSolving}
            />
          )}

          {["PLAYING", "SOLVING", "WON"].includes(gameStatus) && (
            <StatusAndSolver
              N={N}
              P={P}
              moveCount={moveCount}
              optimalMoves={optimalMoves}
              gameStatus={gameStatus}
              currentMoveIndex={currentMoveIndex}
              solutionMoves={solutionMoves}
              generateSolution={generateSolution}
              isAutoSolving={isAutoSolving}
            />
          )}
        </div>

        {/* Leaderboard */}
        <Leaderboard
          leaderboard={leaderboard}
          isLoading={isLoading}
          apiError={apiError}
        />
      </div>

      {/* Overlay on Game End */}
      {(gameStatus === "WON" || gameStatus === "GAMEOVER") &&
        gameStatus !== "SHOW_DESCRIPTION" && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full animate-fadeIn space-y-6">
              <h3 className="text-4xl font-extrabold mb-2 text-indigo-400">
                {gameStatus === "WON"
                  ? isAutoSolving
                    ? "Solved by Algorithm!"
                    : "🎉 You Solved It!"
                  : "⏱ Time's Up! Game Over"}
              </h3>

              {gameStatus === "WON" && (
                <p className="text-xl text-gray-100">
                  Total Moves:{" "}
                  <span
                    className={`font-bold ${
                      moveCount === optimalMoves
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {moveCount}
                  </span>{" "}
                  (Optimal:{" "}
                  <span className="font-bold text-green-400">
                    {optimalMoves}
                  </span>
                  )
                </p>
              )}

              <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
                {gameStatus === "WON" && solutionMoves.length > 0 && (
                  <button
                    onClick={() => setGameStatus("SHOW_DESCRIPTION")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition duration-150 shadow-lg hover:scale-[1.02]"
                  >
                    Show Description
                  </button>
                )}
                <button
                  onClick={resetGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition duration-150 shadow-lg hover:scale-[1.02]"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Show Description Modal */}
      {gameStatus === "SHOW_DESCRIPTION" && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-start z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl text-center max-w-3xl w-full mt-16 space-y-4">
            <h3 className="text-3xl font-extrabold text-indigo-400 mb-4">
              Optimal Solution Steps
            </h3>

            <MovesCard moves={solutionMoves} />

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setGameStatus("WON")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition duration-150 shadow-lg hover:scale-[1.02]"
              >
                Close Description
              </button>

              <button
                onClick={resetGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition duration-150 shadow-lg hover:scale-[1.02]"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
