"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";

import SetupPanel from "../../components/hanoi/SetupPanel";
import StatusAndSolver from "../../components/hanoi/StatusAndSolver";
import PegsDisplay from "../../components/hanoi/PegsDisplay";
import Leaderboard from "../../components/hanoi/Leaderboard";

import {
  initializePegs,
  isMoveValid,
  minMoves3Pegs,
  minMoves4Pegs,
  solveHanoi3PegsRecursive,
  solveHanoi4PegsFrameStewart,
  fetchLeaderboard,
  postScore,
  MAX_DISKS,
  MIN_DISKS,
} from "../../components/hanoi/hanoi-utils.js";

const page = () => {
  const [N, setN] = useState(MIN_DISKS);
  const [P, setP] = useState(3);
  const [pegs, setPegs] = useState([]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameStatus, setGameStatus] = useState("SETUP");
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const [selectedAlgorithm3P, setSelectedAlgorithm3P] = useState(null);
  const [selectedAlgorithm4P, setSelectedAlgorithm4P] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [solutionMoves, setSolutionMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAutoSolving, setIsAutoSolving] = useState(false);

  const optimalMoves = P === 3 ? minMoves3Pegs(N) : minMoves4Pegs(N);

  const isGameWon = useMemo(() => {
    if (N === 0 || pegs.length === 0) return false;
    return pegs[P - 1] && pegs[P - 1].length === N;
  }, [pegs, N, P]);

  // --- Load Leaderboard ---
  const loadLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const scores = await fetchLeaderboard();
      setLeaderboard(scores.slice(0, 10)); // Show top 10
      if (scores.length === 0) setApiError("No scores found.");
    } catch (error) {
      setApiError("Failed to load leaderboard.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // --- Setup Game ---
  const handleSetupGame = useCallback((N_disks, P_pegs) => {
    const initialPegs = initializePegs(N_disks, P_pegs);
    setN(N_disks);
    setP(P_pegs);
    setPegs(initialPegs);
    setSelectedPeg(null);
    setMoveCount(0);
    setStartTime(Date.now());
    setGameStatus("PLAYING");
    setSolutionMoves([]);
    setCurrentMoveIndex(0);
    setIsAutoSolving(false);
    setApiError(null);
  }, []);

  // --- Handle Peg Click ---
  const handlePegClick = useCallback(
    (pegIndex) => {
      if (gameStatus !== "PLAYING" || isAutoSolving) return;

      if (selectedPeg === null) {
        if (pegs[pegIndex].length > 0) setSelectedPeg(pegIndex);
      } else {
        const sourceIndex = selectedPeg;
        const destIndex = pegIndex;
        if (sourceIndex === destIndex) {
          setSelectedPeg(null);
          return;
        }
        if (isMoveValid(pegs, sourceIndex, destIndex)) {
          setPegs((prev) => {
            const newPegs = prev.map((peg) => [...peg]);
            const disk = newPegs[sourceIndex].pop();
            newPegs[destIndex].push(disk);
            return newPegs;
          });
          setMoveCount((c) => c + 1);
        }
        setSelectedPeg(null);
      }
    },
    [pegs, selectedPeg, gameStatus, isAutoSolving]
  );

  // --- Auto Solve ---
  const generateSolution = useCallback(() => {
    if (N === 0 || gameStatus !== "PLAYING") return;

    setGameStatus("SOLVING");
    setMoveCount(0);
    setCurrentMoveIndex(0);

    const moves = [];
    const initialPegs = initializePegs(N, P);
    setPegs(initialPegs);

    if (P === 3) solveHanoi3PegsRecursive(N, 0, P - 1, 1, moves);
    else solveHanoi4PegsFrameStewart(N, 0, P - 1, [1, 2], moves);

    setSolutionMoves(moves);
    setIsAutoSolving(true);
  }, [N, P, gameStatus]);

  useEffect(() => {
    if (!isAutoSolving || currentMoveIndex >= solutionMoves.length) {
      if (isAutoSolving) {
        setIsAutoSolving(false);
        setGameStatus("WON");
      }
      return;
    }
    const timer = setTimeout(() => {
      const { from, to } = solutionMoves[currentMoveIndex];
      setPegs((prev) => {
        const newPegs = prev.map((peg) => [...peg]);
        if (newPegs[from].length > 0) newPegs[to].push(newPegs[from].pop());
        return newPegs;
      });
      setMoveCount((c) => c + 1);
      setCurrentMoveIndex((c) => c + 1);
    }, 200);
    return () => clearTimeout(timer);
  }, [isAutoSolving, currentMoveIndex, solutionMoves]);

  // --- Post Score & Refresh Leaderboard Automatically ---
  useEffect(() => {
    if (!isGameWon || gameStatus !== "PLAYING") return;

    setGameStatus("WON");
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

    const postAndRefresh = async () => {
      try {
        setIsLoading(true);
        await postScore(scoreData); // Post the latest score
        await loadLeaderboardData(); // Refresh leaderboard automatically
      } catch (error) {
        setApiError("Failed to update leaderboard.");
      } finally {
        setIsLoading(false);
      }
    };

    postAndRefresh();
  }, [isGameWon, gameStatus]);

  return (
 <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-10 font-sans">
  <header className="text-center mb-10">
    <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-2">
      Tower of Hanoi Explorer
    </h1>
    <p className="text-xl text-gray-400">
      Solve the classic puzzle with a custom solver and leaderboard.
    </p>
  </header>

  {/* 3 Column Layout */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 max-w-7xl mx-auto">
    {/* --- Left Column: Setup Panel --- */}
    <div className="space-y-8">
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
      />
    </div>

    {/* --- Middle Column: Game / Pegs Display --- */}
    <div className="p-4 bg-gray-800 rounded-2xl shadow-2xl flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-100 text-center w-full">
        {gameStatus === "SETUP"
          ? "Ready to Start"
          : `Game: ${N} Disks, ${P} Pegs`}
      </h2>

      {N > 0 && pegs.length > 0 ? (
        <PegsDisplay
          pegs={pegs}
          P={P}
          N={N}
          gameStatus={gameStatus}
          selectedPeg={selectedPeg}
          handlePegClick={handlePegClick}
          isAutoSolving={isAutoSolving}
        />
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-700 rounded-xl border-2 border-dashed border-gray-600 w-full">
          <p className="text-gray-400 text-lg text-center">
            Use the panel on the left to set the game parameters (N disks, P pegs) and start a new game.
          </p>
        </div>
      )}

      {["PLAYING", "SOLVING"].includes(gameStatus) && (
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

    {/* --- Right Column: Leaderboard --- */}
    <div className="space-y-8">
      <Leaderboard
        leaderboard={leaderboard}
        isLoading={isLoading}
        apiError={apiError}
      />
    </div>
  </div>

  {/* --- Game Won Modal --- */}
  {gameStatus === "WON" && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl text-center max-w-lg w-full">
        <h3 className="text-4xl font-extrabold mb-4 text-indigo-400">
          {isAutoSolving ? "Solved by Algorithm!" : "Congratulations! You Solved It!"}
        </h3>
        <p className="text-xl text-gray-100 mb-6">
          Total Moves:{" "}
          <span className={`font-bold ${moveCount === optimalMoves ? "text-green-500" : "text-red-500"}`}>
            {moveCount}
          </span>{" "}
          ( Optimal: <span className="font-bold text-green-500">{optimalMoves}</span> )
        </p>
        {moveCount === optimalMoves ? (
          <p className="text-lg text-green-500 font-semibold mb-6">
            You achieved the minimum number of moves!
          </p>
        ) : (
          <p className="text-lg text-red-500 font-semibold mb-6">
            You used {moveCount - optimalMoves} extra moves.
          </p>
        )}
        <button
          onClick={() => {
            setGameStatus("SETUP");
            setPegs([]);
            setN(MIN_DISKS);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition duration-150 shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default page;
