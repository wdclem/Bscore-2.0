'use client';

import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';
import { themes } from '@theme/config/themes';

export default function ThemeSelector() {
  const { theme, changeTheme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
  };

  // Karellis-inspired minimal theme selector
  if (theme === 'videobg-1') {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white border-opacity-20">
        <h3 className="text-xl font-light mb-6 text-white text-center">Choose Your Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(themes).map(([themeId, themeConfig]) => (
            <button
              key={themeId}
              onClick={() => handleThemeChange(themeId)}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                theme === themeId
                  ? 'border-blue-400 bg-blue-400 bg-opacity-20 text-white'
                  : 'border-white border-opacity-30 text-white text-opacity-70 hover:border-opacity-60 hover:text-opacity-100'
              }`}
            >
              <div className="text-sm font-light mb-1">{themeConfig.name}</div>
              <div className="text-xs opacity-80">{themeConfig.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default theme selector
  return (
    <div className={`${themeClasses.surface} rounded-lg ${themeClasses.effects?.shadow || 'shadow-lg'} ${themeClasses.spacing?.card || 'p-6'} mb-8`}>
      <h3 className={`text-lg font-semibold mb-4 ${themeClasses.heading}`}>Theme Selector</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(themes).map(([themeId, themeConfig]) => (
          <button
            key={themeId}
            onClick={() => handleThemeChange(themeId)}
            className={`p-4 rounded-lg border-2 ${themeClasses.effects?.transition || 'transition-all duration-200'} ${
              theme === themeId
                ? `border-${themeConfig.colors.primary}-500 bg-${themeConfig.colors.primary}-50`
                : `${themeClasses.border} hover:border-${themeConfig.colors.primary}-300`
            }`}
          >
            <div className={`text-sm font-medium mb-1 ${themeClasses.heading}`}>{themeConfig.name}</div>
            <div className={`text-xs ${themeClasses.textSecondary}`}>{themeConfig.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
