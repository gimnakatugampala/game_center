'use client';
import React, { useState } from 'react';

const GameCenterDashboard = () => {
  const [hoveredGame, setHoveredGame] = useState(null);

  const games = [
    {
      id: 'snake-ladder',
      title: 'Snake and Ladder',
      icon: '🎲',
      description: 'Find the minimum dice throws using BFS and Dynamic Programming',
      color: 'from-red-500 to-orange-500',
      complexity: 'Graph Traversal',
      algorithms: ['BFS', 'Dynamic Programming'],
      route: '/games/snake-ladder',
      implemented: false
    },
    {
      id: 'traffic',
      title: 'Traffic Simulation',
      icon: '🚦',
      description: 'Calculate maximum flow using Ford-Fulkerson and Edmonds-Karp',
      color: 'from-green-500 to-emerald-500',
      complexity: 'Network Flow',
      algorithms: ['Ford-Fulkerson', 'Edmonds-Karp'],
      route: '/games/traffic',
      implemented: false
    },
    {
      id: 'tsp',
      title: 'Traveling Salesman',
      icon: '🗺️',
      description: 'Find the shortest route through all cities',
      color: 'from-indigo-500 to-purple-600',
      complexity: 'NP-Complete',
      algorithms: ['Nearest Neighbor', 'Brute Force', 'Dynamic Programming'],
      route: '/games/tsp',
      implemented: true
    },
    {
      id: 'hanoi',
      title: 'Tower of Hanoi',
      icon: '🗼',
      description: 'Solve the classic puzzle with 3 or 4 pegs',
      color: 'from-yellow-500 to-amber-600',
      complexity: 'Recursive',
      algorithms: ['Classic Recursion', 'Frame-Stewart'],
      route: '/games/hanoi',
      implemented: false
    },
    {
      id: 'queens',
      title: 'Eight Queens',
      icon: '♛',
      description: 'Place 8 queens on a chessboard without conflicts',
      color: 'from-pink-500 to-purple-600',
      complexity: 'Backtracking',
      algorithms: ['Sequential', 'Threaded'],
      route: '/games/queens',
      implemented: true
    }
  ];

  const handleGameClick = (game) => {
    if (game.implemented) {
      window.location.href = game.route;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-5 font-sans">
      
      {/* Header */}
      <header className="text-center mb-12 pt-8">
        <div className="inline-block mb-6">
          <div className="text-7xl mb-4 animate-bounce">🎮</div>
        </div>
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Algorithm Game Center
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Learn algorithms through interactive games. Challenge yourself with classic computer science problems!
        </p>
        
        {/* Stats Bar */}
        <div className="flex justify-center gap-8 mt-8 flex-wrap">
          <div className="bg-slate-800/50 backdrop-blur-md px-6 py-3 rounded-full border border-indigo-500/30">
            <span className="text-slate-400 text-sm">Total Games:</span>
            <span className="text-white font-bold text-lg ml-2">5</span>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md px-6 py-3 rounded-full border border-green-500/30">
            <span className="text-slate-400 text-sm">Available:</span>
            <span className="text-green-400 font-bold text-lg ml-2">2</span>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-500/30">
            <span className="text-slate-400 text-sm">Coming Soon:</span>
            <span className="text-yellow-400 font-bold text-lg ml-2">3</span>
          </div>
        </div>
      </header>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {games.map((game, index) => (
          <div
            key={game.id}
            onClick={() => handleGameClick(game)}
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
            className={`
              relative bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 
              border-2 transition-all duration-300
              ${game.implemented 
                ? 'border-slate-700/50 hover:border-indigo-500/50 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20' 
                : 'border-slate-700/30 opacity-75 cursor-not-allowed'
              }
            `}
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Status Badge */}
            {!game.implemented && (
              <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </div>
            )}

            {game.implemented && (
              <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                PLAY NOW
              </div>
            )}

            {/* Game Icon */}
            <div className={`
              text-6xl mb-4 transition-transform duration-300
              ${hoveredGame === game.id && game.implemented ? 'scale-110 rotate-12' : ''}
            `}>
              {game.icon}
            </div>

            {/* Game Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              {game.title}
            </h2>

            {/* Game Description */}
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              {game.description}
            </p>

            {/* Complexity Badge */}
            <div className="mb-4">
              <span className={`
                inline-block px-3 py-1 rounded-lg text-xs font-bold
                bg-gradient-to-r ${game.color} text-white
              `}>
                {game.complexity}
              </span>
            </div>

            {/* Algorithms */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">
                Algorithms:
              </div>
              <div className="flex flex-wrap gap-2">
                {game.algorithms.map((algo, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/50"
                  >
                    {algo}
                  </span>
                ))}
              </div>
            </div>

            {/* Play Button */}
            {game.implemented ? (
              <button className={`
                w-full py-3 rounded-xl font-bold text-white text-sm
                bg-gradient-to-r ${game.color}
                transition-all duration-300
                hover:shadow-lg hover:shadow-indigo-500/50
                active:scale-95
              `}>
                🎮 Play Now →
              </button>
            ) : (
              <button className="w-full py-3 rounded-xl font-bold text-slate-500 text-sm bg-slate-700/30 cursor-not-allowed border border-slate-600/30">
                🔒 Coming Soon
              </button>
            )}

            {/* Hover Effect Overlay */}
            {game.implemented && hoveredGame === game.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto bg-slate-800/40 backdrop-blur-md rounded-3xl p-8 mb-12 border border-slate-700/30">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          🌟 Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-700/20">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="text-white font-bold mb-2">Learn Algorithms</h4>
            <p className="text-slate-400 text-sm">
              Master classic computer science algorithms through interactive gameplay
            </p>
          </div>
          <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-700/20">
            <div className="text-4xl mb-3">⚡</div>
            <h4 className="text-white font-bold mb-2">Compare Performance</h4>
            <p className="text-slate-400 text-sm">
              See real-time comparisons of different algorithmic approaches
            </p>
          </div>
          <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-700/20">
            <div className="text-4xl mb-3">🏆</div>
            <h4 className="text-white font-bold mb-2">Track Progress</h4>
            <p className="text-slate-400 text-sm">
              Your solutions and performance are saved in the database
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-sm pb-8">
        <p>BSc (Hons) Computing - PDSA Coursework | Batch 25.1</p>
        <p className="mt-2">National Institute of Business Management</p>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default GameCenterDashboard;