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
  solveHanoi3PegsIterative,
  solveHanoi4PegsFrameStewart,
  solveHanoi4PegsIterative,
  fetchLeaderboard,
  postScore,
  ALGORITHM_OPTIONS_3P,
  ALGORITHM_OPTIONS_4P,
} from "../../components/hanoi/hanoi-utils.js";

const DEFAULT_RANDOM_DISKS = 5;

const Page = () => {
  /* -------------------- STATES -------------------- */
  const [solverTimeMs, setSolverTimeMs] = useState(null);
  const [N, setN] = useState(DEFAULT_RANDOM_DISKS);
  const [P, setP] = useState(3);
  const [pegs, setPegs] = useState([]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameStatus, setGameStatus] = useState("SETUP"); // PLAYING, WON, GAMEOVER, SOLVING
  const [gameState, setGameState] = useState("welcome"); // welcome/setup
  const [playerName, setPlayerName] = useState("");
  const [solutionMoves, setSolutionMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [error, setError] = useState("");
  const [moveError, setMoveError] = useState(null);
  const [userMovesList, setUserMovesList] = useState([]);
  const [optimalMovesList, setOptimalMovesList] = useState([]);

  const [selectedAlgorithm3P, setSelectedAlgorithm3P] = useState(
    ALGORITHM_OPTIONS_3P.RECURSIVE
  );
  const [selectedAlgorithm4P, setSelectedAlgorithm4P] = useState(
    ALGORITHM_OPTIONS_4P.FRAME_STEWART
  );

  /* -------------------- DERIVED -------------------- */
  const isStrictAlgorithmMode = useMemo(
    () =>
      (P === 3 && selectedAlgorithm3P === ALGORITHM_OPTIONS_3P.RECURSIVE) ||
      (P === 4 && selectedAlgorithm4P === ALGORITHM_OPTIONS_4P.FRAME_STEWART),
    [P, selectedAlgorithm3P, selectedAlgorithm4P]
  );

  const shouldShowTimer = useMemo(
    () => gameStatus === "PLAYING" && !isAutoSolving && isTimerActive,
    [gameStatus, isAutoSolving, isTimerActive]
  );

  const pegLetters = useMemo(() => {
    const letters = ["A", "B", "C", "D"];
    return letters.slice(0, P);
  }, [P]);

  const targetMoves = useMemo(() => {
    if (solutionMoves.length > 0) return solutionMoves.length;
    return P === 3 ? minMoves3Pegs(N) : minMoves4Pegs(N);
  }, [solutionMoves, N, P]);

  const isGameWon = useMemo(
    () => pegs[P - 1]?.length === N && N > 0,
    [pegs, N, P]
  );

  const isOptimalWin = useMemo(
    () => gameStatus === "WON" && moveCount === targetMoves,
    [gameStatus, moveCount, targetMoves]
  );

  const isPartialWin = useMemo(
    () => gameStatus === "WON" && moveCount > targetMoves,
    [gameStatus, moveCount, targetMoves]
  );

  const resultMessage = useMemo(() => {
    if (isOptimalWin) return "🏆 Congratulations!";
    if (isPartialWin)
      return "✅ Puzzle solved! You used more moves than optimal, but well done!";
    return "";
  }, [isOptimalWin, isPartialWin]);

  /* -------------------- LEADERBOARD -------------------- */
  const loadLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const scores = await fetchLeaderboard();
      setLeaderboard(scores?.slice(0, 10) || []);
    } catch {
      setApiError("Failed to load leaderboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  /* -------------------- PLAYER NAME -------------------- */
  const handlePlayerNameSubmit = () => {
    if (!playerName.trim()) return setError("Please enter your name");
    if (playerName.trim().length < 2)
      return setError("Name must be at least 2 characters");
    setError("");
    setGameState("setup");
  };

  /* -------------------- TIMER -------------------- */
  useEffect(() => {
    if (!shouldShowTimer) return;
    if (remainingTime <= 0) {
      setGameStatus("GAMEOVER");
      return;
    }
    const timer = setTimeout(() => setRemainingTime((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime, shouldShowTimer]);

  /* -------------------- MANUAL MOVE -------------------- */
  const handlePegClick = useCallback(
    (pegIndex) => {
      if (gameStatus !== "PLAYING" || isAutoSolving) return;

      if (selectedPeg === null) {
        if (pegs[pegIndex]?.length > 0) setSelectedPeg(pegIndex);
        return;
      }

      const from = selectedPeg;
      const to = pegIndex;
      setSelectedPeg(null);
      if (from === to) return;

      if (!isMoveValid(pegs, from, to)) {
        setMoveError(
          "❌ Invalid move! Only one disk at a time and no larger disk on a smaller disk."
        );
        return;
      }

      setMoveError(null);

      // Move disk
      setPegs((prev) => {
        const copy = prev.map((p) => [...p]);
        copy[to].push(copy[from].pop());
        return copy;
      });

      // Track move as letter notation
      setUserMovesList((prev) => [
        ...prev,
        { from: pegLetters[from], to: pegLetters[to] },
      ]);

      setMoveCount((c) => c + 1);
    },
    [pegs, selectedPeg, gameStatus, isAutoSolving, pegLetters]
  );

  /* -------------------- SETUP GAME -------------------- */
  const handleSetupGame = (n, p, limit) => {
    const moves = [];
    const strict =
      (p === 3 && selectedAlgorithm3P === ALGORITHM_OPTIONS_3P.RECURSIVE) ||
      (p === 4 && selectedAlgorithm4P === ALGORITHM_OPTIONS_4P.FRAME_STEWART);

    // ✅ START performance measurement
    const startPerf = performance.now();

    if (p === 3) {
      strict
        ? solveHanoi3PegsRecursive(n, 0, p - 1, 1, moves)
        : solveHanoi3PegsIterative(n, 0, p - 1, 1, moves);
    } else {
      strict
        ? solveHanoi4PegsFrameStewart(n, 0, p - 1, [1, 2], moves)
        : solveHanoi4PegsIterative(n, 0, p - 1, [1, 2], moves);
    }
    // ✅ END performance measurement
    const endPerf = performance.now();
    setSolverTimeMs(endPerf - startPerf);

    setN(n);
    setP(p);
    setPegs(initializePegs(n, p));
    setMoveCount(0);
    setSolutionMoves(moves);
    setCurrentMoveIndex(0);
    setSelectedPeg(null);
    setMoveError(null);
    setIsAutoSolving(false);
    setOptimalMovesList(
      moves.map((m) => ({ from: pegLetters[m.from], to: pegLetters[m.to] }))
    );

    setIsTimerActive(true);
    setRemainingTime(limit);
    setGameStatus("PLAYING");
    setStartTime(Date.now());
  };

  /* -------------------- AUTO SOLVE -------------------- */
  const generateSolution = () => {
    if (!solutionMoves.length) return;
    setPegs(initializePegs(N, P));
    setMoveCount(0);
    setCurrentMoveIndex(0);
    setSelectedPeg(null);
    setMoveError(null);
    setIsAutoSolving(true);
    setGameStatus("SOLVING");
    setIsTimerActive(false);
    setRemainingTime(null);
  };

  useEffect(() => {
    if (!isAutoSolving || gameStatus !== "SOLVING") return;
    if (currentMoveIndex >= solutionMoves.length) {
      setIsAutoSolving(false);
      setGameStatus("WON");
      return;
    }

    const timer = setTimeout(() => {
      const { from, to } = solutionMoves[currentMoveIndex];

      setPegs((prev) => {
        if (!isMoveValid(prev, from, to)) {
          setMoveError("Auto solver encountered an invalid move.");
          setIsAutoSolving(false);
          setGameStatus("GAMEOVER");
          return prev;
        }
        const copy = prev.map((p) => [...p]);
        copy[to].push(copy[from].pop());
        return copy;
      });

      setMoveCount((c) => c + 1);
      setCurrentMoveIndex((i) => i + 1);
    }, 200);

    return () => clearTimeout(timer);
  }, [isAutoSolving, gameStatus, currentMoveIndex, solutionMoves]);

  /* -------------------- WIN + SCORE -------------------- */
  useEffect(() => {
    if (!isGameWon || isAutoSolving) return;

    setGameStatus("WON");
    const score = {
      user_id: "anonymous",
      player_name: playerName || "Anonymous",
      pegs: P,
      disks: N,
      user_moves: moveCount,
      target_moves: targetMoves,
      is_optimal: moveCount === targetMoves,
      time_taken_ms: Date.now() - startTime,
      solver_time_ms: solverTimeMs,
    };

    (async () => {
      try {
        setIsLoading(true);
        await postScore(score);
        await loadLeaderboardData();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isGameWon]);

  /* -------------------- RESET -------------------- */
  const resetGame = () => {
    setGameStatus("SETUP");
    setPegs([]);
    setN(DEFAULT_RANDOM_DISKS);
    setMoveCount(0);
    setSolutionMoves([]);
    setCurrentMoveIndex(0);
    setIsAutoSolving(false);
    setIsTimerActive(false);
    setUserMovesList([]);
    setOptimalMovesList([]);
    setGameState("setup");
  };

  /* -------------------- RENDER -------------------- */
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

      {/* Welcome Screen */}
      {gameState === "welcome" && (
        <div className="flex justify-center items-center min-h-[70vh] px-5 py-10">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-[30px] p-12 max-w-2xl w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)] border-2 border-pink-500/30 text-center animate-fadeInUp">
            <div className="flex justify-center mb-6">
              <div className="text-[120px] leading-none drop-shadow-[0_0_40px_rgba(236,72,153,0.6)] animate-bounce">
                🗼
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Tower of Hanoi Explorer
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed mb-10">
              Challenge yourself with multiple pegs, custom solvers, and a live
              leaderboard. Test your strategy while racing against sequential
              and threaded solver algorithms!
            </p>

            <div className="my-8">
              <label className="block text-xl font-semibold text-slate-200 mb-4">
                Enter Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError("");
                }}
                placeholder="Your name..."
                onKeyDown={(e) => e.key === "Enter" && handlePlayerNameSubmit()}
                autoFocus
                className="w-full px-6 py-4 border-3 border-pink-500/40 rounded-2xl bg-black/50 text-white text-xl text-center"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 my-4 text-red-300 font-semibold animate-shake">
                {error}
              </div>
            )}

            <button
              onClick={handlePlayerNameSubmit}
              disabled={!playerName.trim() || isLoading}
              className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold cursor-pointer mt-6"
            >
              {isLoading ? "⏳ Preparing Puzzle..." : "Start Challenge →"}
            </button>
          </div>
        </div>
      )}

      {/* Main Game */}
      {gameState !== "welcome" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Setup Panel */}
          <SetupPanel
            playerName={playerName}
            setPlayerName={setPlayerName}
            P={P}
            setP={setP}
            N={N}
            setN={setN}
            gameStatus={gameStatus}
            handleSetupGame={handleSetupGame}
            selectedAlgorithm3P={selectedAlgorithm3P}
            setSelectedAlgorithm3P={setSelectedAlgorithm3P}
            selectedAlgorithm4P={selectedAlgorithm4P}
            setSelectedAlgorithm4P={setSelectedAlgorithm4P}
            timeLimit={timeLimit}
            setTimeLimit={setTimeLimit}
          />
          {gameStatus === "GAMEOVER" && remainingTime === 0 && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
              <div className="bg-red-900/90 backdrop-blur-xl rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border-2 border-red-500/40 animate-fadeInUp">
                <h2 className="text-4xl font-bold text-red-400 mb-4">
                  ⏰ Time's Up!
                </h2>
                <p className="text-xl text-white mb-6">GAME OVER!</p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:scale-105 transform transition-transform duration-300"
                >
                  🔄 Restart Game
                </button>
              </div>
            </div>
          )}

          {/* Game Board & Status */}
          <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg mx-auto space-y-6">
            {/* Game Won */}
            {gameStatus === "WON" && (
              <div className="p-4 bg-green-900/60 rounded-2xl shadow-inner text-center space-y-3">
                {resultMessage && (
                  <div className="text-xl font-bold text-red-400">
                    {resultMessage}
                  </div>
                )}
                <p className="text-xl font-extrabold text-green-400 tracking-wide">
                  GAME WON!
                </p>
                <p className="text-sm text-green-200">
                  Score submitted to leaderboard.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:scale-105 transform transition-transform duration-300"
                  >
                    Start New Game
                  </button>
                </div>
              </div>
            )}

            {/* Timer */}
            {shouldShowTimer && remainingTime != null && (
              <div className="text-lg text-center font-semibold text-yellow-400 animate-pulse">
                Time Remaining: {Math.floor(remainingTime / 60)}:
                {String(remainingTime % 60).padStart(2, "0")}
                {isAutoSolving && " (Auto-solver)"}
              </div>
            )}
            {gameStatus === "PLAYING" && !isTimerActive && (
              <div className="text-lg font-semibold text-gray-500">
                Timer: Disabled (Iterative Mode)
              </div>
            )}

            {/* Game Info */}
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center">
              {gameStatus === "SETUP"
                ? "Ready to Start"
                : `Game: ${N} Disks, ${P} Pegs`}
            </h2>

            {/* Peg Display */}
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

            {/* Moves */}
            {["WON", "SOLVING", "PLAYING"].includes(gameStatus) && (
              <div className="p-4 bg-black/20 rounded-2xl overflow-auto max-h-64">
                <h3 className="text-lg font-bold text-yellow-300 mb-2 text-center">
                  Moves
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(isAutoSolving ? optimalMovesList : userMovesList).map(
                    (m, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-md bg-indigo-600/40 text-sm ${
                          isAutoSolving && i === currentMoveIndex
                            ? "bg-green-500/70"
                            : ""
                        }`}
                      >
                        ({m.from} → {m.to})
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Moves Card */}
            {gameStatus === "WON" && (
              <MovesCard
                userMoves={moveCount}
                optimalMoves={targetMoves}
                isOptimal={moveCount === targetMoves}
                mode="MANUAL"
              />
            )}

            {/* Status & Solver Panel */}
            {["PLAYING", "SOLVING"].includes(gameStatus) && (
              <StatusAndSolver
                N={N}
                P={P}
                moveCount={moveCount}
                optimalMoves={targetMoves}
                gameStatus={gameStatus}
                currentMoveIndex={currentMoveIndex}
                solutionMoves={solutionMoves}
                generateSolution={generateSolution}
                isAutoSolving={isAutoSolving}
                solverTimeMs={solverTimeMs}
              />
            )}
            {gameStatus === "WON" && solverTimeMs != null && (
              <div className="text-sm text-cyan-400 text-center mt-2">
                Solver Execution Time: {solverTimeMs.toFixed(2)} ms
              </div>
            )}
            {/* Reset Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:scale-105 transform transition-transform duration-300"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard
            leaderboard={leaderboard}
            isLoading={isLoading}
            apiError={apiError}
          />
        </div>
      )}
    </div>
  );
};
export default Page;
