const {
    fordFulkerson,
    edmondsKarp,
    createGraphFromCapacities,
    generateRandomCapacities
  } = require('../lib/maxFlowAlgorithms');
  
  describe('Maximum Flow Algorithms', () => {
    describe('createGraphFromCapacities', () => {
      test('should create a valid graph from capacities', () => {
        const capacities = {
          'A->B': 10,
          'A->C': 5,
          'A->D': 15,
          'B->E': 8,
          'B->F': 7,
          'C->E': 6,
          'C->F': 9,
          'D->F': 10,
          'E->G': 12,
          'E->H': 5,
          'F->H': 8,
          'G->T': 10,
          'H->T': 15
        };
  
        const graph = createGraphFromCapacities(capacities);
  
        expect(graph).toHaveProperty('A');
        expect(graph).toHaveProperty('T');
        expect(graph.A).toHaveProperty('B');
        expect(graph.A.B).toBe(10);
        expect(graph.A.C).toBe(5);
      });
  
      test('should handle missing edges', () => {
        const capacities = {
          'A->B': 10
        };
  
        const graph = createGraphFromCapacities(capacities);
        expect(graph.A.B).toBe(10);
        expect(graph.A.C).toBeUndefined();
      });
    });
  
    describe('generateRandomCapacities', () => {
      test('should generate all required edges', () => {
        const capacities = generateRandomCapacities();
        const requiredEdges = [
          'A->B', 'A->C', 'A->D',
          'B->E', 'B->F',
          'C->E', 'C->F',
          'D->F',
          'E->G', 'E->H',
          'F->H',
          'G->T', 'H->T'
        ];
  
        requiredEdges.forEach(edge => {
          expect(capacities).toHaveProperty(edge);
          expect(capacities[edge]).toBeGreaterThanOrEqual(5);
          expect(capacities[edge]).toBeLessThanOrEqual(15);
        });
      });
  
      test('should generate different capacities on multiple calls', () => {
        const capacities1 = generateRandomCapacities();
        const capacities2 = generateRandomCapacities();
        
        // There's a small chance they're the same, but very unlikely
        const allSame = Object.keys(capacities1).every(
          key => capacities1[key] === capacities2[key]
        );
        
        // If they happen to be the same, generate again
        if (allSame) {
          const capacities3 = generateRandomCapacities();
          const stillSame = Object.keys(capacities1).every(
            key => capacities1[key] === capacities3[key]
          );
          expect(stillSame).toBe(false);
        }
      });
    });
  
    describe('fordFulkerson', () => {
      test('should calculate maximum flow correctly for simple graph', () => {
        const capacities = {
          'A->B': 10,
          'A->C': 10,
          'B->T': 10,
          'C->T': 10
        };
  
        const graph = createGraphFromCapacities(capacities);
        const result = fordFulkerson(graph, 'A', 'T');
  
        expect(result.maxFlow).toBe(20);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });
  
      test('should handle single path graph', () => {
        const capacities = {
          'A->B': 5,
          'B->C': 3,
          'C->T': 4
        };
  
        const graph = createGraphFromCapacities(capacities);
        const result = fordFulkerson(graph, 'A', 'T');
  
        // Bottleneck is 3
        expect(result.maxFlow).toBe(3);
      });
  
      test('should handle complex traffic network', () => {
        const capacities = {
          'A->B': 10,
          'A->C': 5,
          'A->D': 15,
          'B->E': 8,
          'B->F': 7,
          'C->E': 6,
          'C->F': 9,
          'D->F': 10,
          'E->G': 12,
          'E->H': 5,
          'F->H': 8,
          'G->T': 10,
          'H->T': 15
        };
  
        const graph = createGraphFromCapacities(capacities);
        const result = fordFulkerson(graph, 'A', 'T');
  
        expect(result.maxFlow).toBeGreaterThan(0);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });
  
      test('should throw error for invalid graph', () => {
        const invalidGraph = null;
        expect(() => {
          fordFulkerson(invalidGraph, 'A', 'T');
        }).toThrow();
      });
    });
  
    describe('edmondsKarp', () => {
      test('should calculate maximum flow correctly for simple graph', () => {
        const capacities = {
          'A->B': 10,
          'A->C': 10,
          'B->T': 10,
          'C->T': 10
        };
  
        const graph = createGraphFromCapacities(capacities);
        const result = edmondsKarp(graph, 'A', 'T');
  
        expect(result.maxFlow).toBe(20);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });
  
      test('should handle single path graph', () => {
        const capacities = {
          'A->B': 5,
          'B->C': 3,
          'C->T': 4
        };
  
        const graph = createGraphFromCapacities(capacities);
        const result = edmondsKarp(graph, 'A', 'T');
  
        // Bottleneck is 3
        expect(result.maxFlow).toBe(3);
      });
  
      test('should handle complex traffic network', () => {
        const capacities = {
          'A->B': 10,
          'A->C': 5,
          'A->D': 15,
          'B->E': 8,
          'B->F': 7,
          'C->E': 6,
          'C->F': 9,
          'D->F': 10,
          'E->G': 12,
          'E->H': 5,
          'F->H': 8,
          'G->T': 10,
          'H->T': 15
        };
  
        const graph = createGraphFromCapacities(capacities);
        const result = edmondsKarp(graph, 'A', 'T');
  
        expect(result.maxFlow).toBeGreaterThan(0);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });
    });
  
    describe('Algorithm Consistency', () => {
      test('both algorithms should give same result for same graph', () => {
        const capacities = {
          'A->B': 10,
          'A->C': 5,
          'A->D': 15,
          'B->E': 8,
          'B->F': 7,
          'C->E': 6,
          'C->F': 9,
          'D->F': 10,
          'E->G': 12,
          'E->H': 5,
          'F->H': 8,
          'G->T': 10,
          'H->T': 15
        };
  
        const graph = createGraphFromCapacities(capacities);
        const ffResult = fordFulkerson(graph, 'A', 'T');
        const ekResult = edmondsKarp(graph, 'A', 'T');
  
        expect(ffResult.maxFlow).toBe(ekResult.maxFlow);
      });
  
      test('both algorithms should give same result for multiple random graphs', () => {
        for (let i = 0; i < 5; i++) {
          const capacities = generateRandomCapacities();
          const graph = createGraphFromCapacities(capacities);
          const ffResult = fordFulkerson(graph, 'A', 'T');
          const ekResult = edmondsKarp(graph, 'A', 'T');
  
          expect(ffResult.maxFlow).toBe(ekResult.maxFlow);
        }
      });
    });
  });
  
  