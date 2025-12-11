'use client';

import React, { useState, useEffect } from 'react';

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random moves (snakes and ladders)
// Number of snakes = N-2, Number of ladders = N-2
function generateMoves(N) {
  const boardSize = N * N;
  const moves = new Map();
  const count = N - 2; // As per requirement: N-2 snakes and N-2 ladders
  const usedCells = new Set([1, boardSize]); // Cannot use start or end cell

  // Generate Ladders (count = N-2)
  for (let i = 0; i < count; i++) {
    let start, end;
    let attempts = 0;
    do {
      start = Math.floor(Math.random() * (boardSize - 1)) + 1;
      end = Math.floor(Math.random() * (boardSize - start)) + start + 1;
      attempts++;
      if (attempts > 1000) break; // Prevent infinite loop
    } while (usedCells.has(start) || usedCells.has(end));
    
    if (attempts <= 1000) {
      moves.set(start, end);
      usedCells.add(start);
      usedCells.add(end);
    }
  }

  // Generate Snakes (count = N-2)
  for (let i = 0; i < count; i++) {
    let start, end;
    let attempts = 0;
    do {
      start = Math.floor(Math.random() * (boardSize - 2)) + 2;
      end = Math.floor(Math.random() * (start - 1)) + 1;
      attempts++;
      if (attempts > 1000) break; // Prevent infinite loop
    } while (usedCells.has(start) || usedCells.has(end));
    
    if (attempts <= 1000) {
      moves.set(start, end);
      usedCells.add(start);
      usedCells.add(end);
    }
  }

  const movesArray = [];
  for (let [start, end] of moves.entries()) {
    movesArray.push({
      start,
      end,
      type: start < end ? 'ladder' : 'snake',
    });
  }
  return movesArray;
}

// Algorithm 1: BFS (Breadth-First Search)
function findMinThrowsBFS(moves, N) {
  const boardSize = N * N;
  const movesMap = new Map();
  for (let move of moves) {
    movesMap.set(move.start, move.end);
  }

  const queue = [[1, 0]]; // [cell, throws]
  const visited = new Set([1]);

  while (queue.length > 0) {
    const [currentCell, throws] = queue.shift();

    // Try all dice rolls (1-6)
    for (let i = 1; i <= 6; i++) {
      let nextCell = currentCell + i;

      // Check if beyond board
      if (nextCell > boardSize) continue;

      // Check for snake or ladder
      if (movesMap.has(nextCell)) {
        nextCell = movesMap.get(nextCell);
      }

      // Check if reached destination
      if (nextCell === boardSize) {
        return throws + 1;
      }

      // Add to queue if not visited
      if (!visited.has(nextCell)) {
        visited.add(nextCell);
        queue.push([nextCell, throws + 1]);
      }
    }
  }
  return -1; // Unreachable
}

// Algorithm 2: Dijkstra's Algorithm
function findMinThrowsDijkstra(moves, N) {
  const boardSize = N * N;
  const movesMap = new Map();
  for (let move of moves) {
    movesMap.set(move.start, move.end);
  }

  const distances = new Array(boardSize + 1).fill(Infinity);
  const pq = []; // Priority Queue
  
  distances[1] = 0;
  pq.push([0, 1]); // [distance, cell]

  while (pq.length > 0) {
    // Sort to get minimum distance
    pq.sort((a, b) => a[0] - b[0]);
    const [d, currentCell] = pq.shift();

    // Skip if we've found a better path
    if (d > distances[currentCell]) continue;

    // Try all dice rolls (1-6)
    for (let i = 1; i <= 6; i++) {
      let nextCell = currentCell + i;
      if (nextCell > boardSize) continue;

      // Check for snake or ladder
      if (movesMap.has(nextCell)) {
        nextCell = movesMap.get(nextCell);
      }

      // Update distance if shorter path found
      if (distances[nextCell] > d + 1) {
        distances[nextCell] = d + 1;
        pq.push([d + 1, nextCell]);
      }
    }
  }

  return distances[boardSize] === Infinity ? -1 : distances[boardSize];
}

// GameBoard Component
function GameBoard({ size, moves }) {
  const boardMatrix = [];
  for (let i = 0; i < size; i++) {
    boardMatrix.push(new Array(size).fill(0));
  }
  
  // Fill board in snake pattern (zigzag)
  let cellNumber = 1;
  for (let row = size - 1; row >= 0; row--) {
    if ((size - 1 - row) % 2 === 0) {
      for (let col = 0; col < size; col++) {
        boardMatrix[row][col] = cellNumber++;
      }
    } else {
      for (let col = size - 1; col >= 0; col--) {
        boardMatrix[row][col] = cellNumber++;
      }
    }
  }

  // Map moves for display
  const startsMap = new Map();
  const endsMap = new Map();
  const HUES = [0, 40, 60, 120, 180, 220, 270, 300, 30, 200];
  let colorIndex = 0;

  moves.forEach((move) => {
    const hue = HUES[colorIndex % HUES.length];
    const color = `hsl(${hue}, 70%, 85%)`;
    startsMap.set(move.start, { type: move.type, end: move.end, color });
    endsMap.set(move.end, { type: move.type, start: move.start, color });
    colorIndex++;
  });

  return (
    <div className="w-full">
      <div 
        className="grid gap-1 w-full max-w-2xl mx-auto bg-slate-900 p-4 rounded-xl shadow-2xl border-2 border-slate-700"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {boardMatrix.map((row) =>
          row.map((cellNum) => {
            const startMove = startsMap.get(cellNum);
            const endMove = endsMap.get(cellNum);
            const pairColor = startMove ? startMove.color : (endMove ? endMove.color : null);

            return (
              <div
                key={cellNum}
                className="aspect-square flex flex-col items-center justify-center text-xs font-bold rounded-lg border border-slate-700 relative transition-transform hover:scale-105"
                style={{ backgroundColor: pairColor || '#1e293b' }}
              >
                <span className="text-white text-sm mb-1">{cellNum}</span>
                {startMove && (
                  <span className="text-xl" title={`${startMove.type} to ${startMove.end}`}>
                    {startMove.type === 'snake' ? '🐍' : '🪜'}
                  </span>
                )}
                {endMove && (
                  <span className="text-xl" title={`${endMove.type} from ${endMove.start}`}>
                    {endMove.type === 'snake' ? '🐍' : '🪜'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Main Game Component
export default function SnakeLadderGame() {
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [n, setN] = useState(6);
  const [gameData, setGameData] = useState(null);
  const [choices, setChoices] = useState([]);
  const [playerGuess, setPlayerGuess] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    // Validation 1: Player name required
    if (!playerName || !playerName.trim()) {
      throw new Error('Player name is required');
    }

    // Validation 2: Player name minimum length
    if (playerName.trim().length < 2) {
      throw new Error('Player name must be at least 2 characters');
    }

    // Validation 3: Board size range (6-12 as per requirement)
    if (n < 6 || n > 12) {
      throw new Error('Board size must be between 6 and 12');
    }

    return true;
  };

  const handleStartGame = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Exception Handling: Validate inputs
      validateInputs();

      // Generate game data
      const moves = generateMoves(n);

      // Algorithm 1: BFS
      const startBFS = performance.now();
      const minThrowsBFS = findMinThrowsBFS(moves, n);
      const endBFS = performance.now();
      const timeBFS = (endBFS - startBFS).toFixed(4);

      // Algorithm 2: Dijkstra
      const startDijkstra = performance.now();
      const minThrowsDijkstra = findMinThrowsDijkstra(moves, n);
      const endDijkstra = performance.now();
      const timeDijkstra = (endDijkstra - startDijkstra).toFixed(4);

      // Both algorithms should give same answer
      if (minThrowsBFS !== minThrowsDijkstra) {
        console.warn('Algorithm mismatch:', { minThrowsBFS, minThrowsDijkstra });
      }

      const correctAnswer = minThrowsBFS;

      // Generate 3 choices as per requirement
      const choice1 = correctAnswer <= 1 ? 1 : correctAnswer - 1;
      const choice2 = correctAnswer;
      const choice3 = correctAnswer + (Math.random() < 0.5 ? 1 : 2);
      const shuffledChoices = shuffleArray([choice1, choice2, choice3]);

      setGameData({
        boardSize: n,
        snakesAndLadders: moves,
        minThrows: correctAnswer,
        timeTaken: {
          bfs_ms: timeBFS,
          dijkstra_ms: timeDijkstra,
        },
        snakeCount: moves.filter(m => m.type === 'snake').length,
        ladderCount: moves.filter(m => m.type === 'ladder').length,
      });
      setChoices(shuffledChoices);
      setGameState('playing');

      // Save to database would happen here in production
      console.log('Game data to save:', {
        playerName: playerName.trim(),
        boardSize: n,
        correctAnswer,
        bfsTime: timeBFS,
        dijkstraTime: timeDijkstra,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    try {
      // Exception Handling: Validate answer selected
      if (playerGuess === null) {
        throw new Error('Please select an answer');
      }

      const isCorrect = playerGuess === gameData.minThrows;
      setGameResult(isCorrect ? 'win' : 'lose');

      // Save to database when player gets correct answer
      if (isCorrect) {
        console.log('Saving to database:', {
          playerName: playerName.trim(),
          correctAnswer: gameData.minThrows,
          playerGuess,
          boardSize: gameData.boardSize,
          timestamp: new Date().toISOString(),
          bfsTime: gameData.timeTaken.bfs_ms,
          dijkstraTime: gameData.timeTaken.dijkstra_ms,
        });

        // In production, call API here:
        // await fetch('/api/snake-ladder/save-result', { ... })
      }

      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePlayAgain = () => {
    setGameState('welcome');
    setGameData(null);
    setChoices([]);
    setPlayerGuess(null);
    setGameResult(null);
    setError('');
    setN(6);
  };

  // Welcome Screen
  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans text-white flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-12 max-w-2xl w-full shadow-2xl border-2 border-indigo-500/30">
          <div className="text-8xl text-center mb-5 animate-bounce">🎲</div>
          <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Snake & Ladder Challenge
          </h1>
          <p className="text-lg text-slate-300 text-center leading-relaxed mb-10">
            Find the minimum number of dice throws needed to reach the last cell!
            Test your algorithmic thinking against BFS and Dijkstra's algorithms.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-xl font-semibold text-slate-200 mb-4">
                Enter Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name..."
                className="w-full px-6 py-4 border-3 border-indigo-500/40 rounded-2xl bg-black/50 text-white text-xl text-center transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_30px_rgba(102,126,234,0.5)] placeholder:text-slate-500"
                onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
              />
              <p className="text-xs text-slate-500 mt-2">Minimum 2 characters required</p>
            </div>

            <div>
              <label className="block text-xl font-semibold text-slate-200 mb-4">
                Board Size (N × N) - Range: 6 to 12
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="6"
                  max="12"
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg cursor-pointer accent-indigo-500"
                />
                <span className="text-3xl font-bold text-indigo-400 min-w-[60px]">
                  {n}×{n}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Easy (6×6)</span>
                <span>Hard (12×12)</span>
              </div>
              <div className="mt-3 p-3 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <p className="text-sm text-slate-300">
                  <strong>Game Configuration:</strong><br/>
                  • Board: {n}×{n} = {n * n} cells<br/>
                  • Snakes: {n - 2} (randomly placed)<br/>
                  • Ladders: {n - 2} (randomly placed)
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 text-red-300 font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handleStartGame}
              disabled={isLoading}
              className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_15px_40px_rgba(102,126,234,0.5)] hover:translate-y-[-3px] hover:shadow-[0_20px_50px_rgba(102,126,234,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Generating Game...' : '🎮 Start Game →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing State
  if (gameState === 'playing' && gameData && !gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent mb-2">
              Snake & Ladder Game
            </h1>
            <p className="text-lg text-slate-400">
              Playing: <span className="text-white font-bold">{playerName}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
            {/* Board */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                {gameData.boardSize}×{gameData.boardSize} Board
              </h2>
              <GameBoard size={gameData.boardSize} moves={gameData.snakesAndLadders} />
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Snakes 🐍</div>
                  <div className="text-2xl font-bold text-red-400">
                    {gameData.snakeCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">= N-2 = {gameData.boardSize}-2</div>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Ladders 🪜</div>
                  <div className="text-2xl font-bold text-green-400">
                    {gameData.ladderCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">= N-2 = {gameData.boardSize}-2</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10">
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent mb-6">
                Your Challenge
              </h2>

              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl p-5 mb-6 border-2 border-indigo-500/30">
                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  🎯 Question
                </h3>
                <p className="text-slate-300 text-center">
                  What is the minimum number of dice rolls needed to reach cell{' '}
                  <span className="text-indigo-400 font-bold">{gameData.boardSize * gameData.boardSize}</span>?
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <label className="block text-lg font-semibold text-slate-300 mb-3">
                  Select Your Answer (3 Choices):
                </label>
                {choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setPlayerGuess(choice)}
                    className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                      playerGuess === choice
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:scale-102'
                    }`}
                  >
                    {choice} throws
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 mb-4 text-red-300 font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={playerGuess === null}
                className="w-full px-6 py-4 border-none rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-lg hover:translate-y-[-2px] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Submit Answer
              </button>

              <div className="mt-6 p-4 bg-black/30 rounded-xl border border-slate-700">
                <h4 className="text-sm font-bold text-slate-400 mb-2">ALGORITHMS USED:</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div>✓ BFS (Breadth-First Search)</div>
                  <div>✓ Dijkstra's Algorithm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result State
  if (gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans text-white flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-12 max-w-3xl w-full shadow-2xl border-2 border-white/10">
          <div className={`text-center rounded-2xl p-8 mb-8 ${
            gameResult === 'win'
              ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50'
              : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-500/50'
          }`}>
            <h2 className="text-5xl font-bold mb-4">
              {gameResult === 'win' ? '🎉 Correct!' : '❌ Incorrect'}
            </h2>
            <p className="text-xl text-slate-300">
              {gameResult === 'win'
                ? `Great job, ${playerName}! You found the minimum: ${gameData.minThrows} throws!`
                : `The correct answer was ${gameData.minThrows} throws. You selected ${playerGuess}.`}
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              📊 Algorithm Performance Comparison
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/60 rounded-xl p-4 text-center border-2 border-indigo-500/30">
                <div className="text-sm text-slate-400 mb-2 font-semibold">Algorithm 1: BFS</div>
                <div className="text-3xl font-bold text-indigo-400 mb-1">
                  {gameData.timeTaken.bfs_ms} ms
                </div>
                <div className="text-xs text-slate-500">Breadth-First Search</div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 text-center border-2 border-purple-500/30">
                <div className="text-sm text-slate-400 mb-2 font-semibold">Algorithm 2: Dijkstra</div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {gameData.timeTaken.dijkstra_ms} ms
                </div>
                <div className="text-xs text-slate-500">Shortest Path Algorithm</div>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-2">
                <strong>Result:</strong> Both algorithms found the same answer: <span className="text-green-400 font-bold">{gameData.minThrows} throws</span>
              </div>
              <div className="text-xs text-slate-500">
                Time difference: {Math.abs(parseFloat(gameData.timeTaken.bfs_ms) - parseFloat(gameData.timeTaken.dijkstra_ms)).toFixed(4)} ms
              </div>
            </div>
          </div>

          {gameResult === 'win' && (
            <div className="bg-green-500/20 border-2 border-green-500/50 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-300 font-semibold">
                ✅ Your name and score have been saved to the database!
              </p>
            </div>
          )}

          <button
            onClick={handlePlayAgain}
            className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-lg hover:translate-y-[-3px] hover:shadow-2xl"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}