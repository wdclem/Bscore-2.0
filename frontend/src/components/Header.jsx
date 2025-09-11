"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Better<span className="text-blue-600">Score</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/league-selector" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Leagues
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}


