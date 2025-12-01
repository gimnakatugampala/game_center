// src/app/games/tsp/page.js
'use client';

import React, { Component } from 'react';
import InteractiveMap from '../../components/tsp/InteractiveMap';

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
      playerRouteArray: [],
      result: null,
      algorithmResults: [],
      error: '',
      isLoading: false,
      showRoute: false,
      animatingRoute: false,
      currentAlgorithmIndex: 0,
      gameStartTime: null,
      sessionId: null
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

  addCityToRoute = (city) => {
    const { playerRouteArray, homeCity, selectedCities } = this.state;
    
    const allowedCities = [homeCity, ...selectedCities];
    if (!allowedCities.includes(city)) {
      this.setState({ error: 'Can only add selected cities to route' });
      setTimeout(() => this.setState({ error: '' }), 2000);
      return;
    }
    
    if (playerRouteArray.includes(city) && city !== homeCity) {
      this.setState({ error: `City ${city} already in route` });
      setTimeout(() => this.setState({ error: '' }), 2000);
      return;
    }
    
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

  removeLastCity = () => {
    const { playerRouteArray } = this.state;
    if (playerRouteArray.length > 0) {
      this.setState({
        playerRouteArray: playerRouteArray.slice(0, -1),
        error: ''
      });
    }
  };

  returnHome = () => {
    const { playerRouteArray, homeCity, selectedCities } = this.state;
    
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

  clearRoute = () => {
    this.setState({
      playerRouteArray: [],
      error: ''
    });
  };

  getAvailableCities = () => {
    const { playerRouteArray, homeCity, selectedCities } = this.state;
    const visitedCities = new Set(playerRouteArray);
    
    if (playerRouteArray.length === 0) {
      return [homeCity];
    }
    
    const remainingCities = selectedCities.filter(c => !visitedCities.has(c));
    if (remainingCities.length === 0) {
      return [homeCity];
    }
    
    return remainingCities;
  };

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

  isRouteComplete = () => {
    const { playerRouteArray, homeCity, selectedCities } = this.state;
    
    if (playerRouteArray.length < 3) return false;
    if (playerRouteArray[0] !== homeCity) return false;
    if (playerRouteArray[playerRouteArray.length - 1] !== homeCity) return false;
    
    const visitedCities = playerRouteArray.slice(1, -1);
    const uniqueVisited = new Set(visitedCities);
    
    return selectedCities.every(city => uniqueVisited.has(city)) && 
           visitedCities.length === selectedCities.length;
  };

  saveToDatabaseCall = async (playerName, homeCity, selectedCities, playerRoute, playerDistance, isCorrect, algorithmResults) => {
    try {
      console.log('💾 Saving game data to database...');
      
      const gameData = {
        playerName: playerName.trim(),
        homeCity: homeCity,
        selectedCities: selectedCities,
        distances: this.state.distances,
        playerRoute: playerRoute,
        playerDistance: playerDistance,
        algorithmResults: algorithmResults,
        startTime: this.state.gameStartTime || new Date().toISOString(),
        endTime: new Date().toISOString()
      };

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
      this.setState({ sessionId: result.sessionId });
      
      return result;

    } catch (error) {
      console.error('❌ Error saving game data:', error);
      this.setState({ 
        error: 'Warning: Failed to save to database. Game continues...' 
      });
      setTimeout(() => {
        this.setState({ error: '' });
      }, 3000);
      
      return null;
    }
  };

  calculateDistance = (pos1, pos2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    
    const maxPixelDistance = Math.sqrt(800 * 800 + 600 * 600);
    const normalizedDistance = pixelDistance / maxPixelDistance;
    const distance = Math.floor(normalizedDistance * 50) + 50;
    
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
          const dist = this.calculateDistance(positions[city1], positions[city2]);
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
      await fetch('/api/tsp/save-player', {
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
      const newPositions = this.generateCityPositions();
      const newDistances = this.generateRandomDistances(newPositions);
      const newHomeCity = this.getRandomHomeCity();
      
      this.setState({
        distances: newDistances,
        cityPositions: newPositions,
        homeCity: newHomeCity,
        selectedCities: [],
        playerAnswer: '',
        playerRouteArray: [],
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
    
    this.setState({ 
      gameState: 'playing', 
      error: '',
      gameStartTime: new Date().toISOString()
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

  submitAnswer = async () => {
    try {
      this.setState({ isLoading: true, error: '' });

      const { playerAnswer, playerRouteArray, homeCity, selectedCities, distances, playerName } = this.state;

      if (!playerAnswer.trim()) {
        this.setState({ error: 'Please enter the shortest distance', isLoading: false });
        return;
      }

      const playerGuessedDistance = parseFloat(playerAnswer);
      if (isNaN(playerGuessedDistance) || playerGuessedDistance <= 0) {
        this.setState({ error: 'Please enter a valid positive number', isLoading: false });
        return;
      }

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

      const playerActualDistance = this.calculateRouteDistance();
      const playerRoute = playerRouteArray.join('-');

      const citiesToVisit = [homeCity, ...selectedCities];
      const results = [];

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

      const optimalDistance = Math.min(...results.map(r => r.distance));
      const tolerance = 1;
      const isCorrect = Math.abs(playerGuessedDistance - optimalDistance) <= tolerance;

      await this.saveToDatabaseCall(
        playerName, 
        homeCity, 
        selectedCities, 
        playerRoute, 
        playerGuessedDistance,
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
        playerActualDistance: playerActualDistance,
        playerGuessedDistance: playerGuessedDistance,
        optimalDistance: optimalDistance
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
      playerRouteArray,
      result,
      algorithmResults,
      error,
      isLoading,
      showRoute,
      currentAlgorithmIndex
    } = this.state;

    const currentRoute = algorithmResults[currentAlgorithmIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans text-white">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fadeInDown">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_30px_rgba(102,126,234,0.5)]">
            🗺️ Traveling Salesman Problem
          </h1>
          <p className="text-lg text-slate-400 mt-3">
            Find the shortest route through all cities
          </p>
        </div>

        {/* Welcome Screen */}
        {gameState === 'welcome' && (
          <div className="flex justify-center items-center min-h-[70vh] px-5 py-10">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-[30px] p-12 max-w-2xl w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)] border-2 border-indigo-500/30 text-center animate-fadeInUp">
              
              <div className="text-8xl mb-5 animate-wave">👋</div>

              <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                Welcome to TSP Game!
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed mb-10">
                Challenge yourself to find the shortest path through multiple cities. 
                Test your problem-solving skills against three powerful algorithms!
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
                  onChange={this.handleNameChange}
                  placeholder="Your name..."
                  className="w-full px-6 py-4 border-3 border-indigo-500/40 rounded-2xl bg-black/50 text-white text-xl text-center transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_30px_rgba(102,126,234,0.5)] focus:bg-black/70 focus:scale-[1.02] placeholder:text-slate-500"
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
                className="w-full px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_15px_40px_rgba(102,126,234,0.5)] hover:translate-y-[-3px] hover:shadow-[0_20px_50px_rgba(102,126,234,0.7)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
                disabled={!playerName.trim()}
              >
                Start Game →
              </button>
            </div>
          </div>
        )}

        {/* Game Content */}
        {gameState !== 'welcome' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 max-w-[1400px] mx-auto">
            
            {/* Player Info Bar */}
            <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-indigo-500/20">
              <span className="text-lg text-slate-300">
                👤 Playing as: <strong className="text-white bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent text-xl font-extrabold">
                  {playerName}
                </strong>
              </span>
            </div>

            {/* Interactive Map */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10">
              <div className="relative w-full flex justify-center items-center">
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
            </div>

            {/* Controls Section */}
            <div className="flex flex-col">
              
              {/* City Selection Phase */}
              {gameState === 'select_cities' && (
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 animate-slideInRight">
                  
                  <div className="text-center mb-6 pb-5 border-b-2 border-white/10">
                    <h2 className="text-3xl font-bold m-0 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                      Setup Game
                    </h2>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 mb-5 border border-blue-500/20">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-slate-400">Home City:</span>
                      <span className="font-bold text-white text-lg px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-[0_4px_15px_rgba(255,215,0,0.4)]">
                        {homeCity}
                      </span>
                    </div>
                  </div>

                  <div className="my-6">
                    <h3 className="mb-3 text-white text-xl font-bold">
                      Select Cities to Visit
                    </h3>
                    <p className="text-sm text-slate-400 italic mb-4">
                      Click on cities in the map or buttons below
                    </p>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-5">
                      {CITIES.map(city => (
                        <button
                          key={city}
                          onClick={() => this.toggleCitySelection(city)}
                          className={`
                            px-2.5 py-4 border-2 rounded-xl text-white text-base font-semibold cursor-pointer transition-all duration-300 relative overflow-hidden
                            ${city === homeCity 
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-400 text-black cursor-not-allowed opacity-70' 
                              : selectedCities.includes(city)
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 shadow-[0_5px_20px_rgba(102,126,234,0.5)]'
                              : 'bg-black/40 border-blue-500/30 hover:translate-y-[-3px] hover:shadow-[0_10px_25px_rgba(102,126,234,0.4)] hover:border-indigo-500'
                            }
                          `}
                          disabled={city === homeCity}
                        >
                          <span className="text-xl font-extrabold">{city}</span>
                          {city === homeCity && (
                            <span className="block text-[0.7rem] mt-1 opacity-90">Home</span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="bg-black/30 rounded-xl p-4 border border-blue-500/20">
                      <strong className="block mb-2 text-slate-300">Selected Cities:</strong>
                      <div className="text-lg text-white mb-1 min-h-[24px]">
                        {selectedCities.length > 0 ? selectedCities.join(', ') : 'None'}
                      </div>
                      <small className="text-slate-500 text-sm">
                        ({selectedCities.length} selected, minimum 2 required)
                      </small>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 my-4 text-red-300 font-semibold animate-shake">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={this.startGame} 
                    className="w-full px-6 py-4 border-none rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(102,126,234,0.4)] relative overflow-hidden hover:translate-y-[-2px] hover:shadow-[0_15px_40px_rgba(102,126,234,0.6)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                    disabled={selectedCities.length < 2}
                  >
                    Start Challenge →
                  </button>
                </div>
              )}

              {/* Playing Phase */}
              {gameState === 'playing' && (
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 animate-slideInRight">
                  
                  <div className="text-center mb-6 pb-5 border-b-2 border-white/10">
                    <h2 className="text-3xl font-bold m-0 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                      Your Challenge
                    </h2>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 mb-5 border border-blue-500/20">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-slate-400">Home:</span>
                      <span className="font-bold text-white text-lg">{homeCity}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-slate-400">Visit:</span>
                      <span className="font-bold text-white text-lg">{selectedCities.join(', ')}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl p-5 mb-6 border-2 border-indigo-500/30 text-center">
                    <h3 className="m-0 mb-2.5 text-xl bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                      🎯 Your Challenge
                    </h3>
                    <p className="m-0 text-slate-300 leading-relaxed text-sm">
                      <strong>Step 1:</strong> Build your route visiting all cities<br/>
                      <strong>Step 2:</strong> Calculate and enter the shortest possible distance<br/>
                      <strong>Step 3:</strong> Submit and see if you found the optimal solution!
                    </p>
                  </div>

                  {/* Route Builder Section */}
                  <div className="my-6 p-5 bg-black/30 rounded-xl border border-blue-500/20">
                    <h3 className="mb-5 text-white text-xl text-center font-bold">
                      Build Your Route
                    </h3>
                    
                    {/* Current Route Display */}
                    <div className="bg-black/40 rounded-xl p-4 mb-5 min-h-[80px]">
                      <div className="text-sm text-slate-400 mb-2.5 font-semibold">
                        Current Route:
                      </div>
                      <div className="flex items-center flex-wrap gap-2.5 min-h-[40px]">
                        {playerRouteArray.length === 0 ? (
                          <span className="text-slate-500 italic text-sm">
                            Start by selecting {homeCity}
                          </span>
                        ) : (
                          playerRouteArray.map((city, index) => (
                            <React.Fragment key={index}>
                              <span className={`
                                inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg text-white font-bold text-lg
                                ${city === homeCity 
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-[0_4px_12px_rgba(255,215,0,0.4)]'
                                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_4px_12px_rgba(102,126,234,0.4)]'
                                }
                              `}>
                                {city}
                              </span>
                              {index < playerRouteArray.length - 1 && (
                                <span className="text-indigo-500 text-2xl font-bold">→</span>
                              )}
                            </React.Fragment>
                          ))
                        )}
                      </div>
                      
                      {playerRouteArray.length >= 2 && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-semibold">
                            Your Route Distance:
                          </span>
                          <span className="text-white text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                            {this.calculateRouteDistance()} km
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Route Building Controls */}
                    <div className="flex flex-col gap-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-2.5 items-center">
                        <label htmlFor="citySelect" className="text-slate-300 font-semibold text-sm whitespace-nowrap">
                          Select next city:
                        </label>
                        <select
                          id="citySelect"
                          className="px-4 py-2.5 border-2 border-blue-500/30 rounded-lg bg-black/40 text-white text-base font-semibold cursor-pointer transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(102,126,234,0.3)] focus:bg-black/60"
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
                            <option key={city} value={city} className="bg-slate-900 text-white p-2.5">
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
                          className="px-5 py-2.5 border-none rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold cursor-pointer transition-all duration-300 whitespace-nowrap hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={this.getAvailableCities().length === 0}
                        >
                          Add
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                        <button
                          onClick={this.removeLastCity}
                          className="px-5 py-3 border-2 border-red-500/50 rounded-lg bg-red-500/20 text-white font-bold cursor-pointer transition-all duration-300 hover:bg-red-500/30 hover:border-red-500 hover:translate-y-[-2px] disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={playerRouteArray.length === 0}
                        >
                          ← Remove Last
                        </button>
                        
                        <button
                          onClick={this.clearRoute}
                          className="px-5 py-3 border-2 border-red-500/50 rounded-lg bg-red-500/20 text-white font-bold cursor-pointer transition-all duration-300 hover:bg-red-500/30 hover:border-red-500 hover:translate-y-[-2px] disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={playerRouteArray.length === 0}
                        >
                          🔄 Clear Route
                        </button>
                      </div>

                      <button
                        onClick={this.returnHome}
                        className="w-full px-5 py-3 border-2 border-yellow-400/50 rounded-lg bg-yellow-400/20 text-white font-bold cursor-pointer transition-all duration-300 hover:bg-yellow-400/30 hover:border-yellow-400 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(255,215,0,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={
                          playerRouteArray.length === 0 || 
                          playerRouteArray[playerRouteArray.length - 1] === homeCity
                        }
                      >
                        🏠 Return Home
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      {this.isRouteComplete() ? (
                        <div className="p-4 bg-green-500/20 border-2 border-green-500/50 rounded-xl text-green-300 font-bold text-lg animate-pulseSuccess">
                          ✅ Route Complete! Your route distance: {this.calculateRouteDistance()} km
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-500/20 border-2 border-yellow-400/50 rounded-lg text-yellow-300 font-bold text-sm">
                          {playerRouteArray.length === 0 
                            ? '⚠️ Start building your route by selecting the home city'
                            : '⚠️ Route incomplete - visit all cities and return home'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Distance Challenge Section */}
                  <div className="bg-black/30 rounded-xl p-5 my-5 border-2 border-yellow-400/30">
                    <h3 className="m-0 mb-4 text-yellow-400 text-xl text-center font-bold">
                      💡 Now Calculate the Shortest Distance
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-5 text-center px-4 py-4 bg-yellow-400/10 rounded-lg">
                      Can you find a <strong className="text-yellow-400 font-bold">shorter route</strong> than your current route? 
                      Think about different orders and calculate the optimal distance!
                    </p>
                    
                    <div className="mb-5">
                      <label 
                        htmlFor="shortestDistance" 
                        className="block mb-2 font-semibold text-slate-300 text-sm"
                      >
                        What is the shortest possible distance? (km)
                      </label>
                      <input
                        id="shortestDistance"
                        type="number"
                        value={playerAnswer}
                        onChange={(e) => this.setState({ playerAnswer: e.target.value, error: '' })}
                        placeholder="Enter your answer (e.g., 215)"
                        className="w-full px-4 py-3 border-2 border-blue-500/30 rounded-xl bg-black/40 text-white text-base transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(102,126,234,0.3)] focus:bg-black/60"
                        min="0"
                        step="0.1"
                      />
                      <small className="block mt-1 text-sm text-slate-500 italic">
                        💡 Hint: Your current route is {this.isRouteComplete() ? this.calculateRouteDistance() : '?'} km. 
                        Can you do better?
                      </small>
                    </div>
                  </div>

                  {/* Distance Reference Table */}
                  <div className="mb-6">
                    <h4 className="mb-2.5 text-white text-lg font-bold">
                      📏 Distance Reference
                    </h4>
                    <div className="max-h-[200px] overflow-y-auto rounded-xl bg-black/30 p-2.5 scrollbar-thin scrollbar-thumb-indigo-500/50 scrollbar-track-black/20">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-indigo-500/20 sticky top-0">
                          <tr>
                            <th className="p-2.5 text-center border-b border-white/10 font-bold text-slate-300 text-xs uppercase tracking-wide">
                              From
                            </th>
                            <th className="p-2.5 text-center border-b border-white/10 font-bold text-slate-300 text-xs uppercase tracking-wide">
                              To
                            </th>
                            <th className="p-2.5 text-center border-b border-white/10 font-bold text-slate-300 text-xs uppercase tracking-wide">
                              Distance (km)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[homeCity, ...selectedCities].map(from => 
                            [homeCity, ...selectedCities]
                              .filter(to => from !== to)
                              .map(to => (
                                <tr key={`${from}-${to}`} className="transition-colors duration-200 hover:bg-indigo-500/10">
                                  <td className="p-2.5 text-center border-b border-white/10 text-white">
                                    {from}
                                  </td>
                                  <td className="p-2.5 text-center border-b border-white/10 text-white">
                                    {to}
                                  </td>
                                  <td className="p-2.5 text-center border-b border-white/10 text-white">
                                    {distances[from]?.[to]}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 my-4 text-red-300 font-semibold animate-shake">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={this.submitAnswer} 
                    className="w-full px-6 py-4 border-none rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(102,126,234,0.4)] relative overflow-hidden hover:translate-y-[-2px] hover:shadow-[0_15px_40px_rgba(102,126,234,0.6)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                    disabled={isLoading || !this.isRouteComplete() || !playerAnswer}
                  >
                    {isLoading ? '⏳ Calculating...' : '✅ Submit Your Answer'}
                  </button>

                  <div className="text-sm text-slate-400 italic text-center mt-2.5">
                    {!this.isRouteComplete() 
                      ? 'Complete your route first' 
                      : !playerAnswer
                      ? 'Enter the shortest distance to submit'
                      : '✅ Ready to submit!'}
                  </div>

                </div>
              )}

              // Continuation Part 2 - Result Phase

              {/* Result Phase */}
              {gameState === 'result' && (
                <div className="bg-slate-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-700/50">
                  
                  {/* Result Header */}
                  <div className={`
                    text-center rounded-2xl p-8 mb-6
                    ${result === 'win' 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50' 
                      : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-500/50'
                    }
                  `}>
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
                        className={`
                          flex-1 min-w-fit px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap
                          ${currentAlgorithmIndex === index
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50 scale-105'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                          }
                        `}
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

                  // Final Part - Performance Comparison and Closing

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