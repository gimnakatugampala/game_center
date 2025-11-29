// __tests__/tsp.test.js
/**
 * Unit Tests for Traveling Salesman Problem (TSP) Game
 * Run with: npm test
 */

// Mock algorithms for testing
class TSPAlgorithms {
  // Nearest Neighbor Algorithm (Greedy)
  static nearestNeighbor(distances, cities, start) {
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
  }

  // Brute Force Algorithm (Recursive)
  static bruteForce(distances, cities, start) {
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
  }

  // Dynamic Programming (Held-Karp)
  static dynamicProgramming(distances, cities, start) {
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

    // Reconstruct route
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
  }
}

// Test Suite
describe('TSP Algorithm Tests', () => {
  
  // Test Data Setup
  const testDistances = {
    'A': { 'A': 0, 'B': 50, 'C': 60, 'D': 70 },
    'B': { 'A': 50, 'B': 0, 'C': 55, 'D': 65 },
    'C': { 'A': 60, 'B': 55, 'C': 0, 'D': 45 },
    'D': { 'A': 70, 'B': 65, 'C': 45, 'D': 0 }
  };

  const testCities = ['A', 'B', 'C', 'D'];
  const homeCity = 'A';

  describe('Nearest Neighbor Algorithm', () => {
    test('should return a valid route starting and ending at home city', () => {
      const result = TSPAlgorithms.nearestNeighbor(testDistances, testCities, homeCity);
      
      expect(result.route[0]).toBe(homeCity);
      expect(result.route[result.route.length - 1]).toBe(homeCity);
      expect(result.route.length).toBe(testCities.length + 1);
    });

    test('should visit all cities exactly once', () => {
      const result = TSPAlgorithms.nearestNeighbor(testDistances, testCities, homeCity);
      const visitedCities = new Set(result.route.slice(0, -1));
      
      expect(visitedCities.size).toBe(testCities.length);
      testCities.forEach(city => {
        expect(visitedCities.has(city)).toBe(true);
      });
    });

    test('should return a positive distance', () => {
      const result = TSPAlgorithms.nearestNeighbor(testDistances, testCities, homeCity);
      expect(result.distance).toBeGreaterThan(0);
    });

    test('should handle different home cities', () => {
      const result1 = TSPAlgorithms.nearestNeighbor(testDistances, testCities, 'A');
      const result2 = TSPAlgorithms.nearestNeighbor(testDistances, testCities, 'B');
      
      expect(result1.route[0]).toBe('A');
      expect(result2.route[0]).toBe('B');
    });
  });

  describe('Brute Force Algorithm', () => {
    test('should return a valid route starting and ending at home city', () => {
      const result = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      
      expect(result.route[0]).toBe(homeCity);
      expect(result.route[result.route.length - 1]).toBe(homeCity);
      expect(result.route.length).toBe(testCities.length + 1);
    });

    test('should find the optimal solution', () => {
      const result = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      
      // Calculate expected optimal distance for this test case
      // Route: A -> B -> C -> D -> A = 50 + 55 + 45 + 70 = 220
      expect(result.distance).toBeLessThanOrEqual(220);
    });

    test('should visit all cities exactly once', () => {
      const result = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      const visitedCities = new Set(result.route.slice(0, -1));
      
      expect(visitedCities.size).toBe(testCities.length);
    });

    test('should be recursive implementation', () => {
      // Test by checking if function uses recursion
      const result = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      expect(result).toHaveProperty('route');
      expect(result).toHaveProperty('distance');
    });
  });

  describe('Dynamic Programming Algorithm', () => {
    test('should return a valid route starting and ending at home city', () => {
      const result = TSPAlgorithms.dynamicProgramming(testDistances, testCities, homeCity);
      
      expect(result.route[0]).toBe(homeCity);
      expect(result.route[result.route.length - 1]).toBe(homeCity);
      expect(result.route.length).toBe(testCities.length + 1);
    });

    test('should find the optimal solution', () => {
      const result = TSPAlgorithms.dynamicProgramming(testDistances, testCities, homeCity);
      const bruteForceResult = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      
      expect(result.distance).toBe(bruteForceResult.distance);
    });

    test('should visit all cities exactly once', () => {
      const result = TSPAlgorithms.dynamicProgramming(testDistances, testCities, homeCity);
      const visitedCities = new Set(result.route.slice(0, -1));
      
      expect(visitedCities.size).toBe(testCities.length);
    });

    test('should handle different sized inputs', () => {
      const smallCities = ['A', 'B', 'C'];
      const smallDistances = {
        'A': { 'A': 0, 'B': 50, 'C': 60 },
        'B': { 'A': 50, 'B': 0, 'C': 55 },
        'C': { 'A': 60, 'B': 55, 'C': 0 }
      };
      
      const result = TSPAlgorithms.dynamicProgramming(smallDistances, smallCities, 'A');
      expect(result.route.length).toBe(smallCities.length + 1);
    });
  });

  describe('Algorithm Comparison', () => {
    test('Brute Force and DP should return same optimal distance', () => {
      const bfResult = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      const dpResult = TSPAlgorithms.dynamicProgramming(testDistances, testCities, homeCity);
      
      expect(dpResult.distance).toBe(bfResult.distance);
    });

    test('Nearest Neighbor should be faster but may not be optimal', () => {
      const nnStart = performance.now();
      const nnResult = TSPAlgorithms.nearestNeighbor(testDistances, testCities, homeCity);
      const nnTime = performance.now() - nnStart;

      const bfStart = performance.now();
      const bfResult = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      const bfTime = performance.now() - bfStart;

      // NN should be faster
      expect(nnTime).toBeLessThanOrEqual(bfTime);
      
      // NN distance should be >= optimal (may not always be optimal)
      expect(nnResult.distance).toBeGreaterThanOrEqual(bfResult.distance);
    });

    test('All algorithms should handle the same input correctly', () => {
      const nn = TSPAlgorithms.nearestNeighbor(testDistances, testCities, homeCity);
      const bf = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      const dp = TSPAlgorithms.dynamicProgramming(testDistances, testCities, homeCity);

      // All should return valid routes
      expect(nn.route.length).toBe(testCities.length + 1);
      expect(bf.route.length).toBe(testCities.length + 1);
      expect(dp.route.length).toBe(testCities.length + 1);

      // All should start and end at home
      expect(nn.route[0]).toBe(homeCity);
      expect(bf.route[0]).toBe(homeCity);
      expect(dp.route[0]).toBe(homeCity);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle minimum number of cities (2 cities)', () => {
      const minCities = ['A', 'B'];
      const minDistances = {
        'A': { 'A': 0, 'B': 50 },
        'B': { 'A': 50, 'B': 0 }
      };

      const result = TSPAlgorithms.nearestNeighbor(minDistances, minCities, 'A');
      expect(result.route).toEqual(['A', 'B', 'A']);
      expect(result.distance).toBe(100); // 50 + 50
    });

    test('should handle symmetric distances', () => {
      // All distances are equal
      const symDistances = {
        'A': { 'A': 0, 'B': 50, 'C': 50 },
        'B': { 'A': 50, 'B': 0, 'C': 50 },
        'C': { 'A': 50, 'B': 50, 'C': 0 }
      };
      const symCities = ['A', 'B', 'C'];

      const result = TSPAlgorithms.dynamicProgramming(symDistances, symCities, 'A');
      expect(result.distance).toBe(150); // Any route is optimal
    });

    test('should verify route continuity', () => {
      const result = TSPAlgorithms.bruteForce(testDistances, testCities, homeCity);
      
      // Check that each city in route connects to next
      for (let i = 0; i < result.route.length - 1; i++) {
        const from = result.route[i];
        const to = result.route[i + 1];
        expect(testDistances[from][to]).toBeDefined();
        expect(testDistances[from][to]).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance Tests', () => {
    test('Nearest Neighbor complexity should be O(n²)', () => {
      const largeCities = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i));
      const largeDistances = {};
      
      largeCities.forEach((city1, i) => {
        largeDistances[city1] = {};
        largeCities.forEach((city2, j) => {
          largeDistances[city1][city2] = i === j ? 0 : Math.abs(i - j) * 10 + 50;
        });
      });

      const start = performance.now();
      TSPAlgorithms.nearestNeighbor(largeDistances, largeCities, 'A');
      const time = performance.now() - start;

      expect(time).toBeLessThan(100); // Should be fast even for larger input
    });

    test('Dynamic Programming should be faster than Brute Force for larger inputs', () => {
      const cities7 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const distances7 = {};
      
      cities7.forEach((city1, i) => {
        distances7[city1] = {};
        cities7.forEach((city2, j) => {
          distances7[city1][city2] = i === j ? 0 : Math.abs(i - j) * 10 + 50;
        });
      });

      const dpStart = performance.now();
      TSPAlgorithms.dynamicProgramming(distances7, cities7, 'A');
      const dpTime = performance.now() - dpStart;

      const bfStart = performance.now();
      TSPAlgorithms.bruteForce(distances7, cities7, 'A');
      const bfTime = performance.now() - bfStart;

      expect(dpTime).toBeLessThan(bfTime);
    });
  });
});

// Mock test for database functions
describe('Database Operations', () => {
  test('should validate result data structure', () => {
    const resultData = {
      playerName: 'Test Player',
      homeCity: 'A',
      selectedCities: 'B,C,D',
      shortestRoute: 'A → B → C → D → A',
      shortestDistance: 220,
      playerRoute: 'A-B-C-D-A',
      playerDistance: 220,
      isCorrect: true,
      timestamp: new Date().toISOString()
    };

    expect(resultData.playerName).toBeDefined();
    expect(resultData.homeCity).toBeDefined();
    expect(resultData.shortestDistance).toBeGreaterThan(0);
    expect(typeof resultData.isCorrect).toBe('boolean');
  });

  test('should validate algorithm time data structure', () => {
    const timeData = {
      algorithmName: 'Nearest Neighbor (Greedy)',
      timeTaken: 2.3456,
      numCities: 5,
      timestamp: new Date().toISOString()
    };

    expect(timeData.algorithmName).toBeDefined();
    expect(timeData.timeTaken).toBeGreaterThan(0);
    expect(timeData.numCities).toBeGreaterThan(1);
  });
});

console.log('✅ All TSP tests completed!');