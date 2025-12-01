// src/app/api/tsg/calculate-flow/route.js
import { NextResponse } from 'next/server';
import { fordFulkerson, edmondsKarp, createGraphFromCapacities } from '../../../lib/maxFlowAlgorithms';

export async function POST(request) {
  try {
    const data = await request.json();
    const { capacities } = data;

    if (!capacities || typeof capacities !== 'object') {
      return NextResponse.json(
        { error: 'Invalid capacities provided' },
        { status: 400 }
      );
    }

    // Validate capacities
    const requiredEdges = [
      'A->B', 'A->C', 'A->D',
      'B->E', 'B->F',
      'C->E', 'C->F',
      'D->F',
      'E->G', 'E->H',
      'F->H',
      'G->T', 'H->T'
    ];

    for (const edge of requiredEdges) {
      if (capacities[edge] === undefined || capacities[edge] < 0) {
        return NextResponse.json(
          { error: `Invalid capacity for edge ${edge}` },
          { status: 400 }
        );
      }
    }

    const graph = createGraphFromCapacities(capacities);

    // Calculate max flow using both algorithms
    const fordFulkersonResult = fordFulkerson(graph, 'A', 'T');
    const edmondsKarpResult = edmondsKarp(graph, 'A', 'T');

    // Both algorithms should give the same result
    const maxFlow = fordFulkersonResult.maxFlow;

    return NextResponse.json({
      maxFlow,
      algorithm1: {
        name: 'Ford-Fulkerson',
        maxFlow: fordFulkersonResult.maxFlow,
        executionTime: fordFulkersonResult.executionTime
      },
      algorithm2: {
        name: 'Edmonds-Karp',
        maxFlow: edmondsKarpResult.maxFlow,
        executionTime: edmondsKarpResult.executionTime
      }
    });
  } catch (error) {
    console.error('Error calculating max flow:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
