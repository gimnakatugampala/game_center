// src/app/games/tsg/page.js
'use client';

import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { generateRandomCapacities } from '../../lib/maxFlowAlgorithms';

// Dynamically import NetworkGraph to avoid SSR issues
const Network = dynamic(() => import('../../components/tsg/NetworkGraph'), {
  ssr: false
});

class TSGGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: 'welcome',
      playerName: '',
      capacities: null,
      playerAnswer: '',
      gameResult: null,
      isLoading: false,
      roundNumber: 1,
      maxFlowResult: null,
      error: '',
      gameStartTime: null,
      sessionId: null
    };
  }

  generateRandomCapacities = () => {
    return generateRandomCapacities();
  };

  handlePlayerNameSubmit = async () => {
    const { playerName } = this.state;
    
    if (!playerName.trim()) {
      this.setState({ error: 'Please enter your name to start the game' });
      return;
    }

    if (playerName.trim().length < 2) {
      this.setState({ error: 'Name must be at least 2 characters' });
      return;
    }

    try {
      await fetch('/api/tsg/save-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          timestamp: new Date().toISOString()
        })
      });

      this.initializeGame();
    } catch (err) {
      console.error('Error saving player:', err);
      this.initializeGame();
    }
  };

  initializeGame = () => {
    try {
      const newCapacities = this.generateRandomCapacities();
      
      this.setState({
        capacities: newCapacities,
        playerAnswer: '',
        gameResult: null,
        maxFlowResult: null,
        error: '',
        gameState: 'playing',
        roundNumber: 1,
        gameStartTime: new Date().toISOString()
      });
    } catch (err) {
      this.setState({ error: 'Failed to initialize game: ' + err.message });
    }
  };

  calculateMaxFlow = async () => {
    const { capacities } = this.state;

    if (!capacities) {
      this.setState({ error: 'Capacities not initialized' });
      return;
    }

    this.setState({ isLoading: true, error: '' });

    try {
      const response = await fetch('/api/tsg/calculate-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capacities }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data.maxFlow !== 'number') {
        throw new Error('Invalid response from server');
      }

      this.setState({ maxFlowResult: data });
    } catch (error) {
      console.error('Error calculating max flow:', error);
      this.setState({ error: `Error: ${error.message || 'Failed to calculate maximum flow. Please try again.'}` });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  saveToDatabaseCall = async (playerName, playerAnswer, correctAnswer, isCorrect, algorithmResults, capacities) => {
    try {
      const gameData = {
        playerName: playerName.trim(),
        playerAnswer: playerAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        algorithmResults: algorithmResults,
        capacities: capacities,
        roundNumber: this.state.roundNumber,
        startTime: this.state.gameStartTime || new Date().toISOString(),
        endTime: new Date().toISOString()
      };

      const response = await fetch('/api/tsg/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save game data');
      }

      this.setState({ sessionId: result.sessionId });
      return result;
    } catch (error) {
      console.error('Error saving game data:', error);
      this.setState({ error: 'Warning: Failed to save to database. Game continues...' });
      setTimeout(() => this.setState({ error: '' }), 3000);
      return null;
    }
  };

  submitAnswer = async () => {
    try {
      this.setState({ isLoading: true, error: '' });

      const { playerName, playerAnswer, capacities } = this.state;

      if (!playerName || !playerName.trim()) {
        this.setState({ error: 'Please enter your name', isLoading: false });
        return;
      }

      if (playerName.trim().length > 255) {
        this.setState({ error: 'Player name must be 255 characters or less', isLoading: false });
        return;
      }

      const answerValue = parseInt(playerAnswer);
      if (playerAnswer === '' || isNaN(answerValue) || answerValue < 0 || !isFinite(answerValue)) {
        this.setState({ error: 'Please enter a valid non-negative number for maximum flow', isLoading: false });
        return;
      }

      if (answerValue > 1000) {
        this.setState({ error: 'Maximum flow value seems too large. Please check your answer.', isLoading: false });
        return;
      }

      // Calculate max flow using both algorithms
      const response = await fetch('/api/tsg/calculate-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capacities }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const maxFlowResult = await response.json();
      
      if (!maxFlowResult || typeof maxFlowResult.maxFlow !== 'number') {
        throw new Error('Invalid response from server');
      }

      const isCorrect = answerValue === maxFlowResult.maxFlow;

      const algorithmResults = [
        {
          algorithm: 'Ford-Fulkerson (DFS-based)',
          maxFlow: maxFlowResult.algorithm1.maxFlow,
          time: maxFlowResult.algorithm1.executionTime.toFixed(4),
          complexity: 'O(E × f)',
          type: 'Recursive',
          description: 'Uses depth-first search to find augmenting paths recursively'
        },
        {
          algorithm: 'Edmonds-Karp (BFS-based)',
          maxFlow: maxFlowResult.algorithm2.maxFlow,
          time: maxFlowResult.algorithm2.executionTime.toFixed(4),
          complexity: 'O(V × E²)',
          type: 'Iterative',
          description: 'Uses breadth-first search to find shortest augmenting paths iteratively'
        }
      ];

      await this.saveToDatabaseCall(
        playerName,
        answerValue,
        maxFlowResult.maxFlow,
        isCorrect,
        algorithmResults,
        capacities
      );

      this.setState({
        maxFlowResult: maxFlowResult,
        gameResult: {
          isCorrect: isCorrect,
          correctAnswer: maxFlowResult.maxFlow,
          playerAnswer: answerValue,
          algorithm1Time: maxFlowResult.algorithm1.executionTime,
          algorithm2Time: maxFlowResult.algorithm2.executionTime,
        },
        gameState: 'result',
        isLoading: false
      });
    } catch (err) {
      this.setState({ error: 'Error: ' + err.message, isLoading: false });
    }
  };

  startNewRound = () => {
    const newCapacities = this.generateRandomCapacities();
    this.setState({
      capacities: newCapacities,
      playerAnswer: '',
      gameResult: null,
      maxFlowResult: null,
      error: '',
      roundNumber: this.state.roundNumber + 1,
      gameState: 'playing',
      gameStartTime: new Date().toISOString()
    });
  };

  resetGame = () => {
    this.initializeGame();
  };

  render() {
    const {
      gameState,
      playerName,
      capacities,
      playerAnswer,
      gameResult,
      isLoading,
      roundNumber,
      maxFlowResult,
      error
    } = this.state;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans text-white">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fadeInDown">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_30px_rgba(102,126,234,0.5)]">
            🚦 Traffic Simulation Game
          </h1>
          <p className="text-lg text-slate-400 mt-3">
            Find the maximum flow from source to sink
          </p>
        </div>

        {/* Welcome Screen */}
        {gameState === 'welcome' && (
          <div className="flex justify-center items-center min-h-[70vh] px-5 py-10">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-[30px] p-12 max-w-2xl w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)] border-2 border-indigo-500/30 text-center animate-fadeInUp">
              
              <div className="text-8xl mb-5 animate-wave">👋</div>

              <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                Welcome to TSG Game!
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed mb-10">
                Challenge yourself to find the maximum flow in a traffic network. 
                Test your problem-solving skills against two powerful algorithms!
              </p>
              
              <div className="my-8">
                <label htmlFor="playerNameInput" className="block text-xl font-semibold text-slate-200 mb-4">
                  Enter Your Name
                </label>
                <input
                  id="playerNameInput"
                  type="text"
                  value={playerName}
                  onChange={(e) => this.setState({ playerName: e.target.value, error: '' })}
                  placeholder="Your name..."
                  className="w-full px-6 py-4 border-3 border-indigo-500/40 rounded-2xl bg-black/50 text-white text-xl text-center transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_30px_rgba(102,126,234,0.5)] focus:bg-black/70 focus:scale-[1.02] placeholder:text-slate-500"
                  onKeyPress={(e) => e.key === 'Enter' && this.handlePlayerNameSubmit()}
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
                className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_15px_40px_rgba(102,126,234,0.5)] hover:translate-y-[-3px] hover:shadow-[0_20px_50px_rgba(102,126,234,0.7)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
                disabled={!playerName.trim()}
              >
                Start Game →
              </button>

              <div className="flex justify-around mt-10 pt-8 border-t-2 border-white/10">
                <div className="flex flex-col items-center gap-2.5 text-slate-300 text-sm font-semibold">
                  <span className="text-2xl">🎯</span>
                  <span>Network Visualization</span>
                </div>
                <div className="flex flex-col items-center gap-2.5 text-slate-300 text-sm font-semibold">
                  <span className="text-2xl">⚡</span>
                  <span>2 Algorithms</span>
                </div>
                <div className="flex flex-col items-center gap-2.5 text-slate-300 text-sm font-semibold">
                  <span className="text-2xl">📊</span>
                  <span>Performance Analysis</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Content */}
        {gameState !== 'welcome' && (
          <div className="max-w-[1400px] mx-auto">
            
            {/* Player Info Bar */}
            <div className="bg-slate-800/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-indigo-500/20 mb-5">
              <span className="text-lg text-slate-300">
                👤 Playing as: <strong className="text-white bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent text-xl font-extrabold">
                  {playerName}
                </strong> | Round: <strong className="text-white bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent text-xl font-extrabold">
                  {roundNumber}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
              
              {/* Network Graph Section */}
              <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-5 text-center">Traffic Network</h2>
                {capacities && (
                  <div className="w-full">
                    <Network capacities={capacities} />
                  </div>
                )}
                
                <div className="mt-5">
                  <h3 className="text-lg font-bold text-slate-300 mb-3">Road Capacities (vehicles/minute):</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {capacities && Object.entries(capacities).map(([edge, capacity]) => (
                      <div key={edge} className="bg-black/40 rounded-lg p-3 flex justify-between items-center border border-blue-500/20">
                        <span className="text-slate-300 font-semibold text-sm">{edge}</span>
                        <span className="text-white font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">{capacity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex flex-col">
                
                {/* Playing Phase */}
                {gameState === 'playing' && (
                  <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 animate-slideInRight">
                    
                    <div className="text-center mb-6 pb-5 border-b-2 border-white/10">
                      <h2 className="text-3xl font-bold m-0 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                        Your Challenge
                      </h2>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl p-5 mb-6 border-2 border-indigo-500/30 text-center">
                      <h3 className="m-0 mb-2.5 text-xl bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                        🎯 Find the Maximum Flow!
                      </h3>
                      <p className="m-0 text-slate-300 leading-relaxed text-sm">
                        Calculate the maximum flow from source (A) to sink (T) in the traffic network.
                      </p>
                    </div>

                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-slate-300 text-sm">
                        Maximum Flow from A to T:
                      </label>
                      <input
                        type="text"
                        value={playerAnswer}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Check if value contains any letters
                          if (/[a-zA-Z]/.test(value)) {
                            this.setState({ 
                              playerAnswer: value,
                              error: 'Please enter only numbers. Letters are not allowed.' 
                            });
                          } else {
                            this.setState({ playerAnswer: value, error: '' });
                          }
                        }}
                        placeholder="Enter your answer"
                        className="w-full px-4 py-3 border-2 border-blue-500/30 rounded-xl bg-black/40 text-white text-base transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(102,126,234,0.3)] focus:bg-black/60 placeholder:text-slate-500"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 my-4 text-red-300 font-semibold animate-shake">
                        {error}
                      </div>
                    )}

                    <button 
                      onClick={this.submitAnswer} 
                      className="w-full px-6 py-4 border-none rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(102,126,234,0.4)] hover:translate-y-[-2px] hover:shadow-[0_15px_40px_rgba(102,126,234,0.6)] disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isLoading || !playerAnswer}
                    >
                      {isLoading ? '⏳ Checking Answer...' : 'Submit Answer'}
                    </button>
                  </div>
                )}

                {/* Result Phase */}
                {gameState === 'result' && (
                  <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 animate-slideInRight">
                    
                    <div className={`text-center rounded-2xl p-8 mb-6 ${
                      gameResult.isCorrect 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50' 
                        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-500/50'
                    }`}>
                      <h2 className="text-4xl font-bold mb-3">
                        {gameResult.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                      </h2>
                      <p className="text-slate-300 text-lg">
                        {gameResult.isCorrect 
                          ? 'Great job! You found the maximum flow!' 
                          : 'Not quite. Check the optimal solution below.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/30 rounded-xl p-5 text-center border border-blue-500/20">
                        <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Your Answer</div>
                        <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                          {gameResult.playerAnswer}
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-5 text-center border border-green-500/20">
                        <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Correct Answer</div>
                        <div className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                          {gameResult.correctAnswer}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-5 mb-6 border border-blue-500/20">
                      <h4 className="text-white font-bold text-center mb-4">📊 Algorithm Performance</h4>
                      <div className="space-y-3">
                        <div className="bg-black/40 rounded-xl p-4 border border-indigo-500/30">
                          <div className="flex justify-between items-center mb-2">
                            <strong className="text-white text-sm">{gameResult.algorithm1Time !== undefined ? 'Ford-Fulkerson' : 'Algorithm 1'}</strong>
                            <span className="text-indigo-400 font-bold text-lg">{gameResult.algorithm1Time ? gameResult.algorithm1Time.toFixed(4) : '0.0000'} ms</span>
                          </div>
                          <div className="text-slate-400 text-xs">Max Flow: {gameResult.correctAnswer}</div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-4 border border-purple-500/30">
                          <div className="flex justify-between items-center mb-2">
                            <strong className="text-white text-sm">{gameResult.algorithm2Time !== undefined ? 'Edmonds-Karp' : 'Algorithm 2'}</strong>
                            <span className="text-purple-400 font-bold text-lg">{gameResult.algorithm2Time ? gameResult.algorithm2Time.toFixed(4) : '0.0000'} ms</span>
                          </div>
                          <div className="text-slate-400 text-xs">Max Flow: {gameResult.correctAnswer}</div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={this.startNewRound} 
                      className="w-full px-6 py-4 border-none rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(102,126,234,0.4)] hover:translate-y-[-2px] hover:shadow-[0_15px_40px_rgba(102,126,234,0.6)] mb-2.5"
                    >
                      🔄 Next Round
                    </button>
                    <button 
                      onClick={this.resetGame}
                      className="w-full px-6 py-4 border-2 border-blue-500/50 rounded-xl bg-blue-500/20 text-white text-xl font-bold cursor-pointer transition-all duration-300 hover:bg-blue-500/30 hover:border-blue-500"
                    >
                      🏠 New Game
                    </button>
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

export default TSGGame;