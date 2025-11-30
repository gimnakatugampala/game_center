import React from "react";

// Disk colors for visual appeal (adjusted to dark theme)
const DISK_COLORS = [
  "bg-red-600",
  "bg-orange-600",
  "bg-yellow-500",
  "bg-green-600",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-600",
  "bg-pink-500",
  "bg-gray-500",
];

const Disk = ({ size, N, isTop, isSelected }) => {
  const widthPercentage = (size / N) * 80 + 20; // Min width 20%
  const colorIndex = (size - 1) % DISK_COLORS.length;
  const color = DISK_COLORS[colorIndex];

  return (
    <div
      className={`h-4 mx-auto rounded-md shadow-lg transition-all duration-150 ease-out ${color} ${
        isSelected ? "border-4 border-yellow-400 transform scale-[1.05]" : ""
      } ${isTop ? "cursor-pointer hover:shadow-xl" : ""}`}
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
  const PEGS_BASE_HEIGHT = 1;
  const DISK_HEIGHT_REM = 1;
  const DISK_SPACING_REM = 2 / 16;
  const diskStackHeight = N * DISK_HEIGHT_REM + N * DISK_SPACING_REM;
  const totalPegHeight = diskStackHeight + PEGS_BASE_HEIGHT + LABEL_HEIGHT_REM;

  const renderedPegs = pegs.map((diskStack, index) => {
    const isSelected = selectedPeg === index;
    const isTopDiskMovable = diskStack.length > 0;
    const isClickable =
      (isTopDiskMovable || selectedPeg !== null) &&
      !isAutoSolving &&
      gameStatus === "PLAYING";

    return (
      <div
        key={index}
        className={`flex-1 flex flex-col items-center relative transition-colors duration-200 ${
          isClickable ? "hover:bg-gray-700/30 cursor-pointer" : ""
        } ${isSelected ? "bg-blue-900/40 shadow-inner rounded-lg" : ""}`}
        onClick={() => isClickable && handlePegClick(index)}
        style={{ minHeight: `${totalPegHeight}rem` }}
      >
        {/* Peg Rod */}
        <div
          className="w-1 bg-gray-600 absolute z-0 rounded-full left-1/2 transform -translate-x-1/2"
          style={{
            bottom: `${PEGS_BASE_HEIGHT + LABEL_HEIGHT_REM}rem`,
            height: `${diskStackHeight}rem`,
          }}
        ></div>

        {/* Disks */}
        <div
          className="w-full flex flex-col-reverse items-center space-y-[2px] z-10 absolute left-0 right-0"
          style={{
            bottom: `${PEGS_BASE_HEIGHT + LABEL_HEIGHT_REM}rem`,
            height: `${diskStackHeight}rem`,
          }}
        >
          {diskStack.map((diskSize, i) => (
            <Disk
              key={diskSize}
              size={diskSize}
              N={N}
              isTop={i === diskStack.length - 1}
              isSelected={selectedPeg === index && i === diskStack.length - 1}
            />
          ))}
        </div>

        {/* Peg Base */}
        <div
          className="w-full h-4 bg-gray-700 rounded-t-lg shadow-lg absolute left-0 right-0 z-20"
          style={{ bottom: `${LABEL_HEIGHT_REM}rem` }}
        ></div>

        {/* Peg Label */}
        <p className="absolute bottom-0 text-lg font-semibold text-blue-300 z-30">
          Peg {index + 1}
        </p>
      </div>
    );
  });

  return (
    <div
      className={`flex justify-around items-end w-full relative transition-all duration-300`}
      style={{
        minHeight: `${totalPegHeight}rem`,
        gap: P === 3 ? "2rem" : "0.5rem",
      }}
    >
      {renderedPegs}
    </div>
  );
};

export default PegsDisplay;
