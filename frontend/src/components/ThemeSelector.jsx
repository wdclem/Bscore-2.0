'use client';

import { useState } from 'react';

const themes = [
  { id: 'default', name: 'Default', description: 'Original league-specific colors' },
  { id: 'espn', name: 'ESPN Style', description: 'Bold & chunky with ESPN vibes' },
  { id: 'fotmob', name: 'FotMob Style', description: 'Clean & bold mobile-first' },
  { id: 'thescore', name: 'TheScore Style', description: 'Dark & glowing with neon accents' },
  { id: 'minimalist', name: 'Bold Minimalist', description: 'Massive typography focus' },
  { id: 'sofa', name: 'SofaScore Style', description: 'Data-rich with bold elements' }
];

export default function ThemeSelector({ onThemeChange }) {
  const [selectedTheme, setSelectedTheme] = useState('default');

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Theme Selector</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedTheme === theme.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium mb-1">{theme.name}</div>
            <div className="text-xs text-gray-600">{theme.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
