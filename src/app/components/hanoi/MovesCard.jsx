"use client";
import React from "react";

const pegLabels = ["A", "B", "C", "D"];

export default function MovesCard({ moves = [] }) {
  if (!moves || moves.length === 0)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl text-gray-400 text-center">
        No steps generated.
      </div>
    );

  return (
    <div className="bg-gray-800 p-4 rounded-3xl shadow-xl mt-6">
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {moves.map((m, index) => (
          <div
            key={index}
            className="bg-gray-700 p-3 rounded-xl flex justify-between items-center"
          >
            <span className="text-gray-300 font-semibold">
              Step {index + 1}
            </span>
            <span className="text-indigo-400 font-bold text-lg">
              {pegLabels[m.from]} → {pegLabels[m.to]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
