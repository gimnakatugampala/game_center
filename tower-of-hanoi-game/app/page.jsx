"use client";

import React from "react";
import GameHanoi from "../components/GameHanoi";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Tower of Hanoi Game
      </h1>
      <GameHanoi />
    </main>
  );
}
