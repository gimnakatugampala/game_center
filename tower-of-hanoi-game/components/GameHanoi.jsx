"use client";

import React, { useState, useEffect } from "react";
import TowerVisual from "./TowerVisual";
import { hanoi3_recursive } from "../lib/algorithms/hanoi3";
import { hanoi4_frame_stewart } from "../lib/algorithms/hanoi4";

export default function GameHanoi() {
  const [player, setPlayer] = useState("");
  const [pegsCount, setPegsCount] = useState(3);
  const [disksCount, setDisksCount] = useState(5);
  const [started, setStarted] = useState(false);
  const [solution, setSolution] = useState([]);
  const [moves, setMoves] = useState([]);
  const [movesCount, setMovesCount] = useState(0);
  const [gameStatus, setGameStatus] = useState("");
  const [userMovesInput, setUserMovesInput] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Timer
  useEffect(() => {
    let timer;
    if (started && !gameStatus) {
      timer = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(newElapsed);
        if (timeLimit && newElapsed >= timeLimit) setGameStatus("failed");
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, startTime, gameStatus, timeLimit]);

  const startGame = () => {
    if (!player.trim()) return;

    let sol = [];
    if (pegsCount === 3) {
      sol = hanoi3_recursive(disksCount, "A", "C", "B");
    } else {
      sol = hanoi4_frame_stewart(disksCount, "A", "D", "B", "C");
    }

    setSolution(sol);
    setMoves([]);
    setMovesCount(0);
    setGameStatus("");
    setStartTime(Date.now());
    setElapsed(0);
    setStarted(true);
    setUserMovesInput("");
  };

  const handleMovesChange = (count, arr) => {
    setMovesCount(count);
    setMoves(arr);

    const sequenceString = arr.map((m) => `${m.from}->${m.to}`).join(",");
    setUserMovesInput(sequenceString);

    if (!solution.length) return;

    if (arr.length === solution.length) {
      const solved = arr.every(
        (mv, i) => mv.from === solution[i].from && mv.to === solution[i].to
      );
      const elapsedMs = Date.now() - startTime;

      if (solved) {
        setGameStatus("success");
        setElapsed(Math.floor(elapsedMs / 1000));
      } else {
        setGameStatus("failed");
      }
    }
  };

  const resetGame = () => {
    setStarted(false);
    setMoves([]);
    setMovesCount(0);
    setElapsed(0);
    setGameStatus("");
    setPlayer("");
    setDisksCount(5 + Math.floor(Math.random() * 6));
    setUserMovesInput("");
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {!started && (
        <div className="bg-white p-5 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Tower of Hanoi Setup</h2>
          <input
            placeholder="Player Name"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <label>Number of Pegs</label>
          <select
            value={pegsCount}
            onChange={(e) => setPegsCount(parseInt(e.target.value))}
            className="border p-2 mb-2 w-full"
          >
            <option value={3}>3 Pegs</option>
            <option value={4}>4 Pegs</option>
          </select>
          <label>Time Limit (seconds)</label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            className="border p-2 mb-2 w-full"
          />
          <p>Number of Disks (random for round): {disksCount}</p>
          <button
            disabled={!player.trim()}
            onClick={startGame}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start Game
          </button>
        </div>
      )}

      {started && (
        <div>
          <div className="flex justify-between mb-2">
            <p>
              Player: {player} | Pegs: {pegsCount} | Disks: {disksCount}
            </p>
            <p>
              Time: {elapsed}s / {timeLimit}s
            </p>
          </div>

          <TowerVisual
            disks={disksCount}
            pegsCount={pegsCount}
            onMovesChange={handleMovesChange}
          />

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p>Number of Moves: {movesCount}</p>
            <label>Sequence of Moves (auto-filled):</label>
            <textarea
              value={userMovesInput}
              readOnly
              className="border p-2 w-full h-24"
            />
          </div>

          <button
            onClick={resetGame}
            className="mt-2 bg-gray-700 text-white px-3 py-1 rounded"
          >
            Restart
          </button>

          {gameStatus && (
            <div className="mt-2 font-bold">
              {gameStatus === "success" ? (
                <p className="text-green-600">🎉 Correct! You solved it!</p>
              ) : (
                <>
                  <p className="text-red-600">❌ Failed!</p>
                  <p className="mt-2 font-normal">
                    Correct solution:
                    {solution && solution.length > 0 && (
                      <p className="mt-2 font-normal">
                        Correct solution:
                        {solution.map((m, i) => (
                          <span key={i}>
                            {m.from} &rarr; {m.to}
                            {i < solution.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
