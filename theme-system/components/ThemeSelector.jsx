'use client';

import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../config/themes';

export default function ThemeSelector({ className = '' }) {
  const { theme, changeTheme } = useTheme();

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Theme Selector</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(themes).map(([key, themeConfig]) => (
          <button
            key={key}
            onClick={() => changeTheme(key)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              theme === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium mb-1">{themeConfig.name}</div>
            <div className="text-xs text-gray-600">{themeConfig.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
