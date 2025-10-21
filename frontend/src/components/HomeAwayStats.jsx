'use client';

import { useState, useEffect } from 'react';
import { getHomeAwayStats } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';

export default function HomeAwayStats({ leagueCode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    async function fetchHomeAwayStats() {
      try {
        setLoading(true);
        const data = await getHomeAwayStats(leagueCode);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch home/away stats:", err);
        setError("Failed to load home/away stats. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchHomeAwayStats();
  }, [leagueCode]);

  if (loading) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (!stats || stats.total_games === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow} text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        No game data available for {leagueCode}.
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
      <h2 className={`text-2xl font-bold mb-4 ${themeClasses.heading}`}>Home vs Away Stats</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-green-500 mb-2`}>
            {stats.home_wins}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Home Wins</div>
          <div className={`text-lg font-semibold text-green-500`}>
            {stats.home_win_percentage}%
          </div>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-blue-500 mb-2`}>
            {stats.away_wins}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Away Wins</div>
          <div className={`text-lg font-semibold text-blue-500`}>
            {stats.away_win_percentage}%
          </div>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-purple-500 mb-2`}>
            {stats.draws}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Draws</div>
          <div className={`text-lg font-semibold text-purple-500`}>
            {stats.draw_percentage}%
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${themeClasses.heading}`}>Win Distribution</h3>
        
        <div className="space-y-3">
          {/* Home Wins Bar */}
          <div className="flex items-center space-x-4">
            <div className={`w-20 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Home Wins
            </div>
            <div className="flex-1 relative">
              <div className="h-8 rounded-lg bg-green-500 flex items-center justify-end pr-3"
                   style={{ width: `${Math.max(stats.home_win_percentage, 2)}%` }}>
                <span className="text-white text-sm font-medium">
                  {stats.home_win_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Away Wins Bar */}
          <div className="flex items-center space-x-4">
            <div className={`w-20 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Away Wins
            </div>
            <div className="flex-1 relative">
              <div className="h-8 rounded-lg bg-blue-500 flex items-center justify-end pr-3"
                   style={{ width: `${Math.max(stats.away_win_percentage, 2)}%` }}>
                <span className="text-white text-sm font-medium">
                  {stats.away_win_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Draws Bar */}
          <div className="flex items-center space-x-4">
            <div className={`w-20 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Draws
            </div>
            <div className="flex-1 relative">
              <div className="h-8 rounded-lg bg-purple-500 flex items-center justify-end pr-3"
                   style={{ width: `${Math.max(stats.draw_percentage, 2)}%` }}>
                <span className="text-white text-sm font-medium">
                  {stats.draw_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className={`mt-4 p-3 rounded-lg ${themeClasses.surface} ${themeClasses.border}`}>
        <div className={`text-sm ${themeClasses.textSecondary} text-center`}>
          Based on {stats.total_games} games analyzed
        </div>
      </div>
    </div>
  );
}
