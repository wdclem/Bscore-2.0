"use client";
import Link from "next/link";
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  // Video background clean header
  if (theme.startsWith('videobg')) {
    const getAccentColor = () => {
      switch (theme) {
        case 'videobg-light':
          return 'text-emerald-400';
        default:
          return 'text-blue-400';
      }
    };

    const getButtonColor = () => {
      switch (theme) {
        case 'videobg-light':
          return 'bg-emerald-600 hover:bg-emerald-700';
        default:
          return 'bg-blue-600 hover:bg-blue-700';
      }
    };

    return (
      <header className="fixed top-0 z-50 w-full bg-black bg-opacity-40 transition-all duration-500">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-light text-white">
            Better<span className={getAccentColor()}>Score</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/league-selector" className="text-white text-opacity-80 hover:text-white hover:text-opacity-100 font-light transition-all duration-300">
              Leagues
            </Link>
            <Link href="/about" className="text-white text-opacity-80 hover:text-white hover:text-opacity-100 font-light transition-all duration-300">
              About
            </Link>
            <button className={`px-6 py-2 rounded-full ${getButtonColor()} text-white font-medium transition-all duration-300`}>
              View Games
            </button>
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Default header for other themes
  return (
    <header className={`${themeClasses.surface} backdrop-blur-sm border-b ${themeClasses.border} sticky top-0 z-50`}>
      <div className={`${themeClasses.container} py-4 flex items-center justify-between`}>
        <Link href="/" className={`text-2xl font-bold ${themeClasses.heading}`}>
          Better<span className={`text-${theme === 'dark' ? 'blue-400' : 'blue-600'}`}>Score</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/league-selector" className={`${themeClasses.textSecondary} hover:text-blue-600 font-medium transition-colors`}>
            Leagues
          </Link>
          <Link href="/about" className={`${themeClasses.textSecondary} hover:text-blue-600 font-medium transition-colors`}>
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


