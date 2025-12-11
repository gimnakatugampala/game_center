// components/GameBoard.js
import React from 'react';
import styles from '../../../../styles/GameBoard.module.css';

// N x N පුවරුව පෙන්වන Functional Component එක
function GameBoard({ size, moves }) {
  
  // 1. Moves (Snakes/Ladders) ටික Map දෙකකට දාගමු
  //    සහ පැහැදිලිව පේන පාට (Hues) list එකක් හදමු
  const startsMap = new Map();
  const endsMap = new Map();

  // පැහැදිලිව වෙන් කර හඳුනාගත හැකි HUE (පාට) අගයන් 10ක්
  const HUES = [
    0,   // Red
    40,  // Orange
    60,  // Yellow
    120, // Green
    180, // Cyan
    220, // Blue
    270, // Purple
    300, // Magenta
    30,  // Light Orange
    200, // Light Blue
  ];
  
  let colorIndex = 0; // පාට list එකේ index එක

  moves.forEach((move) => {
    // HUES list එකෙන් ඊළඟ පාට අරගමු
    const hue = HUES[colorIndex % HUES.length];
    
    // Lightness එක 85% කරලා පාට ටිකක් තද කරමු (90% ලා වැඩියි)
    const color = `hsl(${hue}, 70%, 85%)`; 

    // Map එකට දාද්දී color එකත් දානවා
    startsMap.set(move.start, { type: move.type, end: move.end, color: color });
    endsMap.set(move.end, { type: move.type, start: move.start, color: color });

    // ඊළඟ pair එකට ඊළඟ පාටට යන්න index එක වැඩි කරමු
    colorIndex++;
  });


  // 2. Board එකේ Cell ටික zig-zag විදිහට හදාගමු (මේක කලින් වගේමයි)
  const boardMatrix = [];
  for (let i = 0; i < size; i++) {
    boardMatrix.push(new Array(size).fill(0));
  }
  let cellNumber = 1;
  for (let row = size - 1; row >= 0; row--) {
    if ((size - 1 - row) % 2 === 0) {
      for (let col = 0; col < size; col++) {
        boardMatrix[row][col] = cellNumber++;
      }
    } else {
      for (let col = size - 1; col >= 0; col--) {
        boardMatrix[row][col] = cellNumber++;
      }
    }
  }

  // 3. Board එක HTML විදිහට Render කිරීම
  return (
    <div
      className={styles.board}
      style={{ '--N': size }}
    >
      {boardMatrix.map((row, rowIndex) =>
        row.map((cellNum) => {
          
          const startMove = startsMap.get(cellNum);
          const endMove = endsMap.get(cellNum);

          // 1. අදාළ පාට (pairColor) එක හොයාගන්නවා
          //    (start එකටයි end එකටයි දෙකටම එකම පාට එනවා)
          const pairColor = startMove ? startMove.color : (endMove ? endMove.color : null);
          
          // 2. Inline style object එක හදනවා
          const cellStyle = {};
          if (pairColor) {
            cellStyle.backgroundColor = pairColor; // පාට දෙනවා
          }

          // 3. CSS class එක (පරණ class අයින් කළා)
          const cellClasses = styles.cell; // .cell class එක විතරයි

          return (
            <div 
              key={cellNum} 
              className={cellClasses} 
              style={cellStyle} // <-- මෙතනින් style එක දෙනවා
            >
              <span className={styles.cellNumber}>{cellNum}</span>
              
              {startMove && (
                <span className={styles.moveInfo}>
                  {startMove.type === 'snake' ? '🐍' : '🪜'}
                  {` from ${cellNum} to ${startMove.end}`}
                </span>
              )}

              {endMove && (
                <span className={styles.moveInfo}>
                  {endMove.type === 'snake' ? '🐍' : '🪜'}
                  {` from ${endMove.start} to ${cellNum}`}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default GameBoard;