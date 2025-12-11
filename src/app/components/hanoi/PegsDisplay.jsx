"use client";

import React from "react";

// Disk colors for dark theme gradients
const DISK_COLORS = [
  "from-red-600 to-red-500",
  "from-orange-600 to-orange-500",
  "from-yellow-500 to-yellow-400",
  "from-green-600 to-green-500",
  "from-teal-500 to-teal-400",
  "from-blue-500 to-blue-400",
  "from-indigo-500 to-indigo-400",
  "from-purple-600 to-purple-500",
  "from-pink-500 to-pink-400",
  "from-gray-500 to-gray-400",
];

const Disk = ({ size, N, isTop, isSelected }) => {
  const widthPercentage = (size / N) * 80 + 20; // Min width 20%
  const colorIndex = (size - 1) % DISK_COLORS.length;
  const gradient = DISK_COLORS[colorIndex];

  return (
    <div
      className={`h-5 mx-auto rounded-xl shadow-lg transition-all duration-300 ease-out bg-gradient-to-r ${gradient} 
        ${isSelected ? "ring-4 ring-yellow-400 scale-[1.1] shadow-2xl" : ""}
        ${
          isTop
            ? "cursor-pointer hover:shadow-2xl hover:scale-[1.08] hover:translate-y-[-2px]"
            : ""
        }`}
      style={{ width: `${widthPercentage}%` }}
    />
  );
};

const PegsDisplay = ({
  pegs,
  P,
  N,
  selectedPeg,
  handlePegClick,
  isAutoSolving,
  gameStatus,
}) => {
  if (!Array.isArray(pegs)) return null;

  const LABEL_HEIGHT_REM = 2;
  const PEGS_BASE_HEIGHT = 1.5;
  const DISK_HEIGHT_REM = 1.2;
  const DISK_SPACING_REM = 0.15;
  const diskStackHeight = N * DISK_HEIGHT_REM + N * DISK_SPACING_REM;
  const totalPegHeight = diskStackHeight + PEGS_BASE_HEIGHT + LABEL_HEIGHT_REM;

  return (
    <div
      className={`flex justify-around items-end w-full relative transition-all duration-300 gap-6 md:gap-8`}
      style={{ minHeight: `${totalPegHeight}rem` }}
    >
      {pegs.map((diskStack, index) => {
        const isSelected = selectedPeg === index;
        const isTopDiskMovable = diskStack.length > 0;
        const isClickable =
          (isTopDiskMovable || selectedPeg !== null) &&
          !isAutoSolving &&
          gameStatus === "PLAYING";

        return (
          <div
            key={index}
            className={`flex-1 flex flex-col items-center relative transition-transform duration-300 ${
              isClickable ? "hover:scale-[1.03] hover:shadow-lg" : ""
            } ${
              isSelected
                ? "bg-gray-800/30 rounded-2xl shadow-inner ring-2 ring-indigo-400"
                : ""
            }`}
            onClick={() => isClickable && handlePegClick(index)}
            style={{ minHeight: `${totalPegHeight}rem` }}
          >
            {/* Peg Rod */}
            <div
              className="w-1 bg-gray-600/70 absolute z-0 rounded-full left-1/2 transform -translate-x-1/2"
              style={{
                bottom: `${PEGS_BASE_HEIGHT + LABEL_HEIGHT_REM}rem`,
                height: `${diskStackHeight}rem`,
              }}
            ></div>

            {/* Disks */}
            <div
              className="w-full flex flex-col-reverse items-center absolute left-0 right-0 z-10"
              style={{
                bottom: `${PEGS_BASE_HEIGHT + LABEL_HEIGHT_REM}rem`,
                height: `${diskStackHeight}rem`,
                gap: `${DISK_SPACING_REM}rem`,
              }}
            >
              {diskStack.map((diskSize, i) => (
                <Disk
                  key={i}
                  size={diskSize}
                  N={N}
                  isTop={i === diskStack.length - 1}
                  isSelected={isSelected && i === diskStack.length - 1}
                />
              ))}
            </div>

            {/* Peg Base */}
            <div
              className="w-4/5 h-4 bg-gray-700 rounded-t-2xl shadow-lg absolute left-1/2 transform -translate-x-1/2 z-20"
              style={{ bottom: `${LABEL_HEIGHT_REM}rem` }}
            ></div>

            {/* Peg Label */}
            <p className="absolute bottom-0 text-sm md:text-lg font-semibold text-blue-300 z-30">
              Peg {String.fromCharCode(65 + index)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PegsDisplay;
