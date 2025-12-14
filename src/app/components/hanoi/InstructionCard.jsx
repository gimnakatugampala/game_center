"use client";

import React from "react";

/**
 * Displays game instructions for Tower of Hanoi
 */
const InstructionsCard = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-lg space-y-4 mt-4">
      <h3 className="text-2xl font-bold text-indigo-400 mb-2">How to Play</h3>
      <ul className="list-disc list-inside text-gray-300 space-y-1">
        <li>Select the number of disks and pegs in the Setup Panel.</li>
        <li>Click a peg to pick a disk, then click another peg to move it.</li>
        <li>
          Only one disk can be moved at a time, and a larger disk cannot be
          placed on a smaller disk.
        </li>
        <li>
          Use the "Generate Solution" button to see optimal moves automatically.
        </li>
        <li>
          Try to complete the puzzle in the fewest moves before the timer runs
          out.
        </li>
        <li>
          Compare your moves with the optimal solution in the Move Calculation
          Breakdown.
        </li>
      </ul>
    </div>
  );
};

export default InstructionsCard;
