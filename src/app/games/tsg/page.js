// src/app/games/tsg/page.js
'use client';

import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { generateRandomCapacities } from '../../lib/maxFlowAlgorithms';
import './tsg.css';

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

  componentDidMount() {
    // Don't initialize game yet - wait for player name
  }

  generateRandomCapacities = () => {
    return generateRandomCapacities();
  };

  // Save player name and initialize game
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
      // Save player entry to database
      await fetch('/api/tsg/save-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          timestamp: new Date().toISOString()
        })
      });

      // Initialize game after player name is saved
      this.initializeGame();
    } catch (err) {
      console.error('Error saving player:', err);
      // Still allow game to continue even if save fails
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
      
      // Validate response data
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
      console.log('💾 Saving game data to database...');
      
      // Prepare the data payload
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

      // Call the unified save-game API endpoint
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

      console.log('✅ Game data saved successfully:', result);
      
      // Store session ID for potential future use
      this.setState({ sessionId: result.sessionId });
      
      return result;

    } catch (error) {
      console.error('❌ Error saving game data:', error);
      
      // Show user-friendly error but don't stop the game
      this.setState({ 
        error: 'Warning: Failed to save to database. Game continues...' 
      });
      
      // Clear error after 3 seconds
      setTimeout(() => {
        this.setState({ error: '' });
      }, 3000);
      
      // Don't throw - allow game to continue even if save fails
      return null;
    }
  };

  submitAnswer = async () => {
    try {
      this.setState({ isLoading: true, error: '' });

      const { playerName, playerAnswer, maxFlowResult, capacities } = this.state;

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

      if (!maxFlowResult) {
        this.setState({ error: 'Please calculate the maximum flow first', isLoading: false });
        return;
      }

      const isCorrect = answerValue === maxFlowResult.maxFlow;

      // Prepare algorithm results
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

  handleNameChange = (e) => {
    this.setState({ 
      playerName: e.target.value,
      error: '' 
    });
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
      <div className="tsg-game-container">
        <div className="tsg-header">
          <h1 className="tsg-title">🚦 Traffic Simulation Game</h1>
          <p className="tsg-subtitle">Find the maximum flow from source to sink</p>
        </div>

        {/* Welcome Screen - Player Name Entry */}
        {gameState === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <div className="welcome-icon">👋</div>
              <h2>Welcome to TSG Game!</h2>
              <p className="welcome-description">
                Challenge yourself to find the maximum flow in a traffic network. 
                Test your problem-solving skills against two powerful algorithms!
              </p>
              
              <div className="player-name-section">
                <label htmlFor="playerNameInput">Enter Your Name</label>
                <input
                  id="playerNameInput"
                  type="text"
                  value={playerName}
                  onChange={this.handleNameChange}
                  placeholder="Your name..."
                  className="welcome-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      this.handlePlayerNameSubmit();
                    }
                  }}
                  autoFocus
                />
              </div>

              {error && <div className="error-alert">{error}</div>}

              <button 
                onClick={this.handlePlayerNameSubmit}
                className="btn-start"
                disabled={!playerName.trim()}
              >
                Start Game →
              </button>

              <div className="game-features">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Network Visualization</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>2 Algorithms</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Performance Analysis</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Content */}
        {gameState !== 'welcome' && (
          <div className="tsg-content">
            {/* Player Info Bar */}
            <div className="player-info-bar">
              <span className="player-greeting">
                👤 Playing as: <strong>{playerName}</strong> | Round: <strong>{roundNumber}</strong>
              </span>
            </div>

            <div className="tsg-content-grid">
              {/* Network Graph Section */}
              <div className="graph-section">
                <div className="graph-container">
                  <h2>Traffic Network</h2>
                  {capacities && (
                    <div className="network-wrapper">
                      <Network capacities={capacities} />
                    </div>
                  )}
                  
                  <div className="capacities-list">
                    <h3>Road Capacities (vehicles/minute):</h3>
                    <div className="capacities-grid">
                      {capacities && Object.entries(capacities).map(([edge, capacity]) => (
                        <div key={edge} className="capacity-item">
                          <span className="capacity-edge">{edge}</span>
                          <span className="capacity-value">{capacity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              <div className="controls-section">
                {/* Playing Phase */}
                {gameState === 'playing' && (
                  <div className="game-panel">
                    <div className="panel-header">
                      <h2>Your Challenge</h2>
                    </div>

                    <div className="challenge-box">
                      <h3>🎯 Find the Maximum Flow!</h3>
                      <p>Calculate the maximum flow from source (A) to sink (T) in the traffic network.</p>
                    </div>

                    <div className="control-section">
                      <h3>Calculate Maximum Flow</h3>
                      <button
                        onClick={this.calculateMaxFlow}
                        disabled={isLoading || !capacities}
                        className="btn-primary"
                      >
                        {isLoading ? '⏳ Calculating...' : 'Calculate Max Flow'}
                      </button>

                      {maxFlowResult && (
                        <div className="result-box">
                          <h4>Algorithm Results:</h4>
                          <div className="algorithm-result">
                            <strong>{maxFlowResult.algorithm1.name}:</strong>
                            <div>Max Flow: {maxFlowResult.algorithm1.maxFlow}</div>
                            <div>Time: {maxFlowResult.algorithm1.executionTime.toFixed(3)} ms</div>
                          </div>
                          <div className="algorithm-result">
                            <strong>{maxFlowResult.algorithm2.name}:</strong>
                            <div>Max Flow: {maxFlowResult.algorithm2.maxFlow}</div>
                            <div>Time: {maxFlowResult.algorithm2.executionTime.toFixed(3)} ms</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Maximum Flow from A to T:</label>
                      <input
                        type="number"
                        value={playerAnswer}
                        onChange={(e) => this.setState({ playerAnswer: e.target.value, error: '' })}
                        placeholder="Enter your answer"
                        className="input-field"
                        min="0"
                      />
                    </div>

                    {error && <div className="error-alert">{error}</div>}

                    <button 
                      onClick={this.submitAnswer} 
                      className="btn-primary btn-large"
                      disabled={isLoading || !maxFlowResult || !playerAnswer}
                    >
                      {isLoading ? '⏳ Submitting...' : 'Submit Answer'}
                    </button>
                  </div>
                )}

                {/* Result Phase */}
                {gameState === 'result' && (
                  <div className="game-panel">
                    <div className={`result-header ${gameResult.isCorrect ? 'win' : 'lose'}`}>
                      <h2>
                        {gameResult.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                      </h2>
                      <p>
                        {gameResult.isCorrect 
                          ? 'Great job! You found the maximum flow!' 
                          : 'Not quite. Check the optimal solution below.'}
                      </p>
                    </div>

                    <div className="result-details">
                      <div className="result-stat">
                        <div className="stat-label">Your Answer</div>
                        <div className="stat-value">{gameResult.playerAnswer}</div>
                      </div>
                      <div className="result-stat">
                        <div className="stat-label">Correct Answer</div>
                        <div className="stat-value">{gameResult.correctAnswer}</div>
                      </div>
                    </div>

                    {maxFlowResult && (
                      <div className="algorithm-comparison">
                        <h4>📊 Algorithm Performance</h4>
                        <div className="algorithm-stats">
                          <div className="algorithm-stat-card">
                            <div className="algorithm-name">{maxFlowResult.algorithm1.name}</div>
                            <div className="algorithm-time">{maxFlowResult.algorithm1.executionTime.toFixed(3)} ms</div>
                          </div>
                          <div className="algorithm-stat-card">
                            <div className="algorithm-name">{maxFlowResult.algorithm2.name}</div>
                            <div className="algorithm-time">{maxFlowResult.algorithm2.executionTime.toFixed(3)} ms</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button onClick={this.startNewRound} className="btn-primary btn-large">
                      🔄 Next Round
                    </button>
                    <button onClick={this.resetGame} className="btn-secondary">
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
