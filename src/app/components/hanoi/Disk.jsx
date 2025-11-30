import React from "react";

const Disk = React.memo(({ diskSize, totalDisks, isTop, isSelected }) => {
  // Scale width: smallest 20%, largest 100%
  const widthPercentage = (diskSize / totalDisks) * 80 + 20;

  // Define 10 vibrant colors for disks
  const COLORS = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-400",
    "bg-green-500",
    "bg-teal-400",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-gray-400",
  ];

  const color = COLORS[(diskSize - 1) % COLORS.length];

  return (
    <div
      className={`h-6 mx-auto rounded-full shadow-lg transition-all duration-300 ease-out
        ${color}
        ${isSelected ? "border-4 border-yellow-400 scale-[1.05] shadow-xl" : ""}
        ${isTop ? "cursor-pointer hover:shadow-2xl" : ""}`}
      style={{ width: `${widthPercentage}%` }}
    ></div>
  );
});

export default Disk;
