'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import LeagueSelectorGrid from '../../components/LeagueSelectorGrid';
import ThemeSelector from '../../components/ThemeSelector';

export default function LeagueSelectorPage() {
  const [theme, setTheme] = useState('default');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your League</h1>
          <p className="text-lg text-gray-600">Select a league to view recent games and scores</p>
        </div>
        
        <ThemeSelector onThemeChange={setTheme} />
        
        <LeagueSelectorGrid theme={theme} />
      </div>
    </div>
  );
}


