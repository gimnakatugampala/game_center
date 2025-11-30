"use client";

import React from "react";

const Disk = React.memo(({ diskSize, totalDisks, isTop, isSelected }) => {
  // Scale width: smallest 20%, largest 100%
  const widthPercentage = (diskSize / totalDisks) * 80 + 20;

  // Gradient colors for dark theme disks
  const COLORS = [
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

  const gradient = COLORS[(diskSize - 1) % COLORS.length];

  return (
    <div
      className={`h-6 mx-auto rounded-full shadow-lg transition-all duration-300 ease-out
        bg-gradient-to-r ${gradient}
        ${isSelected ? "ring-4 ring-yellow-400 scale-[1.08] shadow-2xl" : ""}
        ${isTop ? "cursor-pointer hover:scale-[1.05] hover:shadow-2xl" : ""}`}
      style={{ width: `${widthPercentage}%` }}
    ></div>
  );
});

export default Disk;
