'use client';

import { useState } from 'react';
import Header from "@/components/Header";
import LeagueSelectorGrid from "@/components/LeagueSelectorGrid";
import ThemeSelector from "@/components/ThemeSelector";

// Test import from theme-system using direct path
import { useTheme } from 'react-theme-system';
import { themes } from 'react-theme-system';

export default function Home() {
  const [theme, setTheme] = useState('default');

  // Test if theme-system imports work
  console.log('Available themes:', Object.keys(themes));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Better<span className="text-blue-600">Score</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            Get the latest scores and stats from NFL, NHL, NBA, and MLB. 
            Stay updated with all your favorite teams.
          </p>
          
          <ThemeSelector onThemeChange={setTheme} />
          
          <LeagueSelectorGrid theme={theme} />
        </div>
      </main>
    </div>
  );
}