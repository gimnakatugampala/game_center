/**
 * Generates random edge capacities for the traffic network graph
 * @returns {Object} Object with edge capacities between 5 and 15
 */
export function generateRandomCapacities() {
  const capacities = {};
  const edges = [
    "A->B",
    "A->C",
    "A->D",
    "B->E",
    "B->F",
    "C->E",
    "C->F",
    "D->F",
    "E->G",
    "E->H",
    "F->H",
    "G->T",
    "H->T",
  ];

  edges.forEach((edge) => {
    capacities[edge] = Math.floor(Math.random() * 11) + 5;
  });

  return capacities;
}

/**
 * Creates a graph structure from edge capacities
 * @param {Object} capacities - Object mapping edges to capacities
 * @returns {Object} Graph structure with nodes and edges
 */
export function createGraphFromCapacities(capacities) {
  const graph = {};

  for (const [edge, capacity] of Object.entries(capacities)) {
    const [from, to] = edge.split('->');

    if (!graph[from]) {
      graph[from] = {};
    }
    graph[from][to] = capacity;

    // Ensure destination node exists in graph (even if it has no outgoing edges)
    if (!graph[to]) {
      graph[to] = {};
    }
  }

  return graph;
}

/**
 * Ford-Fulkerson algorithm for finding maximum flow (DFS-based)
 * @param {Object} graph - Graph structure
 * @param {string} source - Source node
 * @param {string} sink - Sink node
 * @returns {Object} Maximum flow and execution time
 */
export function fordFulkerson(graph, source, sink) {
  if (!graph || typeof graph !== 'object') {
    throw new Error('Invalid graph');
  }
  if (typeof source !== 'string' || typeof sink !== 'string') {
    throw new Error('Invalid source or sink');
  }
  // If source/sink not present as keys, algorithm can't proceed
  if (!Object.prototype.hasOwnProperty.call(graph, source) ||
      !Object.prototype.hasOwnProperty.call(graph, sink)) {
    throw new Error('Graph must contain source and sink nodes');
  }
  const startTime = performance.now();

  const residual = {};
  for (const node in graph) {
    residual[node] = { ...graph[node] };
  }

  let maxFlow = 0;
  let path = [];

  /**
   * Depth-first search to find augmenting path
   * @param {string} current - Current node
   * @param {Set} visited - Set of visited nodes
   * @param {Array} pathSoFar - Current path
   * @returns {boolean} True if path to sink found
   */
  function dfs(current, visited, pathSoFar) {
    if (current === sink) {
      path = [...pathSoFar];
      return true;
    }

    visited.add(current);

    const neighbors = residual[current] || {};
    for (const neighbor in neighbors) {
      if (!visited.has(neighbor) && neighbors[neighbor] > 0) {
        if (
          dfs(neighbor, visited, [
            ...pathSoFar,
            { from: current, to: neighbor },
          ])
        ) {
          return true;
        }
      }
    }

    return false;
  }

  while (true) {
    const visited = new Set();
    path = [];

    if (!dfs(source, visited, [])) {
      break;
    }

    let minCapacity = Infinity;
    for (const edge of path) {
      minCapacity = Math.min(minCapacity, residual[edge.from][edge.to]);
    }

    for (const edge of path) {
      residual[edge.from][edge.to] -= minCapacity;
      if (!residual[edge.to]) {
        residual[edge.to] = {};
      }
      residual[edge.to][edge.from] =
        (residual[edge.to][edge.from] || 0) + minCapacity;
    }

    maxFlow += minCapacity;
  }

  const endTime = performance.now();
  return {
    maxFlow,
    executionTime: endTime - startTime,
  };
}

/**
 * Edmonds-Karp algorithm for finding maximum flow (BFS-based)
 * Uses breadth-first search to find shortest augmenting paths
 * @param {Object} graph - Graph structure
 * @param {string} source - Source node
 * @param {string} sink - Sink node
 * @returns {Object} Maximum flow and execution time
 */
export function edmondsKarp(graph, source, sink) {
  const startTime = performance.now();

  const residual = {};
  for (const node in graph) {
    residual[node] = { ...graph[node] };
  }

  let maxFlow = 0;

  /**
   * Breadth-first search to find shortest augmenting path
   * @returns {boolean} True if augmenting path found
   */
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
            const path = [];
            let node = sink;
            while (node !== source) {
              const prev = parent[node];
              path.unshift({ from: prev, to: node });
              node = prev;
            }

            let minCapacity = Infinity;
            for (const edge of path) {
              minCapacity = Math.min(minCapacity, residual[edge.from][edge.to]);
            }

            for (const edge of path) {
              residual[edge.from][edge.to] -= minCapacity;
              if (!residual[edge.to]) {
                residual[edge.to] = {};
              }
              residual[edge.to][edge.from] =
                (residual[edge.to][edge.from] || 0) + minCapacity;
            }

            maxFlow += minCapacity;
            return true;
          }
        }
      }
    }

    return false;
  }

  while (bfs()) {}

  const endTime = performance.now();
  return {
    maxFlow,
    executionTime: endTime - startTime,
  };
}
