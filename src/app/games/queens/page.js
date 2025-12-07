// src/app/games/queens/page.js
'use client';

import React, { Component } from 'react';
import ChessBoard from '../../components/queens/ChessBoard';

class EightQueensGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: 'welcome',
      playerName: '',
      allSolutions: [],
      foundSolutions: new Set(),
      playerSolution: [],
      sequentialTime: 0,
      threadedTime: 0,
      sequentialComplete: false,
      threadedComplete: false,
      totalSolutions: 0,
      error: '',
      isLoading: false,
      showSolution: false,
      result: null,
      gameStartTime: null,
      sessionId: null,
      solvingProgress: 0,
      sessionId: null,  
    };
  }

  componentDidMount() {
    // Solutions will be computed when game starts
  }

  // Algorithm 1: Sequential Backtracking
  solveSequential = () => {
    const startTime = performance.now();
    const solutions = [];
    const board = Array(8).fill(-1);

    const isSafe = (board, row, col) => {
      for (let i = 0; i < row; i++) {
        if (board[i] === col || 
            Math.abs(board[i] - col) === Math.abs(i - row)) {
          return false;
        }
      }
      return true;
    };

    const solve = (row) => {
      if (row === 8) {
        solutions.push([...board]);
        return;
      }

      for (let col = 0; col < 8; col++) {
        if (isSafe(board, row, col)) {
          board[row] = col;
          solve(row + 1);
          board[row] = -1;
        }
      }
    };

    solve(0);
    const endTime = performance.now();

    return {
      solutions,
      time: (endTime - startTime).toFixed(4),
      count: solutions.length
    };
  };

  // Algorithm 2: Threaded Solution (Simulated with Web Workers concept)
  solveThreaded = async () => {
    const startTime = performance.now();
    const solutions = [];
    
    // Simulate parallel processing by dividing work
    const solvePartial = (startCol) => {
      const partialSolutions = [];
      const board = Array(8).fill(-1);
      board[0] = startCol;

      const isSafe = (board, row, col) => {
        for (let i = 0; i < row; i++) {
          if (board[i] === col || 
              Math.abs(board[i] - col) === Math.abs(i - row)) {
            return false;
          }
        }
        return true;
      };

      const solve = (row) => {
        if (row === 8) {
          partialSolutions.push([...board]);
          return;
        }

        for (let col = 0; col < 8; col++) {
          if (isSafe(board, row, col)) {
            board[row] = col;
            solve(row + 1);
            board[row] = -1;
          }
        }
      };

      solve(1);
      return partialSolutions;
    };

    // Divide work across first row positions (simulating threads)
    const promises = [];
    for (let col = 0; col < 8; col++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => resolve(solvePartial(col)), 0);
        })
      );
    }

    const results = await Promise.all(promises);
    results.forEach(result => solutions.push(...result));

    const endTime = performance.now();

    return {
      solutions,
      time: (endTime - startTime).toFixed(4),
      count: solutions.length
    };
  };

  handlePlayerNameSubmit = () => {
    const { playerName } = this.state;
    
    if (!playerName.trim()) {
      this.setState({ error: 'Please enter your name to start the game' });
      return;
    }

    if (playerName.trim().length < 2) {
      this.setState({ error: 'Name must be at least 2 characters' });
      return;
    }

    this.startGame();
  };

  startGame = async () => {
    this.setState({ 
       isLoading: true, 
    error: '',
    gameState: 'computing',
    gameStartTime: new Date().toISOString()
    });

    try {
    // Save player
    const playerResponse = await fetch('/api/queens/save-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: this.state.playerName.trim()
      })
    });
    
    const playerData = await playerResponse.json();
    console.log('Player saved:', playerData);

    // Compute solutions with both methods
    console.log('Computing sequential solutions...');
    const seqResult = this.solveSequential();
    
    this.setState({ 
      sequentialTime: seqResult.time,
      sequentialComplete: true,
      solvingProgress: 50
    });

    console.log('Computing threaded solutions...');
    const threadResult = await this.solveThreaded();
    
    this.setState({
      threadedTime: threadResult.time,
      threadedComplete: true,
      allSolutions: seqResult.solutions,
      totalSolutions: seqResult.count,
      solvingProgress: 100,
      isLoading: false,
      gameState: 'playing'
    });

    // Save computation results to database and get sessionId
    const computationResponse = await fetch('/api/queens/save-computation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: this.state.playerName,
        sequentialTime: seqResult.time,
        threadedTime: threadResult.time,
        solutionsCount: seqResult.count
      })
    });

    const computationData = await computationResponse.json();
    console.log('Computation saved:', computationData);
    
    // IMPORTANT: Store sessionId for later use
    if (computationData.success) {
      this.setState({ sessionId: computationData.sessionId });
    }

  } catch (err) {
    console.error('Error computing solutions:', err);
    this.setState({ 
      error: 'Failed to compute solutions: ' + err.message,
      isLoading: false,
      gameState: 'welcome'
    });
  }
};

  handleSquareClick = (row, col) => {
    const { playerSolution } = this.state;
    
    // Check if this row already has a queen
    const existingQueen = playerSolution.find(pos => pos.row === row);
    
    if (existingQueen) {
      // Remove queen from this row
      this.setState({
        playerSolution: playerSolution.filter(pos => pos.row !== row),
        error: ''
      });
    } else {
      // Add queen to this position
      if (playerSolution.length >= 8) {
        this.setState({ error: 'Maximum 8 queens allowed' });
        return;
      }
      
      this.setState({
        playerSolution: [...playerSolution, { row, col }],
        error: ''
      });
    }
  };

  clearBoard = () => {
    this.setState({
      playerSolution: [],
      error: '',
      showSolution: false,
      result: null
    });
  };

  convertSolutionFormat = (playerSolution) => {
    // Convert [{row, col}] to [col positions by row]
    const board = Array(8).fill(-1);
    playerSolution.forEach(pos => {
      board[pos.row] = pos.col;
    });
    return board;
  };

  solutionMatches = (solution1, solution2) => {
    if (solution1.length !== solution2.length) return false;
    for (let i = 0; i < solution1.length; i++) {
      if (solution1[i] !== solution2[i]) return false;
    }
    return true;
  };

  submitSolution = async () => {
    const { playerSolution, allSolutions, foundSolutions, playerName, totalSolutions , sessionId } = this.state;
    
    if (playerSolution.length !== 8) {
      this.setState({ error: 'Please place exactly 8 queens on the board' });
      return;
    }

    // Check for conflicts
    const conflicts = this.checkConflicts(playerSolution);
    if (conflicts.length > 0) {
      this.setState({ 
        error: 'Invalid solution! Queens are attacking each other.',
        result: 'invalid'
      });
      return;
    }

    // Convert to comparable format
    const playerBoard = this.convertSolutionFormat(playerSolution);
    
    // Check if solution exists
    let matchingSolution = null;
    for (let i = 0; i < allSolutions.length; i++) {
      if (this.solutionMatches(playerBoard, allSolutions[i])) {
        matchingSolution = i;
        break;
      }
    }

    if (matchingSolution === null) {
      this.setState({ 
        error: 'This is not a valid solution to the 8 Queens problem!',
        result: 'invalid'
      });
      return;
    }

    // Check if already found
    if (foundSolutions.has(matchingSolution)) {
      this.setState({ 
        error: 'This solution has already been found! Try another arrangement.',
        result: 'duplicate'
      });
      return;
    }

    // Valid new solution!
   const newFoundSolutions = new Set(foundSolutions);
  newFoundSolutions.add(matchingSolution);
    
     const allFound = newFoundSolutions.size === totalSolutions;
    
    this.setState({
      foundSolutions: newFoundSolutions,
      result: 'correct',
      error: ''
    });

  // Save to database with sessionId
  try {
    const response = await fetch('/api/queens/save-solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: playerName,
        solution: JSON.stringify(playerBoard),
        solutionNumber: matchingSolution + 1,
        isComplete: allFound,
        sessionId: sessionId  // PASS SESSION ID
      })
    });

    const result = await response.json();
    console.log('Solution saved:', result);

    // If all solutions found, clear the flag
    if (allFound) {
      await fetch('/api/queens/clear-flags', {
        method: 'POST'
      });
      
      setTimeout(() => {
        this.setState({
          foundSolutions: new Set(),
          error: '🎉 Congratulations! You found all 92 solutions! Game complete!'
        });
      }, 3000);
    }
  } catch (err) {
    console.error('Error saving solution:', err);
    // Don't block the game if save fails
    this.setState({ 
      error: 'Solution accepted but failed to save to database' 
    });
  }
};

  checkConflicts = (queens) => {
    const conflicts = [];
    
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];
        
        // Same row
        if (q1.row === q2.row) {
          conflicts.push([i, j]);
        }
        // Same column
        if (q1.col === q2.col) {
          conflicts.push([i, j]);
        }
        // Same diagonal
        if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
          conflicts.push([i, j]);
        }
      }
    }
    
    return conflicts;
  };

  showHint = () => {
    const { allSolutions, foundSolutions } = this.state;
    
    // Find first unfound solution
    for (let i = 0; i < allSolutions.length; i++) {
      if (!foundSolutions.has(i)) {
        const solution = allSolutions[i];
        const solutionFormat = solution.map((col, row) => ({ row, col }));
        
        this.setState({
          playerSolution: solutionFormat,
          showSolution: true,
          error: `Hint: Solution #${i + 1} shown`
        });
        return;
      }
    }
  };

  resetGame = () => {
    this.setState({
      gameState: 'welcome',
      playerName: '',
      allSolutions: [],
      foundSolutions: new Set(),
      playerSolution: [],
      sequentialTime: 0,
      threadedTime: 0,
      sequentialComplete: false,
      threadedComplete: false,
      totalSolutions: 0,
      error: '',
      isLoading: false,
      showSolution: false,
      result: null
    });
  };

  render() {
    const {
      gameState,
      playerName,
      playerSolution,
      error,
      isLoading,
      result,
      foundSolutions,
      totalSolutions,
      sequentialTime,
      threadedTime,
      solvingProgress
    } = this.state;

    const conflicts = this.checkConflicts(playerSolution);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans text-white">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fadeInDown">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
            ♛ Eight Queens Puzzle
          </h1>
          <p className="text-lg text-slate-400 mt-3">
            Place 8 queens on the chessboard so none can attack each other
          </p>
        </div>

        {/* Welcome Screen */}
        {gameState === 'welcome' && (
          <div className="flex justify-center items-center min-h-[70vh] px-5 py-10">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-[30px] p-12 max-w-2xl w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)] border-2 border-pink-500/30 text-center animate-fadeInUp">
              
              <div className="text-8xl mb-5 animate-wave">♛</div>

              <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                Eight Queens Challenge
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed mb-10">
                Can you find all 92 unique solutions? Race against sequential and threaded algorithms 
                to discover valid queen placements on an 8×8 chessboard!
              </p>
              
              <div className="my-8">
                <label 
                  htmlFor="playerNameInput" 
                  className="block text-xl font-semibold text-slate-200 mb-4"
                >
                  Enter Your Name
                </label>
                <input
                  id="playerNameInput"
                  type="text"
                  value={playerName}
                  onChange={(e) => this.setState({ playerName: e.target.value, error: '' })}
                  placeholder="Your name..."
                  className="w-full px-6 py-4 border-3 border-pink-500/40 rounded-2xl bg-black/50 text-white text-xl text-center transition-all duration-300 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_30px_rgba(236,72,153,0.5)] focus:bg-black/70 focus:scale-[1.02] placeholder:text-slate-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      this.handlePlayerNameSubmit();
                    }
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 my-4 text-red-300 font-semibold animate-shake">
                  {error}
                </div>
              )}

              <button 
                onClick={this.handlePlayerNameSubmit}
                className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_15px_40px_rgba(236,72,153,0.5)] hover:translate-y-[-3px] hover:shadow-[0_20px_50px_rgba(236,72,153,0.7)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
                disabled={!playerName.trim() || isLoading}
              >
                {isLoading ? '⏳ Computing Solutions...' : 'Start Challenge →'}
              </button>
            </div>
          </div>
        )}

        {/* Computing Screen */}
        {gameState === 'computing' && (
          <div className="flex justify-center items-center min-h-[70vh]">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-[30px] p-12 max-w-2xl w-full text-center">
              <div className="text-6xl mb-6 animate-spin">♛</div>
              <h2 className="text-3xl font-bold mb-5 text-white">Computing All Solutions...</h2>
              <p className="text-slate-300 mb-6">Please wait while we find all 92 solutions</p>
              
              <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${solvingProgress}%` }}
                ></div>
              </div>
              
              <div className="text-slate-400 text-sm">
                {solvingProgress}% Complete
              </div>
            </div>
          </div>
        )}

        {/* Game Content */}
        {gameState === 'playing' && (
          <div className="max-w-7xl mx-auto">
            
            {/* Player Info Bar */}
            <div className="bg-slate-800/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-pink-500/20 mb-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <span className="text-lg text-slate-300">
                  👤 Player: <strong className="text-white bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent text-xl font-extrabold">
                    {playerName}
                  </strong>
                </span>
                <span className="text-lg text-slate-300">
                  🎯 Found: <strong className="text-pink-400 text-xl">{foundSolutions.size}</strong> / {totalSolutions}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[600px_1fr] gap-8">
              
              {/* Chess Board */}
              <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10">
                <ChessBoard 
                  queens={playerSolution}
                  onSquareClick={this.handleSquareClick}
                  conflicts={conflicts}
                />
                
                <div className="mt-6 text-center">
                  <div className="text-slate-300 text-sm mb-2">
                    Queens placed: <strong className="text-white text-lg">{playerSolution.length}</strong> / 8
                  </div>
                  {conflicts.length > 0 && (
                    <div className="text-red-400 text-sm font-semibold">
                      ⚠️ {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Panel */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10">
                
                <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                  Challenge Progress
                </h2>

                {/* Algorithm Performance */}
                <div className="bg-black/30 rounded-xl p-5 mb-6 border border-pink-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">⚡ Algorithm Performance</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Sequential (Single Thread):</span>
                      <span className="text-pink-400 font-bold">{sequentialTime} ms</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Threaded (Parallel):</span>
                      <span className="text-purple-400 font-bold">{threadedTime} ms</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-500/30">
                      <span className="text-white font-semibold">Speedup:</span>
                      <span className="text-white font-bold text-lg">
                        {(parseFloat(sequentialTime) / parseFloat(threadedTime)).toFixed(2)}×
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-400 italic">
                    💡 Threaded approach divides work across multiple execution paths
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-xl p-5 mb-6 border-2 border-pink-500/30">
                  <h3 className="text-lg font-bold text-white mb-3">📋 How to Play</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Click squares to place/remove queens</li>
                    <li>• Place exactly 8 queens on the board</li>
                    <li>• No two queens can attack each other</li>
                    <li>• Find all {totalSolutions} unique solutions!</li>
                  </ul>
                </div>

                {/* Error/Result Display */}
                {error && (
                  <div className={`rounded-xl px-4 py-3 mb-4 font-semibold ${
                    result === 'correct' 
                      ? 'bg-green-500/20 border-2 border-green-500/50 text-green-300' 
                      : result === 'duplicate'
                      ? 'bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-300'
                      : 'bg-red-500/20 border-2 border-red-500/50 text-red-300'
                  } animate-shake`}>
                    {error}
                  </div>
                )}

                {result === 'correct' && (
                  <div className="bg-green-500/20 border-2 border-green-500/50 rounded-xl px-4 py-3 mb-4 text-green-300 font-semibold text-center">
                    🎉 Correct! {foundSolutions.size} / {totalSolutions} solutions found!
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={this.submitSolution}
                    disabled={playerSolution.length !== 8 || conflicts.length > 0}
                    className="w-full px-6 py-4 border-none rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(236,72,153,0.4)] hover:translate-y-[-2px] hover:shadow-[0_15px_40px_rgba(236,72,153,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    ✓ Submit Solution
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={this.clearBoard}
                      className="px-4 py-3 border-2 border-slate-600 rounded-xl bg-slate-700/50 text-white font-semibold hover:bg-slate-700 hover:border-slate-500 transition-all duration-300"
                    >
                      🔄 Clear Board
                    </button>

                    <button
                      onClick={this.showHint}
                      className="px-4 py-3 border-2 border-yellow-500/50 rounded-xl bg-yellow-500/20 text-white font-semibold hover:bg-yellow-500/30 hover:border-yellow-500 transition-all duration-300"
                    >
                      💡 Show Hint
                    </button>
                  </div>

                  <button
                    onClick={this.resetGame}
                    className="w-full px-4 py-3 border-2 border-red-500/50 rounded-xl bg-red-500/20 text-white font-semibold hover:bg-red-500/30 hover:border-red-500 transition-all duration-300"
                  >
                    🏠 New Game
                  </button>
                </div>

                {/* Progress Stats */}
                {foundSolutions.size > 0 && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <h4 className="text-white font-bold mb-3">🏆 Your Progress</h4>
                    <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(foundSolutions.size / totalSolutions) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-slate-300 text-sm">
                      {((foundSolutions.size / totalSolutions) * 100).toFixed(1)}% Complete
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default EightQueensGame;