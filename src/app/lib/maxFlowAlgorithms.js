// src/app/lib/maxFlowAlgorithms.js

// Generate random capacities for the traffic network
export function generateRandomCapacities() {
  const capacities = {};
  const edges = [
    'A->B', 'A->C', 'A->D',
    'B->E', 'B->F',
    'C->E', 'C->F',
    'D->F',
    'E->G', 'E->H',
    'F->H',
    'G->T', 'H->T'
  ];

  edges.forEach(edge => {
    // Generate random capacity between 5 and 15
    capacities[edge] = Math.floor(Math.random() * 11) + 5;
  });

  return capacities;
}

// Create graph structure from capacities
export function createGraphFromCapacities(capacities) {
  const graph = {};

  for (const [edge, capacity] of Object.entries(capacities)) {
    const [from, to] = edge.split('->');
    
    if (!graph[from]) {
      graph[from] = {};
    }
    graph[from][to] = capacity;
  }

  return graph;
}

// Ford-Fulkerson algorithm (DFS-based)
export function fordFulkerson(graph, source, sink) {
  const startTime = performance.now();
  
  // Create residual graph
  const residual = {};
  for (const node in graph) {
    residual[node] = { ...graph[node] };
  }

  let maxFlow = 0;
  let path = [];

  // DFS to find augmenting path
  function dfs(current, visited, pathSoFar) {
    if (current === sink) {
      path = [...pathSoFar];
      return true;
    }

    visited.add(current);

    const neighbors = residual[current] || {};
    for (const neighbor in neighbors) {
      if (!visited.has(neighbor) && neighbors[neighbor] > 0) {
        if (dfs(neighbor, visited, [...pathSoFar, { from: current, to: neighbor }])) {
          return true;
        }
      }
    }

    return false;
  }

  // Find augmenting paths and update flow
  while (true) {
    const visited = new Set();
    path = [];
    
    if (!dfs(source, visited, [])) {
      break;
    }

    // Find minimum capacity in the path
    let minCapacity = Infinity;
    for (const edge of path) {
      minCapacity = Math.min(minCapacity, residual[edge.from][edge.to]);
    }

    // Update residual graph
    for (const edge of path) {
      residual[edge.from][edge.to] -= minCapacity;
      if (!residual[edge.to]) {
        residual[edge.to] = {};
      }
      residual[edge.to][edge.from] = (residual[edge.to][edge.from] || 0) + minCapacity;
    }

    maxFlow += minCapacity;
  }

  const endTime = performance.now();
  return {
    maxFlow,
    executionTime: endTime - startTime
  };
}

// Edmonds-Karp algorithm (BFS-based)
export function edmondsKarp(graph, source, sink) {
  const startTime = performance.now();
  
  // Create residual graph
  const residual = {};
  for (const node in graph) {
    residual[node] = { ...graph[node] };
  }

  let maxFlow = 0;

  // BFS to find shortest augmenting path
  function bfs() {
    const queue = [source];
    const parent = {};
    const visited = new Set([source]);

    while (queue.length > 0) {
      const current = queue.shift();

      const neighbors = residual[current] || {};
      for (const neighbor in neighbors) {
        if (!visited.has(neighbor) && neighbors[neighbor] > 0) {
          visited.add(neighbor);
          parent[neighbor] = current;
          queue.push(neighbor);

          if (neighbor === sink) {
            // Reconstruct path
            const path = [];
            let node = sink;
            while (node !== source) {
              const prev = parent[node];
              path.unshift({ from: prev, to: node });
              node = prev;
            }

            // Find minimum capacity
            let minCapacity = Infinity;
            for (const edge of path) {
              minCapacity = Math.min(minCapacity, residual[edge.from][edge.to]);
            }

            // Update residual graph
            for (const edge of path) {
              residual[edge.from][edge.to] -= minCapacity;
              if (!residual[edge.to]) {
                residual[edge.to] = {};
              }
              residual[edge.to][edge.from] = (residual[edge.to][edge.from] || 0) + minCapacity;
            }

            maxFlow += minCapacity;
            return true;
          }
        }
      }
    }

    return false;
  }

  // Find augmenting paths
  while (bfs()) {
    // Continue until no more augmenting paths
  }

  const endTime = performance.now();
  return {
    maxFlow,
    executionTime: endTime - startTime
  };
}

