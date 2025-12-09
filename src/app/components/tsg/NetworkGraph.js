'use client';

import { useEffect, useRef, useState } from 'react';

export default function NetworkGraph({ capacities }) {
  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !capacities || typeof window === 'undefined') {
      if (containerRef.current && capacities) {
        containerRef.current.innerHTML = '<div style="padding: 20px; text-align: center; color: #cbd5e0;">Graph visualization loading...</div>';
      }
      return;
    }

    let VisNetwork;
    let networkInstance = null;

    // Dynamically import vis-network only on client side
    const loadNetwork = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to import vis-network from main package (v10)
        // Using only main package to avoid build-time resolution issues
        try {
          const visNetworkModule = await import('vis-network');
          // vis-network v10 exports Network directly
          VisNetwork = visNetworkModule.Network;
          
          if (!VisNetwork) {
            // Try default export
            VisNetwork = visNetworkModule.default?.Network || visNetworkModule.default;
          }
        } catch (importError) {
          console.warn('vis-network import failed, using SVG fallback:', importError);
          throw new Error('vis-network not available');
        }
        
        if (!VisNetwork || typeof VisNetwork !== 'function') {
          throw new Error('VisNetwork class not found');
        }

        if (!VisNetwork) {
          throw new Error('VisNetwork not available');
        }

        // Define nodes
        const nodes = [
          { id: 'A', label: 'A (Source)', color: { background: '#4CAF50', border: '#2E7D32' } },
          { id: 'B', label: 'B', color: { background: '#2196F3', border: '#1565C0' } },
          { id: 'C', label: 'C', color: { background: '#2196F3', border: '#1565C0' } },
          { id: 'D', label: 'D', color: { background: '#2196F3', border: '#1565C0' } },
          { id: 'E', label: 'E', color: { background: '#FF9800', border: '#E65100' } },
          { id: 'F', label: 'F', color: { background: '#FF9800', border: '#E65100' } },
          { id: 'G', label: 'G', color: { background: '#9C27B0', border: '#4A148C' } },
          { id: 'H', label: 'H', color: { background: '#9C27B0', border: '#4A148C' } },
          { id: 'T', label: 'T (Sink)', color: { background: '#F44336', border: '#B71C1C' } },
        ];

        // Define edges with capacities as labels
        const edges = [
          { from: 'A', to: 'B', label: `${capacities['A->B']}`, arrows: 'to' },
          { from: 'A', to: 'C', label: `${capacities['A->C']}`, arrows: 'to' },
          { from: 'A', to: 'D', label: `${capacities['A->D']}`, arrows: 'to' },
          { from: 'B', to: 'E', label: `${capacities['B->E']}`, arrows: 'to' },
          { from: 'B', to: 'F', label: `${capacities['B->F']}`, arrows: 'to' },
          { from: 'C', to: 'E', label: `${capacities['C->E']}`, arrows: 'to' },
          { from: 'C', to: 'F', label: `${capacities['C->F']}`, arrows: 'to' },
          { from: 'D', to: 'F', label: `${capacities['D->F']}`, arrows: 'to' },
          { from: 'E', to: 'G', label: `${capacities['E->G']}`, arrows: 'to' },
          { from: 'E', to: 'H', label: `${capacities['E->H']}`, arrows: 'to' },
          { from: 'F', to: 'H', label: `${capacities['F->H']}`, arrows: 'to' },
          { from: 'G', to: 'T', label: `${capacities['G->T']}`, arrows: 'to' },
          { from: 'H', to: 'T', label: `${capacities['H->T']}`, arrows: 'to' },
        ];

        // Network configuration
        const data = { nodes, edges };
        const options = {
          nodes: {
            shape: 'circle',
            size: 30,
            font: {
              size: 14,
              color: '#000',
            },
            borderWidth: 2,
          },
          edges: {
            width: 2,
            font: {
              size: 12,
              align: 'middle',
            },
            smooth: {
              type: 'continuous',
            },
          },
          physics: {
            enabled: true,
            stabilization: {
              enabled: true,
              iterations: 100,
            },
          },
          layout: {
            hierarchical: {
              enabled: false,
            },
          },
        };

        // Create network
        networkInstance = new VisNetwork(containerRef.current, data, options);
        networkRef.current = networkInstance;
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading vis-network:', err);
        setError(err.message);
        setIsLoading(false);
        
        // Fallback: render simple SVG visualization
        if (containerRef.current) {
          renderFallbackGraph(containerRef.current, capacities);
        }
      }
    };

    loadNetwork();

    // Cleanup
    return () => {
      if (networkInstance) {
        try {
          networkInstance.destroy();
        } catch (e) {
          console.warn('Error destroying network:', e);
        }
      }
    };
  }, [capacities]);

  if (error && containerRef.current) {
    // Error state is handled by fallback
  }

  return <div ref={containerRef} style={{ width: '100%', height: '500px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '15px' }} />;
}

// Fallback SVG visualization if vis-network fails to load
function renderFallbackGraph(container, capacities) {
  const nodePositions = {
    'A': { x: 50, y: 250 },
    'B': { x: 200, y: 100 },
    'C': { x: 200, y: 250 },
    'D': { x: 200, y: 400 },
    'E': { x: 400, y: 150 },
    'F': { x: 400, y: 350 },
    'G': { x: 600, y: 200 },
    'H': { x: 600, y: 300 },
    'T': { x: 750, y: 250 }
  };

  const nodeColors = {
    'A': '#4CAF50',
    'B': '#2196F3',
    'C': '#2196F3',
    'D': '#2196F3',
    'E': '#FF9800',
    'F': '#FF9800',
    'G': '#9C27B0',
    'H': '#9C27B0',
    'T': '#F44336'
  };

  const edges = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'A', to: 'D' },
    { from: 'B', to: 'E' },
    { from: 'B', to: 'F' },
    { from: 'C', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'D', to: 'F' },
    { from: 'E', to: 'G' },
    { from: 'E', to: 'H' },
    { from: 'F', to: 'H' },
    { from: 'G', to: 'T' },
    { from: 'H', to: 'T' }
  ];

  const svg = `
    <svg width="100%" height="500px" style="background: rgba(0, 0, 0, 0.3); border-radius: 15px;">
      ${edges.map(edge => {
        const from = nodePositions[edge.from];
        const to = nodePositions[edge.to];
        const capacity = capacities[`${edge.from}->${edge.to}`] || 0;
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        return `
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" 
                stroke="#667eea" stroke-width="2" marker-end="url(#arrowhead)" />
          <text x="${midX}" y="${midY - 5}" fill="#fff" font-size="12" text-anchor="middle" 
                style="background: rgba(0,0,0,0.7); padding: 2px;">${capacity}</text>
        `;
      }).join('')}
      ${Object.entries(nodePositions).map(([id, pos]) => `
        <circle cx="${pos.x}" cy="${pos.y}" r="25" fill="${nodeColors[id]}" stroke="#fff" stroke-width="2" />
        <text x="${pos.x}" y="${pos.y + 5}" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">${id}</text>
      `).join('')}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#667eea" />
        </marker>
      </defs>
    </svg>
  `;

  container.innerHTML = svg;
}

