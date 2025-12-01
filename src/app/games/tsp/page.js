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
    gameState: 'welcome',
    distances: {},
    cityPositions: {},
    homeCity: '',
    selectedCities: [],
    playerName: '',
    playerAnswer: '',
    playerRouteArray: [],  // ✅ ADD THIS - replaces playerRoute string
    result: null,
    algorithmResults: [],
    error: '',
    isLoading: false,
    showRoute: false,
    animatingRoute: false,
    currentAlgorithmIndex: 0,
    gameStartTime: null, // ✅ ADD THIS
    sessionId: null // ✅ ADD THIS TOO
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

// Add city to route
addCityToRoute = (city) => {
  const { playerRouteArray, homeCity, selectedCities } = this.state;
  
  // Validation: Can only add cities that are selected or home city
  const allowedCities = [homeCity, ...selectedCities];
  if (!allowedCities.includes(city)) {
    this.setState({ error: 'Can only add selected cities to route' });
    setTimeout(() => this.setState({ error: '' }), 2000);
    return;
  }
  
  // Validation: Can't add same city twice (except home at start/end)
  if (playerRouteArray.includes(city) && city !== homeCity) {
    this.setState({ error: `City ${city} already in route` });
    setTimeout(() => this.setState({ error: '' }), 2000);
    return;
  }
  
  // If this is the first city, it must be home
  if (playerRouteArray.length === 0 && city !== homeCity) {
    this.setState({ error: 'Route must start with home city' });
    setTimeout(() => this.setState({ error: '' }), 2000);
    return;
  }
  
  this.setState({
    playerRouteArray: [...playerRouteArray, city],
    error: ''
  });
};

// Remove last city from route
removeLastCity = () => {
  const { playerRouteArray } = this.state;
  if (playerRouteArray.length > 0) {
    this.setState({
      playerRouteArray: playerRouteArray.slice(0, -1),
      error: ''
    });
  }
};

// Auto-complete route (add home city at end)
returnHome = () => {
  const { playerRouteArray, homeCity, selectedCities } = this.state;
  
  // Check if all cities have been visited
  const visitedCities = new Set(playerRouteArray.filter(c => c !== homeCity));
  const allVisited = selectedCities.every(city => visitedCities.has(city));
  
  if (!allVisited) {
    this.setState({ 
      error: 'Must visit all selected cities before returning home' 
    });
    setTimeout(() => this.setState({ error: '' }), 3000);
    return;
  }
  
  if (playerRouteArray[playerRouteArray.length - 1] !== homeCity) {
    this.setState({
      playerRouteArray: [...playerRouteArray, homeCity],
      error: ''
    });
  }
};

// Clear route
clearRoute = () => {
  this.setState({
    playerRouteArray: [],
    error: ''
  });
};

// Get available cities for next selection
getAvailableCities = () => {
  const { playerRouteArray, homeCity, selectedCities } = this.state;
  const visitedCities = new Set(playerRouteArray);
  
  // If route is empty, only home city is available
  if (playerRouteArray.length === 0) {
    return [homeCity];
  }
  
  // If all cities visited, only home city is available
  const remainingCities = selectedCities.filter(c => !visitedCities.has(c));
  if (remainingCities.length === 0) {
    return [homeCity];
  }
  
  return remainingCities;
};

// Calculate distance for current route
calculateRouteDistance = () => {
  const { playerRouteArray, distances } = this.state;
  if (playerRouteArray.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < playerRouteArray.length - 1; i++) {
    const from = playerRouteArray[i];
    const to = playerRouteArray[i + 1];
    totalDistance += distances[from]?.[to] || 0;
  }
  return totalDistance;
};

// Check if route is complete
isRouteComplete = () => {
  const { playerRouteArray, homeCity, selectedCities } = this.state;
  
  // Must have at least 3 cities (home -> city -> home)
  if (playerRouteArray.length < 3) return false;
  
  // Must start and end with home city
  if (playerRouteArray[0] !== homeCity) return false;
  if (playerRouteArray[playerRouteArray.length - 1] !== homeCity) return false;
  
  // Must visit all selected cities exactly once
  const visitedCities = playerRouteArray.slice(1, -1); // Exclude first and last (both home)
  const uniqueVisited = new Set(visitedCities);
  
  // Check if all selected cities are visited
  return selectedCities.every(city => uniqueVisited.has(city)) && 
         visitedCities.length === selectedCities.length;
};


// Get available cities for next selection
getAvailableCities = () => {
  const { playerRouteArray, homeCity, selectedCities } = this.state;
  const visitedCities = new Set(playerRouteArray);
  
  // If route is empty, only home city is available
  if (playerRouteArray.length === 0) {
    return [homeCity];
  }
  
  // If all cities visited, only home city is available
  const remainingCities = selectedCities.filter(c => !visitedCities.has(c));
  if (remainingCities.length === 0) {
    return [homeCity];
  }
  
  return remainingCities;
};


// Add this method to your TSPGame component class in src/app/games/tsp/page.js

saveToDatabaseCall = async (playerName, homeCity, selectedCities, playerRoute, playerDistance, isCorrect, algorithmResults) => {
  try {
    console.log('💾 Saving game data to database...');
    
    // Prepare the data payload
    const gameData = {
      playerName: playerName.trim(),
      homeCity: homeCity,
      selectedCities: selectedCities, // Array: ["B", "C", "D"]
      distances: this.state.distances, // Distance matrix object
      playerRoute: playerRoute, // String: "A-B-C-D-A"
      playerDistance: playerDistance,
      algorithmResults: algorithmResults, // Array of algorithm results
      startTime: this.state.gameStartTime || new Date().toISOString(),
      endTime: new Date().toISOString()
    };

    // Call the unified save-game API endpoint
    const response = await fetch('/api/tsp/save-game', {
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

// Also add this to track game start time in your startGame method:
// Update your existing startGame method to include this line:
startGame = () => {
  const { selectedCities } = this.state;
  
  if (selectedCities.length < 2) {
    this.setState({ error: 'Please select at least 2 cities to visit' });
    return;
  }
  
  this.setState({ 
    gameState: 'playing', 
    error: '',
    gameStartTime: new Date().toISOString() // ✅ ADD THIS LINE
  });
};



// Calculate distance for current route
calculateRouteDistance = () => {
  const { playerRouteArray, distances } = this.state;
  if (playerRouteArray.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < playerRouteArray.length - 1; i++) {
    const from = playerRouteArray[i];
    const to = playerRouteArray[i + 1];
    totalDistance += distances[from]?.[to] || 0;
  }
  return totalDistance;
};

// Check if route is complete
isRouteComplete = () => {
  const { playerRouteArray, homeCity, selectedCities } = this.state;
  
  // Must have at least 3 cities (home -> city -> home)
  if (playerRouteArray.length < 3) return false;
  
  // Must start and end with home city
  if (playerRouteArray[0] !== homeCity) return false;
  if (playerRouteArray[playerRouteArray.length - 1] !== homeCity) return false;
  
  // Must visit all selected cities exactly once
  const visitedCities = playerRouteArray.slice(1, -1); // Exclude first and last (both home)
  const uniqueVisited = new Set(visitedCities);
  
  // Check if all selected cities are visited
  return selectedCities.every(city => uniqueVisited.has(city)) && 
         visitedCities.length === selectedCities.length;
};

calculateDistance = (pos1, pos2) => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  
  // ✅ FIX: Ensure distance is always between 50-100 km
  // Normalize pixel distance to 0-1 range, then scale to 50-100
  const maxPixelDistance = Math.sqrt(800 * 800 + 600 * 600); // ~1000 pixels
  const normalizedDistance = pixelDistance / maxPixelDistance; // 0 to 1
  const distance = Math.floor(normalizedDistance * 50) + 50; // 50 to 100
  
  return distance;
};


generateRandomDistances = (positions) => {
  const distances = {};
  CITIES.forEach(city1 => {
    distances[city1] = {};
    CITIES.forEach(city2 => {
      if (city1 === city2) {
        distances[city1][city2] = 0;
      } else if (!distances[city1][city2]) {
        // ✅ Calculate distance based on positions
        const dist = this.calculateDistance(positions[city1], positions[city2]);
        
        // ✅ DOUBLE CHECK: Ensure it's within range (safety check)
        const finalDist = Math.max(50, Math.min(100, dist));
        
        distances[city1][city2] = finalDist;
        distances[city2] = distances[city2] || {};
        distances[city2][city1] = finalDist;
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
      playerRouteArray: [],  // ✅ RESET ROUTE ARRAY
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

 // Update your existing startGame method to include this line:
startGame = () => {
  const { selectedCities } = this.state;
  
  if (selectedCities.length < 2) {
    this.setState({ error: 'Please select at least 2 cities to visit' });
    return;
  }
  
  this.setState({ 
    gameState: 'playing', 
    error: '',
    gameStartTime: new Date().toISOString() // ✅ ADD THIS LINE
  });
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

// Replace your submitAnswer method with this ORIGINAL VERSION
// This keeps the challenge of guessing the optimal distance

submitAnswer = async () => {
  try {
    this.setState({ isLoading: true, error: '' });

    const { playerAnswer, playerRouteArray, homeCity, selectedCities, distances, playerName } = this.state;

    // ✅ VALIDATE DISTANCE INPUT (ORIGINAL)
    if (!playerAnswer.trim()) {
      this.setState({ error: 'Please enter the shortest distance', isLoading: false });
      return;
    }

    const playerGuessedDistance = parseFloat(playerAnswer);
    if (isNaN(playerGuessedDistance) || playerGuessedDistance <= 0) {
      this.setState({ error: 'Please enter a valid positive number', isLoading: false });
      return;
    }

    // ✅ VALIDATE ROUTE ARRAY
    if (playerRouteArray.length === 0) {
      this.setState({ error: 'Please build your route using the route builder', isLoading: false });
      return;
    }

    if (!this.isRouteComplete()) {
      this.setState({ 
        error: 'Route incomplete - must visit all cities and return home', 
        isLoading: false 
      });
      return;
    }

    // ✅ CALCULATE PLAYER'S ACTUAL ROUTE DISTANCE
    const playerActualDistance = this.calculateRouteDistance();
    
    // ✅ CONVERT ARRAY TO STRING FOR DATABASE
    const playerRoute = playerRouteArray.join('-');

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
      type: 'Iterative',
      description: 'Greedy heuristic approach - always picks nearest unvisited city'
    });

    // Algorithm 2: Brute Force
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
      type: 'Recursive',
      description: 'Exhaustive search - tries all possible permutations recursively'
    });

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
      type: 'Iterative',
      description: 'Optimal solution using memoization - stores subproblem results'
    });

    // ✅ FIND OPTIMAL DISTANCE
    const optimalDistance = Math.min(...results.map(r => r.distance));
    const tolerance = 1;
    
    // ✅ CHECK IF PLAYER'S GUESS MATCHES OPTIMAL
    const isCorrect = Math.abs(playerGuessedDistance - optimalDistance) <= tolerance;

    // ✅ SAVE TO DATABASE - Use player's guessed distance
    await this.saveToDatabaseCall(
      playerName, 
      homeCity, 
      selectedCities, 
      playerRoute, 
      playerGuessedDistance,  // Save what they guessed
      isCorrect, 
      results
    );

    this.setState({
      algorithmResults: results,
      result: isCorrect ? 'win' : 'lose',
      gameState: 'result',
      isLoading: false,
      showRoute: true,
      currentAlgorithmIndex: 0,
      playerActualDistance: playerActualDistance, // Store for display
      playerGuessedDistance: playerGuessedDistance, // Store for display
      optimalDistance: optimalDistance // Store for display
    });

  } catch (err) {
    this.setState({ error: 'Error: ' + err.message, isLoading: false });
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
    playerRouteArray,  // ✅ CHANGE FROM playerRoute TO playerRouteArray
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

              {/* <div className="game-features">
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
              </div> */}
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

            
   {/* Result Phase */} 

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
                <h3>🎯 Your Challenge</h3>
                <p><strong>Step 1:</strong> Build your route visiting all cities<br/>
                  <strong>Step 2:</strong> Calculate and enter the shortest possible distance<br/>
                  <strong>Step 3:</strong> Submit and see if you found the optimal solution!</p>
              </div>

              {/* Route Builder Section */}
              <div className="route-builder-section">
                <h3>Build Your Route</h3>
                
                {/* Current Route Display */}
                <div className="current-route-display">
                  <div className="route-label">Current Route:</div>
                  <div className="route-cities">
                    {playerRouteArray.length === 0 ? (
                      <span className="route-empty">Start by selecting {homeCity}</span>
                    ) : (
                      playerRouteArray.map((city, index) => (
                        <React.Fragment key={index}>
                          <span className={`route-city ${city === homeCity ? 'home-city' : ''}`}>
                            {city}
                          </span>
                          {index < playerRouteArray.length - 1 && (
                            <span className="route-arrow">→</span>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                  
                  {/* Route Distance Calculator */}
                  {playerRouteArray.length >= 2 && (
                    <div className="route-distance-display">
                      <span className="distance-label">Your Route Distance:</span>
                      <span className="distance-value">{this.calculateRouteDistance()} km</span>
                    </div>
                  )}
                </div>

                {/* Route Building Controls */}
                <div className="route-controls">
                  <div className="control-row">
                    <label htmlFor="citySelect">Select next city:</label>
                    <select
                      id="citySelect"
                      className="city-select"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          this.addCityToRoute(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">-- Select City --</option>
                      {this.getAvailableCities().map(city => (
                        <option key={city} value={city}>
                          {city} {city === homeCity ? '(Home)' : ''}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => {
                        const select = document.getElementById('citySelect');
                        if (select.value) {
                          this.addCityToRoute(select.value);
                          select.value = '';
                        }
                      }}
                      className="btn-add-city"
                      disabled={this.getAvailableCities().length === 0}
                    >
                      Add
                    </button>
                  </div>

                  <div className="control-buttons">
                    <button
                      onClick={this.removeLastCity}
                      className="btn-secondary"
                      disabled={playerRouteArray.length === 0}
                    >
                      ← Remove Last
                    </button>
                    
                    <button
                      onClick={this.clearRoute}
                      className="btn-secondary"
                      disabled={playerRouteArray.length === 0}
                    >
                      🔄 Clear Route
                    </button>
                  </div>

                  <button
                    onClick={this.returnHome}
                    className="btn-return-home"
                    disabled={
                      playerRouteArray.length === 0 || 
                      playerRouteArray[playerRouteArray.length - 1] === homeCity
                    }
                  >
                    🏠 Return Home
                  </button>
                </div>

                {/* Route Completion Status */}
                <div className="route-status">
                  {this.isRouteComplete() ? (
                    <div className="status-complete">
                      ✅ Route Complete! Your route distance: {this.calculateRouteDistance()} km
                    </div>
                  ) : (
                    <div className="status-incomplete">
                      {playerRouteArray.length === 0 
                        ? '⚠️ Start building your route by selecting the home city'
                        : '⚠️ Route incomplete - visit all cities and return home'}
                    </div>
                  )}
                </div>
              </div>

              {/* Challenge: Enter Shortest Distance */}
              <div className="shortest-distance-challenge">
                <h3>💡 Now Calculate the Shortest Distance</h3>
                <p className="challenge-instruction">
                  Can you find a <strong>shorter route</strong> than your current route? 
                  Think about different orders and calculate the optimal distance!
                </p>
                
                <div className="input-group">
                  <label htmlFor="shortestDistance">What is the shortest possible distance? (km)</label>
                  <input
                    id="shortestDistance"
                    type="number"
                    value={playerAnswer}
                    onChange={(e) => this.setState({ playerAnswer: e.target.value, error: '' })}
                    placeholder="Enter your answer (e.g., 215)"
                    className="input-field"
                    min="0"
                    step="0.1"
                  />
                  <small className="hint">
                    💡 Hint: Your current route is {this.isRouteComplete() ? this.calculateRouteDistance() : '?'} km. 
                    Can you do better?
                  </small>
                </div>
              </div>

              {/* Distance Reference Table */}
              <div className="distance-reference">
                <h4>📏 Distance Reference</h4>
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
                disabled={isLoading || !this.isRouteComplete() || !playerAnswer}
              >
                {isLoading ? '⏳ Calculating...' : '✅ Submit Your Answer'}
              </button>

              <div className="helper-text" style={{ textAlign: 'center', marginTop: '10px' }}>
                {!this.isRouteComplete() 
                  ? 'Complete your route first' 
                  : !playerAnswer
                  ? 'Enter the shortest distance to submit'
                  : '✅ Ready to submit!'}
              </div>
            </div>
          )}

             
              {/* Result Phase - Tailwind Organized */}
{gameState === 'result' && (
  <div className="bg-slate-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-700/50">
    
    {/* Result Header */}
    <div className={`text-center rounded-2xl p-8 mb-6 ${
      result === 'win' 
        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50' 
        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-500/50'
    }`}>
      <h2 className="text-4xl font-bold mb-3">
        {result === 'win' ? '🎉 Correct!' : '❌ Incorrect'}
      </h2>
      <p className="text-slate-300 text-lg">
        {result === 'win' 
          ? 'Great job! You found the optimal route!' 
          : 'Not quite. Check the optimal solution below.'}
      </p>
    </div>

    {/* Player Performance Analysis */}
    <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-slate-700/30">
      <h3 className="text-2xl font-bold text-center text-white mb-6">
        📊 Your Performance
      </h3>
      
      {/* Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Your Route Distance */}
        <div className="bg-slate-800/60 rounded-xl p-5 text-center border-2 border-slate-700/40 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Your Route Distance
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mb-3">
            {this.state.playerActualDistance} km
          </div>
          <div className="text-sm text-slate-400 leading-relaxed min-h-[40px]">
            Route: {playerRouteArray.join(' → ')}
          </div>
        </div>
        
        {/* Your Guess */}
        <div className="bg-slate-800/60 rounded-xl p-5 text-center border-2 border-slate-700/40 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Your Guess
          </div>
          <div className="text-3xl font-extrabold text-blue-400 mb-3">
            {this.state.playerGuessedDistance} km
          </div>
          <div className="text-sm text-slate-400 leading-relaxed min-h-[40px]">
            {Math.abs(this.state.playerGuessedDistance - this.state.optimalDistance) <= 1 
              ? '🎯 Excellent guess!' 
              : `Off by ${Math.abs(this.state.playerGuessedDistance - this.state.optimalDistance).toFixed(1)} km`}
          </div>
        </div>
        
        {/* Optimal Distance */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-xl p-5 text-center border-2 border-emerald-500/50 hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300">
          <div className="text-xs uppercase tracking-wider text-emerald-300 mb-2 font-semibold">
            Optimal Distance
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mb-3">
            {this.state.optimalDistance} km
          </div>
          <div className="text-sm text-emerald-200/70 leading-relaxed min-h-[40px]">
            {this.state.playerActualDistance === this.state.optimalDistance 
              ? '✅ You found it!' 
              : `${(this.state.playerActualDistance - this.state.optimalDistance).toFixed(1)} km longer`}
          </div>
        </div>
      </div>

      {/* Insight Message */}
      <div className="text-center">
        {result === 'win' ? (
          <div className="bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-100 p-4 rounded-xl leading-relaxed">
            <strong className="text-white">🎉 Outstanding!</strong> You correctly identified the shortest distance!
            {this.state.playerActualDistance === this.state.optimalDistance && (
              <span> And you found the optimal route on your first try!</span>
            )}
          </div>
        ) : (
          <div className="bg-blue-500/20 border-2 border-blue-500/40 text-blue-100 p-4 rounded-xl leading-relaxed">
            <strong className="text-white">💡 Learning Opportunity:</strong> Compare your route with the optimal solutions below 
            to see how different algorithms approach this problem.
          </div>
        )}
      </div>
    </div>

    {/* Algorithm Tabs */}
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      {algorithmResults.map((algo, index) => (
        <button
          key={index}
          onClick={() => this.changeAlgorithmView(index)}
          className={`flex-1 min-w-fit px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
            currentAlgorithmIndex === index
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50 scale-105'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
          }`}
        >
          {algo.algorithm.split('(')[0]}
        </button>
      ))}
    </div>

    {/* Algorithm Details */}
    {currentRoute && (
      <>
        <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-slate-700/30">
          <h3 className="text-2xl font-bold text-center text-white mb-5">
            {currentRoute.algorithm}
          </h3>
          
          {/* Algorithm Description */}
          <div className="bg-slate-800/60 rounded-xl p-4 mb-5 border-l-4 border-violet-500">
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentRoute.description}
            </p>
          </div>
          
          {/* Result Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-slate-800/60 rounded-xl p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Distance</div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {currentRoute.distance} km
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Time</div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {currentRoute.time} ms
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Complexity</div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {currentRoute.complexity}
              </div>
            </div>
          </div>

          {/* Route Display */}
          <div className="bg-slate-800/60 rounded-xl p-4 mb-4">
            <strong className="block mb-3 text-slate-300">Route:</strong>
            <div className="text-white font-semibold text-lg break-words leading-relaxed">
              {currentRoute.routeString}
            </div>
          </div>

          {/* Algorithm Type Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/30 to-purple-500/30 border border-violet-500/50 text-white font-semibold text-sm">
            {currentRoute.type === 'Recursive' ? '🔄 Recursive Implementation' : '➡️ Iterative Implementation'}
          </div>
        </div>

        {/* Complexity Analysis Section */}
        <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-slate-700/30">
          <h4 className="text-xl font-bold text-center text-white mb-5">
            🔍 Complexity Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Complexity */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-violet-500/50 hover:-translate-y-1 transition-all duration-300">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Time Complexity
              </div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {currentRoute.complexity}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {currentRoute.algorithm.includes('Nearest') && 
                  'For each city, searches all remaining unvisited cities'}
                {currentRoute.algorithm.includes('Brute') && 
                  'Generates all (n-1)! permutations of cities to find optimal route'}
                {currentRoute.algorithm.includes('Dynamic') && 
                  'Uses bitmask (2ⁿ states) and checks n cities for each state'}
              </div>
            </div>
            
            {/* Space Complexity */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-violet-500/50 hover:-translate-y-1 transition-all duration-300">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Space Complexity
              </div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {currentRoute.algorithm.includes('Nearest') && 'O(n)'}
                {currentRoute.algorithm.includes('Brute') && 'O(n)'}
                {currentRoute.algorithm.includes('Dynamic') && 'O(n × 2ⁿ)'}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {currentRoute.algorithm.includes('Nearest') && 
                  'Stores only the current route and unvisited set'}
                {currentRoute.algorithm.includes('Brute') && 
                  'Recursion stack depth is at most n'}
                {currentRoute.algorithm.includes('Dynamic') && 
                  'Memoization table stores all visited states'}
              </div>
            </div>

            {/* Optimality */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-violet-500/50 hover:-translate-y-1 transition-all duration-300">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Optimality
              </div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {currentRoute.algorithm.includes('Nearest') && '❌ Approximate'}
                {currentRoute.algorithm.includes('Brute') && '✅ Optimal'}
                {currentRoute.algorithm.includes('Dynamic') && '✅ Optimal'}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {currentRoute.algorithm.includes('Nearest') && 
                  'Heuristic approach - may not find shortest path'}
                {currentRoute.algorithm.includes('Brute') && 
                  'Exhaustive search guarantees optimal solution'}
                {currentRoute.algorithm.includes('Dynamic') && 
                  'Systematic search with memoization guarantees optimality'}
              </div>
            </div>
          </div>
        </div>

        {/* Recursive vs Iterative Comparison */}
        <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-slate-700/30">
          <h4 className="text-xl font-bold text-center text-white mb-5">
            🔄 Recursive vs Iterative Comparison
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-violet-900/30">
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold border-b border-slate-700">
                    Algorithm
                  </th>
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold border-b border-slate-700">
                    Type
                  </th>
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold border-b border-slate-700">
                    Implementation Style
                  </th>
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold border-b border-slate-700">
                    Stack Usage
                  </th>
                </tr>
              </thead>
              <tbody>
                {algorithmResults.map((algo, idx) => (
                  <tr 
                    key={idx} 
                    className={`transition-colors border-b border-slate-800/50 hover:bg-violet-900/20 ${
                      idx === currentAlgorithmIndex ? 'bg-violet-900/30 border-l-4 border-l-violet-500' : ''
                    }`}
                  >
                    <td className="p-3 text-white font-medium">
                      {algo.algorithm.split('(')[0]}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        algo.type === 'Recursive' 
                          ? 'bg-pink-500/30 border border-pink-500/50 text-pink-200' 
                          : 'bg-blue-500/30 border border-blue-500/50 text-blue-200'
                      }`}>
                        {algo.type}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400 italic">
                      {algo.type === 'Recursive' ? 
                        'Uses function call stack, elegant but may cause stack overflow' :
                        'Uses explicit loops and data structures, more memory efficient'}
                    </td>
                    <td className="p-3 text-white">
                      {algo.type === 'Recursive' ? 'O(n) call stack' : 'O(1) stack'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}

    {/* Performance Comparison */}
    <div className="mb-6">
      <h4 className="text-xl font-bold text-slate-200 mb-4">📊 Performance Comparison</h4>
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-violet-900/40">
              <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold">Algorithm</th>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold">Type</th>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold">Distance (km)</th>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold">Time (ms)</th>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold">Complexity</th>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold">Optimal?</th>
            </tr>
          </thead>
          <tbody>
            {algorithmResults.map((algo, index) => (
              <tr 
                key={index} 
                onClick={() => this.changeAlgorithmView(index)}
                className={`cursor-pointer transition-all border-b border-slate-800/50 hover:bg-violet-900/20 ${
                  algo.distance === Math.min(...algorithmResults.map(a => a.distance)) 
                    ? 'bg-emerald-900/20 border-l-4 border-l-emerald-500' 
                    : ''
                }`}
              >
                <td className="p-3 text-white font-medium">{algo.algorithm}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    algo.type === 'Recursive' 
                      ? 'bg-pink-500/30 border border-pink-500/50 text-pink-200' 
                      : 'bg-blue-500/30 border border-blue-500/50 text-blue-200'
                  }`}>
                    {algo.type}
                  </span>
                </td>
                <td className="p-3 text-white font-bold">{algo.distance}</td>
                <td className="p-3 text-white">{algo.time}</td>
                <td className="p-3">
                  <code className="px-2 py-1 bg-slate-700/50 rounded text-violet-300 text-xs font-mono">
                    {algo.complexity}
                  </code>
                </td>
                <td className="p-3">
                  {algo.distance === Math.min(...algorithmResults.map(a => a.distance)) ? 
                    <span className="text-emerald-400 font-semibold">✅ Yes</span> : 
                    <span className="text-slate-500">❌ No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Key Insights */}
      <div className="mt-5 bg-slate-800/40 rounded-xl p-5 border-l-4 border-violet-500">
        <h5 className="text-white font-bold text-lg mb-3">💡 Key Insights:</h5>
        <ul className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <li className="border-b border-slate-700/50 pb-3">
            <strong className="text-white bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Brute Force (Recursive):</strong> Guarantees optimal solution but slowest - 
            Time grows factorially: 5 cities = 120 permutations, 10 cities = 3.6M permutations!
          </li>
          <li className="border-b border-slate-700/50 pb-3">
            <strong className="text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dynamic Programming (Iterative):</strong> Also optimal but much faster using memoization - 
            Stores intermediate results to avoid recalculation
          </li>
          <li className="border-b border-slate-700/50 pb-3">
            <strong className="text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Nearest Neighbor (Iterative):</strong> Fastest but approximate - 
            Good for quick estimates but may miss optimal route by 10-25%
          </li>
          <li>
            <strong className="text-white bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Recursive vs Iterative:</strong> Brute Force uses recursion (elegant, natural for permutations), 
            while DP and NN use iteration (explicit control, better for large inputs)
          </li>
        </ul>
      </div>
    </div>

    {/* Play Again Button */}
    <button 
      onClick={this.resetGame} 
      className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70 hover:-translate-y-1 transition-all duration-300"
    >
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