// lib/gameLogic.js

/**
 * 1. Random Snakes සහ Ladders හදන function එක
 */
function generateMoves(N) {
  const boardSize = N * N;
  const moves = new Map(); // Map එකක් පාවිච්චි කරමු (key: start, value: end)
  const count = N - 2; // Snakes ගණන = Ladders ගණන
  
  // ***** අලුතින් එකතු කළා *****
  // පාවිච්චි කරපු cell numbers මතක තියාගන්න Set එකක්
  const usedCells = new Set();
  usedCells.add(1); // 1 වෙනි cell එක පාවිච්චි කරන්න බෑ
  usedCells.add(boardSize); // අවසාන cell එක පාවිච්චි කරන්න බෑ
  // ***************************

  // Ladders හදන loop එක
  for (let i = 0; i < count; i++) {
    let start, end;
    do {
      // Ladder එකක් නිසා, start එක end එකට වඩා අඩු වෙන්න ඕන
      start = Math.floor(Math.random() * (boardSize - 1)) + 1; // 1 සිට (N*N - 1)
      end = Math.floor(Math.random() * (boardSize - start)) + start + 1; // start+1 සිට N*N
    } while (
      // ***** මේ Condition එක වෙනස් කළා *****
      usedCells.has(start) || // 'start' එක කලින් පාවිච්චි කරලද?
      usedCells.has(end)    // 'end' එක කලින් පාවිච්චි කරලද?
      // **********************************
    );
    moves.set(start, end);
    // ***** අලුතින් එකතු කළා *****
    usedCells.add(start); // මේ දෙක දැන් "used"
    usedCells.add(end);
    // ***************************
  }

  // Snakes හදන loop එක
  for (let i = 0; i < count; i++) {
    let start, end;
    do {
      // Snake එකක් නිසා, start එක end එකට වඩා වැඩි වෙන්න ඕන
      start = Math.floor(Math.random() * (boardSize - 2)) + 2; // 2 සිට (N*N - 1)
      end = Math.floor(Math.random() * (start - 1)) + 1; // 1 සිට (start - 1)
    } while (
      // ***** මේ Condition එක වෙනස් කළා *****
      usedCells.has(start) || // 'start' එක කලින් පාවිච්චි කරලද?
      usedCells.has(end)    // 'end' එක කලින් පාවිච්චි කරලද?
      // **********************************
    );
    moves.set(start, end);
    // ***** අලුතින් එකතු කළා *****
    usedCells.add(start); // මේ දෙකත් දැන් "used"
    usedCells.add(end);
    // ***************************
  }

  // Map එක Array එකක් බවට පත් කරලා return කරමු...
  // ... (function එකේ ඉතුරු ටික එහෙමම තියෙයි) ...

  // Map එක Array එකක් බවට පත් කරලා return කරමු (frontend එකට ලේසියි)
  // { type: 'snake'/'ladder', start: 10, end: 5 } වගේ
  const movesArray = [];
  for (let [start, end] of moves.entries()) {
    movesArray.push({
      start: start,
      end: end,
      type: start < end ? 'ladder' : 'snake',
    });
  }
  return movesArray;
}

/**
 * 2. BFS Algorithm එක (අවම වාර ගණන හොයන)
 * (මෙය පැවරුමේ ඉල්ලන පළමු algorithm එක)
 */
export function findMinThrowsBFS_forTesting(moves, N) {
  const boardSize = N * N;
  const movesMap = new Map(); // Array එක Map එකක් බවට පත් කරගමු (search කරන්න ලේසියි)
  for (let move of moves) {
    movesMap.set(move.start, move.end);
  }

  // Queue (පෝලිම) එක. Array එකක් පාවිච්චි කරමු.
  // හැම item එකක්ම [කොටුව_අංකය, වාර_ගණන] විදිහට save කරමු
  const queue = [];
  queue.push([1, 0]); // 1 වෙනි කොටුවෙන් පටන් ගමු, වාර 0 යි.

  // "Visit" කරපු කොටු save කරගන්න Set එකක්
  // එකම කොටුවට ආයෙ ආයෙත් ඇවිත් loop වෙන එක නවත්තන්න
  const visited = new Set();
  visited.add(1);

  // Queue එක හිස් වෙනකල් loop එක දුවමු
  while (queue.length > 0) {
    // පෝලිමේ ඉස්සරහම කෙනාව (item) අරගමු
    const [currentCell, throws] = queue.shift(); // shift() = පෝලිමෙන් ඉස්සරහම එක අයින් කරලා ගන්න

    // දාදු කැටය (1 සිට 6) roll කරමු
    for (let i = 1; i <= 6; i++) {
      let nextCell = currentCell + i;

      // 1. Board එක පැනලා ගියොත්, ඒ roll එක අතාරිමු
      if (nextCell > boardSize) {
        continue;
      }

      // 2. ගොඩ බැස්ස තැන (nextCell) Snake/Ladder එකක් තියෙනවද බලමු
      if (movesMap.has(nextCell)) {
        nextCell = movesMap.get(nextCell); // අලුත් තැනට යවමු
      }

      // 3. අවසාන කොටුවට (N*N) ආවද?
      if (nextCell === boardSize) {
        return throws + 1; // ඔව්! වාර ගණන return කරමු (මේ throw එකත් එක්ක)
      }

      // 4. මේ එන කොටුවට (nextCell) අපි කලින් ඇවිත් නැත්නම්...
      if (!visited.has(nextCell)) {
        visited.add(nextCell); // "Visit" කලා කියලා ලකුණු කරමු
        queue.push([nextCell, throws + 1]); // පෝලිමේ අගට දාමු (ඊළඟ වාරයේ බලන්න)
      }
    }
  }

  // Queue එක හිස් වෙලත් 100ට යන්න බැරි උනානම් (loops වගේ තිබ්බොත්)
  return -1; // -1 = යන්න බෑ (Unreachable)
}

// lib/gameLogic.js
// ... (ඔබේ පරණ BFS function එක එහෙමම තියෙයි) ...

/**
 * 3. දෙවන Algorithm එක (Dijkstra's)
 * (මේක Priority Queue එකක් පාවිච්චි කරනවා)
 */
function findMinThrowsDijkstra(moves, N) {
  const boardSize = N * N;
  const movesMap = new Map();
  for (let move of moves) {
    movesMap.set(move.start, move.end);
  }

  // Dijkstra's වලදී, අපි "distances" (වාර ගණන) array එකක් තියාගන්නවා
  // හැම cell එකටම 'Infinity' (ගොඩක් ලොකු) අගයක් දානවා
  const distances = new Array(boardSize + 1).fill(Infinity);

  // Priority Queue එකක් (අපි සරල array එකකින් හදාගමු)
  // [වාර_ගණන, කොටුව_අංකය]
  const pq = []; 

  // 1 වෙනි කොටුවෙන් පටන් ගමු
  distances[1] = 0;
  pq.push([0, 1]); // [වාර 0, කොටුව 1]

  while (pq.length > 0) {
    // Priority Queue එක: අඩුම 'වාර ගණන' තියෙන එක ඉස්සරහට ගේමු
    // (Array එක sort කරමු)
    pq.sort((a, b) => a[0] - b[0]);

    const [d, currentCell] = pq.shift(); // අඩුම වාර ගණන තියෙන එක අරගමු

    // අපි මේ බලන වාර ගණන (d) දැනට save කරලා තියෙන
    // වාර ගණනට (distances[currentCell]) වඩා වැඩි නම්,
    // ඒ කියන්නේ අපි මේ cell එකට ඊට වඩා හොඳ පාරකින් ඇවිත් ඉවරයි.
    // ඒ නිසා මේක අතාරිමු (skip).
    if (d > distances[currentCell]) {
      continue;
    }

    // දාදු කැටය (1 සිට 6) roll කරමු
    for (let i = 1; i <= 6; i++) {
      let nextCell = currentCell + i;

      if (nextCell > boardSize) {
        continue;
      }

      if (movesMap.has(nextCell)) {
        nextCell = movesMap.get(nextCell);
      }

      // අලුත් වාර ගණන = d + 1
      // මේ අලුත් වාර ගණන (d+1), 'nextCell' එකට 
      // දැනට තියෙන වාර ගණනට (distances[nextCell]) වඩා අඩුද?
      if (distances[nextCell] > d + 1) {
        // ඔව්, අඩුයි. ඒ කියන්නේ මේක තමයි හොඳම පාර.
        distances[nextCell] = d + 1; // අලුත් වාර ගණන update කරමු
        pq.push([d + 1, nextCell]); // Queue එකට දාමු
      }
    }
  }

  // අවසාන කොටුවට (boardSize) යන්න ගතවුන වාර ගණන return කරමු
  if (distances[boardSize] === Infinity) {
    return -1; // යන්න බෑ
  }
  return distances[boardSize];
}

// ... (ඔබේ export function එක ඊළඟට ඇති) ...
// lib/gameLogic.js

// ...
export function runGameLogic(N) {
  // 1. මුලින්ම snakes/ladders හදාගමු
  const moves = generateMoves(N);

  // 2. BFS එක run කරමු
  const startTimeBFS = performance.now();
  const minThrowsBFS = findMinThrowsBFS_forTesting(moves, N);
  const endTimeBFS = performance.now();

  // 3. Dijkstra's එක run කරමු
  const startTimeDijkstra = performance.now();
  const minThrowsDijkstra = findMinThrowsDijkstra(moves, N);
  const endTimeDijkstra = performance.now();

  // (උත්තර දෙකම එකයිද කියලා check කරමු, ඒත් return කරන්නේ BFS එක)
  // console.log(`BFS: ${minThrowsBFS}, Dijkstra: ${minThrowsDijkstra}`);

  return {
    boardSize: N,
    snakesAndLadders: moves,
    minThrows: minThrowsBFS, // User ට දෙන උත්තරේ
    timeTaken: {
      // Database එකට save කරන්න Algorithms දෙකේම වෙලාව
      bfs_ms: endTimeBFS - startTimeBFS,
      dijkstra_ms: endTimeDijkstra - startTimeDijkstra,
    },
  };
}