// __tests__/gameLogic.test.js

// 1. අපි test කරන function එක import කරගමු
//    (මේ function එක private නිසා, අපි 'lib/gameLogic.js' file එකේ
//     අගටම 'export' කියලා දාන්න ඕන. මම ඒක ඊළඟට කියන්නම්)
import { findMinThrowsBFS_forTesting } from '../lib/gameLogic';

// Test case එක ලියමු
describe('Snake & Ladder Game Logic', () => {
  
  // Test 1: BFS Algorithm එක
  it('should find the minimum throws using BFS', () => {
    
    // 1. Test Data හදාගමු
    //    3x3 Board (Size N=3, BoardSize=9)
    //    Cell 2 -> 8 (Ladder)
    //    Cell 7 -> 4 (Snake)
    const moves = [
      { start: 2, end: 8, type: 'ladder' },
      { start: 7, end: 4, type: 'snake' },
    ];
    const N = 3; // 3x3 board (1 to 9)

    // 2. Function එක run කරමු
    const minThrows = findMinThrowsBFS_forTesting(moves, N);

    // 3. උත්තරේ බලාපොරොත්තු වෙන එකද කියලා බලමු
    //    Path එක: 1 -> (Roll 1) -> 2 -> (Ladder) -> 8 -> (Roll 1) -> 9
    //    Total Throws = 2
    expect(minThrows).toBe(2);
  });

  // Test 2: තවත් test එකක්
  it('should find minimum throws with only snakes', () => {
    // 4x4 Board (Size N=4, BoardSize=16)
    // Snake 14 -> 2
    const moves = [
      { start: 14, end: 2, type: 'snake' },
    ];
    const N = 4;
    
    const minThrows = findMinThrowsBFS_forTesting(moves, N);

    // Path (Snake නැතුව): 1 -> 7 -> 13 -> 16 (Throws 3)
    // Path (Snake එක්ක): 1 -> (Roll 6) -> 7 -> (Roll 6) -> 13 -> (Roll 1) -> 14 -> (Snake) -> 2 ...
    // ... ඒ නිසා කෙටිම පාර 1 -> 7 -> 13 -> 16 (Throws 3)
    expect(minThrows).toBe(3);
  });
});