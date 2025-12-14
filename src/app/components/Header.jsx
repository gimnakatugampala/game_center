"use client";
import Link from "next/link";
import { useState } from "react";

/**
 * Header component with navigation menu
 * Includes responsive mobile menu toggle and navigation links
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6 md:px-10">
        <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 tracking-wide">
          <a href="/">Game Center</a>
        </div>

        <ul className="hidden md:flex space-x-8 text-gray-300 font-medium">
          <li>
            <Link
              href="/"
              className="relative group hover:text-white transition-colors duration-200"
            >
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 transition-all group-hover:w-full"></span>
            </Link>
          </li>

          <li>
            <Link
              href="/AboutUs"
              className="relative group hover:text-white transition-colors duration-200"
            >
              About Us
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 transition-all group-hover:w-full"></span>
            </Link>
          </li>
        </ul>

        <button
          className="md:hidden text-gray-300 hover:text-white transition-colors duration-200 text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? "✖" : "☰"}
        </button>
      </nav>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-64" : "max-h-0"
        } bg-gray-900/95 backdrop-blur-sm shadow-inner`}
      >
        <ul className="flex flex-col space-y-2 p-4 text-gray-300">
          <li>
            <Link
              href="/"
              className="block px-2 py-2 rounded-lg hover:bg-gray-800/60 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/AboutUs"
              className="block px-2 py-2 rounded-lg hover:bg-gray-800/60 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
