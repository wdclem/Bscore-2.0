'use client';

import { useTheme } from '@theme/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, changeTheme } = useTheme();

  const isDark = theme === 'videobg-dark';
  const isLight = theme === 'videobg-light';

  const handleToggle = () => {
    if (isDark) {
      changeTheme('videobg-light');
    } else {
      changeTheme('videobg-dark');
    }
  };

  // Get button color based on theme
  const getButtonColor = () => {
    if (isLight) {
      return 'bg-emerald-600 hover:bg-emerald-700';
    }
    return 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <div className="flex items-center gap-3">
      {/* Current mode icon */}
      <div className="transition-all duration-300">
        {isDark ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : isLight ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Toggle Switch */}
      <div className={`switcher-background h-7 p-1 shadow-inner transition-all duration-300 ${getButtonColor()} cursor-pointer rounded-full`} onClick={handleToggle}>
        <div className="relative aspect-[2/1] h-full">
          <div className={`absolute left-1/2 aspect-square h-full -translate-x-full rounded-full border bg-white transition-all duration-300 ${isDark ? 'translate-x-0' : isLight ? '-translate-x-full' : '-translate-x-1/2'}`}></div>
        </div>
      </div>
    </div>
  );
}
