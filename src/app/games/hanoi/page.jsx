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
    () =>
      gameStatus === "PLAYING" &&
      !isAutoSolving &&
      isStrictAlgorithmMode &&
      isTimerActive,
    [gameStatus, isAutoSolving, isStrictAlgorithmMode, isTimerActive]
  );

  const targetMoves = useMemo(() => {
    if (solutionMoves.length > 0) return solutionMoves.length;
    return P === 3 ? minMoves3Pegs(N) : minMoves4Pegs(N);
  }, [solutionMoves, N, P]);

  const isGameWon = useMemo(
    () => pegs[P - 1]?.length === N && N > 0,
    [pegs, N, P]
  );

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

      if (isStrictAlgorithmMode) {
        const nextOptimalMove = solutionMoves[currentMoveIndex];
        if (
          !nextOptimalMove ||
          nextOptimalMove.from !== from ||
          nextOptimalMove.to !== to
        ) {
          setMoveError(
            "⚠️ This move is not optimal for the selected algorithm."
          );
          return;
        }
        setCurrentMoveIndex((i) => i + 1);
      }

      setMoveError(null);
      setPegs((prev) => {
        const copy = prev.map((p) => [...p]);
        copy[to].push(copy[from].pop());
        return copy;
      });
      setMoveCount((c) => c + 1);
    },
    [
      pegs,
      selectedPeg,
      gameStatus,
      isAutoSolving,
      solutionMoves,
      currentMoveIndex,
      isStrictAlgorithmMode,
    ]
  );

  /* -------------------- SETUP GAME -------------------- */
  const handleSetupGame = (n, p, limit) => {
    const moves = [];
    const strict =
      (p === 3 && selectedAlgorithm3P === ALGORITHM_OPTIONS_3P.RECURSIVE) ||
      (p === 4 && selectedAlgorithm4P === ALGORITHM_OPTIONS_4P.FRAME_STEWART);

    if (p === 3) {
      strict
        ? solveHanoi3PegsRecursive(n, 0, p - 1, 1, moves)
        : solveHanoi3PegsIterative(n, 0, p - 1, 1, moves);
    } else {
      strict
        ? solveHanoi4PegsFrameStewart(n, 0, p - 1, [1, 2], moves)
        : solveHanoi4PegsIterative(n, 0, p - 1, [1, 2], moves);
    }

    setN(n);
    setP(p);
    setPegs(initializePegs(n, p));
    setMoveCount(0);
    setSolutionMoves(moves);
    setCurrentMoveIndex(0);
    setSelectedPeg(null);
    setMoveError(null);
    setIsAutoSolving(false);

    if (strict) {
      setIsTimerActive(true);
      setRemainingTime(limit * 60);
    } else {
      setIsTimerActive(false);
      setRemainingTime(null);
    }

    setGameStatus("PLAYING");
    setStartTime(Date.now());
  };

  /* -------------------- AUTO SOLVE -------------------- */
  const generateSolution = () => {
    if (solutionMoves.length === 0) return;
    setPegs(initializePegs(N, P));
    setMoveCount(0);
    setCurrentMoveIndex(0);
    setSelectedPeg(null);
    setMoveError(null);
    setIsAutoSolving(true);
    setGameStatus("SOLVING");
    setRemainingTime(null);
    setIsTimerActive(false);
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

      {/* Welcome */}
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
                className="w-full px-6 py-4 border-3 border-pink-500/40 rounded-2xl bg-black/50 text-white text-xl text-center"
                onKeyDown={(e) => e.key === "Enter" && handlePlayerNameSubmit()}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 my-4 text-red-300 font-semibold animate-shake">
                {error}
              </div>
            )}

            <button
              onClick={handlePlayerNameSubmit}
              className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold cursor-pointer mt-6"
              disabled={!playerName.trim() || isLoading}
            >
              {isLoading ? "⏳ Preparing Puzzle..." : "Start Challenge →"}
            </button>
          </div>
        </div>
      )}

      {/* Main Game */}
      {gameState !== "welcome" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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

            <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg mx-auto space-y-6">
              {shouldShowTimer && remainingTime != null && (
                <div className="text-lg font-semibold text-yellow-400 animate-pulse">
                  Time Remaining: {Math.floor(remainingTime / 60)}:
                  {String(remainingTime % 60).padStart(2, "0")}
                </div>
              )}
              {gameStatus === "PLAYING" && !isTimerActive && (
                <div className="text-lg font-semibold text-gray-500">
                  Timer: Disabled (Iterative Mode)
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
                  optimalMoves={targetMoves}
                  gameStatus={gameStatus}
                  currentMoveIndex={currentMoveIndex}
                  solutionMoves={solutionMoves}
                  generateSolution={generateSolution}
                  isAutoSolving={isAutoSolving}
                />
              )}

              {/* Restart / New Game Button */}
              {gameState !== "welcome" && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:scale-105 transform transition-transform duration-300"
                  >
                    🔄 Restart / New Game
                  </button>
                </div>
              )}
              
            </div>

            <Leaderboard
              leaderboard={leaderboard}
              isLoading={isLoading}
              apiError={apiError}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
