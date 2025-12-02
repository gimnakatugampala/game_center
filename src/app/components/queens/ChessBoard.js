// src/app/components/queens/ChessBoard.js
import React, { Component } from 'react';

class ChessBoard extends Component {
  isQueenAt = (row, col) => {
    const { queens } = this.props;
    return queens.some(q => q.row === row && q.col === col);
  };

  isConflictSquare = (row, col) => {
    const { queens, conflicts } = this.props;
    if (!conflicts || conflicts.length === 0) return false;

    const queenIndex = queens.findIndex(q => q.row === row && q.col === col);
    if (queenIndex === -1) return false;

    return conflicts.some(conflict => 
      conflict.includes(queenIndex)
    );
  };

  isUnderAttack = (row, col) => {
    const { queens } = this.props;
    
    for (const queen of queens) {
      // Skip if this is the queen itself
      if (queen.row === row && queen.col === col) continue;
      
      // Same row or column
      if (queen.row === row || queen.col === col) return true;
      
      // Same diagonal
      if (Math.abs(queen.row - row) === Math.abs(queen.col - col)) return true;
    }
    
    return false;
  };

  render() {
    const { onSquareClick } = this.props;

    return (
      <div className="chess-board-container">
        <div className="grid grid-cols-8 gap-0 w-full max-w-[600px] mx-auto bg-slate-900 p-2 rounded-xl shadow-2xl border-4 border-slate-700">
          {Array.from({ length: 8 }).map((_, row) => (
            Array.from({ length: 8 }).map((_, col) => {
              const isLight = (row + col) % 2 === 0;
              const hasQueen = this.isQueenAt(row, col);
              const isConflict = this.isConflictSquare(row, col);
              const isAttacked = this.isUnderAttack(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => onSquareClick(row, col)}
                  className={`
                    aspect-square flex items-center justify-center cursor-pointer
                    transition-all duration-200 relative
                    ${isLight 
                      ? 'bg-slate-200 hover:bg-slate-300' 
                      : 'bg-slate-600 hover:bg-slate-500'
                    }
                    ${hasQueen && isConflict 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : ''
                    }
                    ${!hasQueen && isAttacked && isLight 
                      ? 'bg-red-100' 
                      : ''
                    }
                    ${!hasQueen && isAttacked && !isLight 
                      ? 'bg-red-900/30' 
                      : ''
                    }
                  `}
                >
                  {/* Coordinate labels */}
                  {col === 0 && (
                    <div className="absolute left-1 top-1 text-[10px] font-bold opacity-40">
                      {8 - row}
                    </div>
                  )}
                  {row === 7 && (
                    <div className="absolute right-1 bottom-1 text-[10px] font-bold opacity-40">
                      {String.fromCharCode(65 + col)}
                    </div>
                  )}

                  {/* Queen */}
                  {hasQueen && (
                    <div className={`
                      text-5xl transform transition-transform hover:scale-110
                      ${isConflict ? 'animate-shake' : ''}
                    `}>
                      <span className={`
                        ${isConflict ? 'text-white drop-shadow-[0_0_10px_rgba(255,0,0,1)]' : 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]'}
                      `}>
                        ♛
                      </span>
                    </div>
                  )}

                  {/* Attack indicator */}
                  {!hasQueen && isAttacked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full opacity-30"></div>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center gap-6 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-xs">♛</div>
            <span>Safe Queen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs animate-pulse">♛</div>
            <span>Conflict</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-900/30 border border-red-400 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
            <span>Under Attack</span>
          </div>
        </div>
      </div>
    );
  }
}

export default ChessBoard;