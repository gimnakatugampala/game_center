"use client";

import React from "react";

const AboutUs = () => {
  const groupMembers = [
    { name: "Gimna Kavishka", index: "COBSCCOMP251P-XXX" },
    { name: "Nuwan Jeewantha", index: "COBSCCOMP251P-045" },
    { name: "Nandana", index: "COBSCCOMP251P-XXX" },
    { name: "Dilmani", index: "COBSCCOMP251P-XXX" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center mb-6">
          About Us
        </h1>
        <p className="text-gray-300 text-center mb-8">
          We are students of BSc (Hons) Computing - PDSA, Batch 25.1, working on
          the Algorithm Visualizer project as part of our coursework. Our
          project focuses on creating interactive tools to help understand and
          visualize classic algorithms. Below are the members of our team who
          contributed to this project:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 transition-shadow shadow-md flex flex-col items-center"
            >
              <div className="text-xl font-semibold text-indigo-400">
                {member.name}
              </div>
              <div className="text-gray-300 mt-1">{member.index}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
