"use client";

import React, { useState, useEffect } from "react";
import styles from "./TowerVisual.module.css";

const diskColors = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#34d399",
];

export default function TowerVisual({ disks, pegsCount = 3, onMovesChange }) {
  const getInitialPegs = () => {
    const pegs = Array.from({ length: pegsCount }, () => []);
    pegs[0] = Array.from({ length: disks }, (_, i) => disks - i);
    return pegs;
  };

  const [pegs, setPegs] = useState(getInitialPegs);
  const [moves, setMoves] = useState([]);
  const [draggedDisk, setDraggedDisk] = useState(null);

  useEffect(() => {
    setPegs(getInitialPegs());
    setMoves([]);
    onMovesChange?.(0, []);
  }, [disks, pegsCount]);

  const handleDragStart = (disk, fromPegIdx) => {
    const topDisk = pegs[fromPegIdx][pegs[fromPegIdx].length - 1];
    if (disk !== topDisk) return;
    setDraggedDisk({ disk, fromPegIdx });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (toPegIdx) => {
    if (!draggedDisk) return;

    const { fromPegIdx, disk } = draggedDisk;
    const toPeg = pegs[toPegIdx];
    const topDisk = toPeg[toPeg.length - 1];

    if (topDisk && topDisk < disk) {
      alert("Cannot place larger disk on smaller disk!");
      setDraggedDisk(null);
      return;
    }

    const newPegs = pegs.map((peg) => [...peg]);
    newPegs[fromPegIdx].pop();
    newPegs[toPegIdx].push(disk);

    const newMoves = [
      ...moves,
      {
        from: String.fromCharCode(65 + fromPegIdx),
        to: String.fromCharCode(65 + toPegIdx),
      },
    ];

    setPegs(newPegs);
    setMoves(newMoves);
    onMovesChange?.(newMoves.length, newMoves);
    setDraggedDisk(null);
  };

  return (
    <div className={styles.container}>
      {pegs.map((peg, idx) => (
        <div key={idx} className={styles.pegWrapper}>
          <div className={styles.pegLabel}>
            Peg {String.fromCharCode(65 + idx)}
          </div>
          <div
            className={`${styles.pegColumn} ${
              draggedDisk ? styles.dragOver : ""
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
          >
            {peg.map((disk, diskIdx) => (
              <div
                key={diskIdx}
                className={styles.disk}
                draggable={diskIdx === peg.length - 1}
                onDragStart={() => handleDragStart(disk, idx)}
                style={{
                  width: `${40 + disk * 16}px`,
                  backgroundColor: diskColors[(disk - 1) % diskColors.length],
                }}
              >
                {disk}
              </div>
            ))}
          </div>
          <div className={styles.pegBase} />
        </div>
      ))}
      <div className={styles.totalMoves}>Total Moves: {moves.length}</div>
    </div>
  );
}
