'use client';

import { useState, useEffect } from 'react';
import { getTopScorers } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';
import { getTextColors } from '@/lib/themeColors';

export default function TopScorers({ leagueCode }) {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const textColors = getTextColors(theme);

  useEffect(() => {
    async function fetchTopScorers() {
      try {
        setLoading(true);
        const data = await getTopScorers(leagueCode, 10);
        setScorers(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch top scorers:", err);
        setError("Failed to load top scorers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchTopScorers();
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

  if (scorers.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow} text-center ${textColors.secondary}`}>
        No scoring data available for {leagueCode}.
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
      <h2 className={`text-2xl font-bold mb-4 ${themeClasses.heading}`}>Top Scorers</h2>
      <div className="space-y-3">
        {scorers.map((player, index) => (
          <div key={`${player.name}-${index}`} className={`flex items-center justify-between p-3 rounded-lg ${themeClasses.surface} ${themeClasses.border}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${themeClasses.surface} ${textColors.primary}`}>
                {index + 1}
              </div>
              <div>
                <div className={`font-medium ${textColors.primary}`}>{player.name}</div>
                <div className={`text-sm ${textColors.secondary}`}>
                  {player.team} • {player.position}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${textColors.primary}`}>{player.goals}</span>
              <span className={`text-sm ${textColors.secondary}`}>goals</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
