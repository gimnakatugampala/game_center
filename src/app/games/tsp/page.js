// src/app/games/tsp/page.js
'use client';

import React, { Component } from 'react';
import InteractiveMap from '../../components/tsp/InteractiveMap';
import './tsp.css';

const CITIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

class TSPGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: 'welcome', // welcome, select_cities, playing, result
      distances: {},
      cityPositions: {},
      homeCity: '',
      selectedCities: [],
      playerName: '',
      playerAnswer: '',
      playerRoute: '',
      result: null,
      algorithmResults: [],
      error: '',
      isLoading: false,
      showRoute: false,
      animatingRoute: false,
      currentAlgorithmIndex: 0
    };
  }

  componentDidMount() {
    // Don't initialize game yet - wait for player name
  }

  generateCityPositions = () => {
    const positions = {};
    const centerX = 400;
    const centerY = 300;
    const radiusX = 320;
    const radiusY = 220;

    CITIES.forEach((city, index) => {
      const angle = (index / CITIES.length) * 2 * Math.PI - Math.PI / 2;
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;
      
      positions[city] = {
        x: centerX + radiusX * Math.cos(angle) + offsetX,
        y: centerY + radiusY * Math.sin(angle) + offsetY
      };
    });

    return positions;
  };

  calculateDistance = (pos1, pos2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    return Math.floor(pixelDistance / 5) + 50;
  };

  generateRandomDistances = (positions) => {
    const distances = {};
    CITIES.forEach(city1 => {
      distances[city1] = {};
      CITIES.forEach(city2 => {
        if (city1 === city2) {
          distances[city1][city2] = 0;
        } else if (!distances[city1][city2]) {
          const dist = this.calculateDistance(positions[city1], positions[city2]);
          distances[city1][city2] = dist;
          distances[city2] = distances[city2] || {};
          distances[city2][city1] = dist;
        }
      });
    });
    return distances;
  };

  getRandomHomeCity = () => {
    return CITIES[Math.floor(Math.random() * CITIES.length)];
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
      await fetch('/api/tsp/save-player', {
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
      const newPositions = this.generateCityPositions();
      const newDistances = this.generateRandomDistances(newPositions);
      const newHomeCity = this.getRandomHomeCity();
      
      this.setState({
        distances: newDistances,
        cityPositions: newPositions,
        homeCity: newHomeCity,
        selectedCities: [],
        playerAnswer: '',
        playerRoute: '',
        result: null,
        algorithmResults: [],
        error: '',
        gameState: 'select_cities',
        showRoute: false,
        animatingRoute: false
      });
    } catch (err) {
      this.setState({ error: 'Failed to initialize game: ' + err.message });
    }
  };

  toggleCitySelection = (city) => {
    const { homeCity, selectedCities } = this.state;
    
    if (city === homeCity) {
      this.setState({ error: 'Cannot select home city as a destination' });
      setTimeout(() => this.setState({ error: '' }), 2000);
      return;
    }

    if (selectedCities.includes(city)) {
      this.setState({
        selectedCities: selectedCities.filter(c => c !== city),
        error: ''
      });
    } else {
      this.setState({
        selectedCities: [...selectedCities, city],
        error: ''
      });
    }
  };

  startGame = () => {
    const { selectedCities } = this.state;
    
    if (selectedCities.length < 2) {
      this.setState({ error: 'Please select at least 2 cities to visit' });
      return;
    }
    this.setState({ gameState: 'playing', error: '' });
  };

  nearestNeighborAlgorithm = (distances, cities, start) => {
    const unvisited = new Set(cities.filter(c => c !== start));
    const route = [start];
    let current = start;
    let totalDistance = 0;

    while (unvisited.size > 0) {
      let nearest = null;
      let minDist = Infinity;

      for (const city of unvisited) {
        const dist = distances[current][city];
        if (dist < minDist) {
          minDist = dist;
          nearest = city;
        }
      }

      route.push(nearest);
      totalDistance += minDist;
      unvisited.delete(nearest);
      current = nearest;
    }

    route.push(start);
    totalDistance += distances[current][start];

    return { route, distance: totalDistance };
  };

  bruteForceTSP = (distances, cities, start) => {
    const citiesToVisit = cities.filter(c => c !== start);
    let minDistance = Infinity;
    let bestRoute = [];

    const permute = (arr, memo = []) => {
      if (arr.length === 0) {
        let distance = 0;
        let current = start;
        const fullRoute = [start, ...memo, start];

        for (let i = 1; i < fullRoute.length; i++) {
          distance += distances[current][fullRoute[i]];
          current = fullRoute[i];
        }

        if (distance < minDistance) {
          minDistance = distance;
          bestRoute = fullRoute;
        }
        return;
      }

      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, memo.concat(next));
      }
    };

    permute(citiesToVisit);
    return { route: bestRoute, distance: minDistance };
  };

  dynamicProgrammingTSP = (distances, cities, start) => {
    const n = cities.length;
    const cityIndex = {};
    cities.forEach((city, idx) => { cityIndex[city] = idx; });

    const startIdx = cityIndex[start];
    const memo = new Map();

    const tsp = (visited, last) => {
      if (visited === (1 << n) - 1) {
        return distances[cities[last]][start] || 0;
      }

      const key = `${visited}-${last}`;
      if (memo.has(key)) return memo.get(key);

      let minDist = Infinity;

      for (let i = 0; i < n; i++) {
        if ((visited & (1 << i)) === 0) {
          const newVisited = visited | (1 << i);
          const dist = distances[cities[last]][cities[i]] + tsp(newVisited, i);
          minDist = Math.min(minDist, dist);
        }
      }

      memo.set(key, minDist);
      return minDist;
    };

    const minDistance = tsp(1 << startIdx, startIdx);

    const route = [start];
    let visited = 1 << startIdx;
    let current = startIdx;

    while (route.length < n) {
      let nextCity = -1;
      let minDist = Infinity;

      for (let i = 0; i < n; i++) {
        if ((visited & (1 << i)) === 0) {
          const newVisited = visited | (1 << i);
          const key = `${newVisited}-${i}`;
          const dist = distances[cities[current]][cities[i]] + (memo.get(key) || tsp(newVisited, i));
          
          if (dist < minDist) {
            minDist = dist;
            nextCity = i;
          }
        }
      }

      route.push(cities[nextCity]);
      visited |= (1 << nextCity);
      current = nextCity;
    }

    route.push(start);
    return { route, distance: minDistance };
  };

  submitAnswer = async () => {
    try {
      this.setState({ isLoading: true, error: '' });

      const { playerAnswer, playerRoute, homeCity, selectedCities, distances, playerName } = this.state;

      if (!playerAnswer.trim()) {
        this.setState({ error: 'Please enter the shortest distance', isLoading: false });
        return;
      }

      const distance = parseFloat(playerAnswer);
      if (isNaN(distance) || distance <= 0) {
        this.setState({ error: 'Please enter a valid positive number', isLoading: false });
        return;
      }

      if (!playerRoute.trim()) {
        this.setState({ error: 'Please enter the route (e.g., A-B-C-A)', isLoading: false });
        return;
      }

      const citiesToVisit = [homeCity, ...selectedCities];
      const results = [];

      // Algorithm 1: Nearest Neighbor
      const nn_start = performance.now();
      const nnResult = this.nearestNeighborAlgorithm(distances, citiesToVisit, homeCity);
      const nn_end = performance.now();
      results.push({
        algorithm: 'Nearest Neighbor (Greedy)',
        distance: nnResult.distance,
        route: nnResult.route,
        routeString: nnResult.route.join(' → '),
        time: (nn_end - nn_start).toFixed(4),
        complexity: 'O(n²)',
        type: 'iterative'
      });

      // Algorithm 2: Brute Force (only for small sets)
      if (citiesToVisit.length <= 8) {
        const bf_start = performance.now();
        const bfResult = this.bruteForceTSP(distances, citiesToVisit, homeCity);
        const bf_end = performance.now();
        results.push({
          algorithm: 'Brute Force (Recursive)',
          distance: bfResult.distance,
          route: bfResult.route,
          routeString: bfResult.route.join(' → '),
          time: (bf_end - bf_start).toFixed(4),
          complexity: 'O(n!)',
          type: 'recursive'
        });
      }

      // Algorithm 3: Dynamic Programming
      const dp_start = performance.now();
      const dpResult = this.dynamicProgrammingTSP(distances, citiesToVisit, homeCity);
      const dp_end = performance.now();
      results.push({
        algorithm: 'Dynamic Programming (Held-Karp)',
        distance: dpResult.distance,
        route: dpResult.route,
        routeString: dpResult.route.join(' → '),
        time: (dp_end - dp_start).toFixed(4),
        complexity: 'O(n² × 2ⁿ)',
        type: 'iterative'
      });

      const optimalDistance = Math.min(...results.map(r => r.distance));
      const tolerance = 1;
      
      const isCorrect = Math.abs(distance - optimalDistance) <= tolerance;

      await this.saveToDatabaseCall(playerName, homeCity, selectedCities, playerRoute, distance, isCorrect, results);

      this.setState({
        algorithmResults: results,
        result: isCorrect ? 'win' : 'lose',
        gameState: 'result',
        isLoading: false,
        showRoute: true,
        currentAlgorithmIndex: 0
      });

    } catch (err) {
      this.setState({ error: 'Error: ' + err.message, isLoading: false });
    }
  };

  saveToDatabaseCall = async (playerName, homeCity, selectedCities, playerRoute, playerDistance, isCorrect, results) => {
    try {
      const gameData = {
        playerName,
        homeCity,
        selectedCities: selectedCities.join(','),
        shortestRoute: results[results.length - 1].routeString,
        shortestDistance: Math.min(...results.map(r => r.distance)),
        playerRoute,
        playerDistance,
        isCorrect,
        timestamp: new Date().toISOString()
      };

      await fetch('/api/tsp/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });

      for (const result of results) {
        await fetch('/api/tsp/save-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: playerName,
            algorithmName: result.algorithm,
            timeTaken: parseFloat(result.time),
            numCities: selectedCities.length + 1,
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (err) {
      console.error('Database error:', err);
    }
  };

  resetGame = () => {
    this.initializeGame();
  };

  changeAlgorithmView = (index) => {
    this.setState({ currentAlgorithmIndex: index });
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
      distances,
      cityPositions,
      homeCity,
      selectedCities,
      playerName,
      playerAnswer,
      playerRoute,
      result,
      algorithmResults,
      error,
      isLoading,
      showRoute,
      currentAlgorithmIndex
    } = this.state;

    const currentRoute = algorithmResults[currentAlgorithmIndex];

    return (
      <div className="tsp-game-container">
        <div className="tsp-header">
          <h1 className="tsp-title">🗺️ Traveling Salesman Problem</h1>
          <p className="tsp-subtitle">Find the shortest route through all cities</p>
        </div>

        {/* Welcome Screen - Player Name Entry */}
        {gameState === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <div className="welcome-icon">👋</div>
              <h2>Welcome to TSP Game!</h2>
              <p className="welcome-description">
                Challenge yourself to find the shortest path through multiple cities. 
                Test your problem-solving skills against three powerful algorithms!
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
                  <span>Interactive Map</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>3 Algorithms</span>
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
          <div className="tsp-content">
            {/* Player Info Bar */}
            <div className="player-info-bar">
              <span className="player-greeting">
                👤 Playing as: <strong>{playerName}</strong>
              </span>
            </div>

            {/* Interactive Map */}
            <div className="map-section">
              <InteractiveMap
                cityPositions={cityPositions}
                distances={distances}
                homeCity={homeCity}
                selectedCities={selectedCities}
                onCityClick={gameState === 'select_cities' ? this.toggleCitySelection : null}
                route={showRoute && currentRoute ? currentRoute.route : null}
                showAllConnections={gameState === 'select_cities' || gameState === 'playing'}
              />
            </div>

            {/* Game Controls */}
            <div className="controls-section">
              {/* City Selection Phase */}
              {gameState === 'select_cities' && (
                <div className="game-panel">
                  <div className="panel-header">
                    <h2>Setup Game</h2>
                  </div>

                  <div className="info-box">
                    <div className="info-item">
                      <span className="info-label">Home City:</span>
                      <span className="info-value home-badge">{homeCity}</span>
                    </div>
                  </div>

                  <div className="city-selection-panel">
                    <h3>Select Cities to Visit</h3>
                    <p className="helper-text">Click on cities in the map or buttons below</p>
                    
                    <div className="city-grid">
                      {CITIES.map(city => (
                        <button
                          key={city}
                          onClick={() => this.toggleCitySelection(city)}
                          className={`city-btn ${
                            city === homeCity ? 'home' :
                            selectedCities.includes(city) ? 'selected' : ''
                          }`}
                          disabled={city === homeCity}
                        >
                          <span className="city-letter">{city}</span>
                          {city === homeCity && <span className="badge">Home</span>}
                        </button>
                      ))}
                    </div>

                    <div className="selected-summary">
                      <strong>Selected Cities:</strong>
                      <div className="selected-list">
                        {selectedCities.length > 0 ? selectedCities.join(', ') : 'None'}
                      </div>
                      <small>({selectedCities.length} selected, minimum 2 required)</small>
                    </div>
                  </div>

                  {error && <div className="error-alert">{error}</div>}

                  <button 
                    onClick={this.startGame} 
                    className="btn-primary btn-large"
                    disabled={selectedCities.length < 2}
                  >
                    Start Challenge →
                  </button>
                </div>
              )}

              {/* Playing Phase */}
              {gameState === 'playing' && (
                <div className="game-panel">
                  <div className="panel-header">
                    <h2>Your Challenge</h2>
                  </div>

                  <div className="info-box">
                    <div className="info-item">
                      <span className="info-label">Home:</span>
                      <span className="info-value">{homeCity}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Visit:</span>
                      <span className="info-value">{selectedCities.join(', ')}</span>
                    </div>
                  </div>

                  <div className="challenge-box">
                    <h3>🎯 Find the Shortest Route!</h3>
                    <p>Calculate the shortest distance to visit all selected cities and return home.</p>
                  </div>

                  <div className="input-group">
                    <label>Shortest Distance (km):</label>
                    <input
                      type="number"
                      value={playerAnswer}
                      onChange={(e) => this.setState({ playerAnswer: e.target.value, error: '' })}
                      placeholder="Enter distance"
                      className="input-field"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="input-group">
                    <label>Your Route:</label>
                    <input
                      type="text"
                      value={playerRoute}
                      onChange={(e) => this.setState({ playerRoute: e.target.value, error: '' })}
                      placeholder="e.g., A-B-C-A"
                      className="input-field"
                    />
                    <small className="hint">Format: {homeCity}-City1-City2-...-{homeCity}</small>
                  </div>

                  {/* Distance Reference Table */}
                  <div className="distance-reference">
                    <h4>Distance Reference</h4>
                    <div className="distance-scroll">
                      <table className="distance-table">
                        <thead>
                          <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>Distance (km)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[homeCity, ...selectedCities].map(from => 
                            [homeCity, ...selectedCities]
                              .filter(to => from !== to)
                              .map(to => (
                                <tr key={`${from}-${to}`}>
                                  <td>{from}</td>
                                  <td>{to}</td>
                                  <td>{distances[from]?.[to]}</td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {error && <div className="error-alert">{error}</div>}

                  <button 
                    onClick={this.submitAnswer} 
                    className="btn-primary btn-large"
                    disabled={isLoading || !playerAnswer || !playerRoute}
                  >
                    {isLoading ? '⏳ Calculating...' : 'Submit Answer'}
                  </button>
                </div>
              )}

              {/* Result Phase */}
              {gameState === 'result' && (
                <div className="game-panel">
                  <div className={`result-header ${result}`}>
                    <h2>
                      {result === 'win' ? '🎉 Correct!' : '❌ Incorrect'}
                    </h2>
                    <p>
                      {result === 'win' 
                        ? 'Great job! You found the optimal route!' 
                        : 'Not quite. Check the optimal solution below.'}
                    </p>
                  </div>

                  <div className="algorithm-tabs">
                    {algorithmResults.map((algo, index) => (
                      <button
                        key={index}
                        onClick={() => this.changeAlgorithmView(index)}
                        className={`tab-btn ${currentAlgorithmIndex === index ? 'active' : ''}`}
                      >
                        {algo.algorithm.split('(')[0]}
                      </button>
                    ))}
                  </div>

                  {currentRoute && (
                    <div className="algorithm-details">
                      <h3>{currentRoute.algorithm}</h3>
                      
                      <div className="result-stats">
                        <div className="stat-card">
                          <div className="stat-label">Distance</div>
                          <div className="stat-value">{currentRoute.distance} km</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-label">Time</div>
                          <div className="stat-value">{currentRoute.time} ms</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-label">Complexity</div>
                          <div className="stat-value">{currentRoute.complexity}</div>
                        </div>
                      </div>

                      <div className="route-display">
                        <strong>Route:</strong>
                        <div className="route-path">{currentRoute.routeString}</div>
                      </div>

                      <div className="algorithm-type-badge">
                        {currentRoute.type === 'recursive' ? '🔄 Recursive' : '➡️ Iterative'}
                      </div>
                    </div>
                  )}

                  <div className="comparison-section">
                    <h4>Algorithm Comparison</h4>
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Algorithm</th>
                          <th>Distance (km)</th>
                          <th>Time (ms)</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {algorithmResults.map((algo, index) => (
                          <tr key={index} className={algo.distance === Math.min(...algorithmResults.map(a => a.distance)) ? 'optimal' : ''}>
                            <td>{algo.algorithm}</td>
                            <td>{algo.distance}</td>
                            <td>{algo.time}</td>
                            <td>{algo.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button onClick={this.resetGame} className="btn-primary btn-large">
                    🔄 Play Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TSPGame;