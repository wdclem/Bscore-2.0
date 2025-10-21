'use client';

import { useState, useEffect } from 'react';
import { getPlayerStats } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';

export default function PlayerStats({ leagueCode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statType, setStatType] = useState('scoring');
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    async function fetchPlayerStats() {
      try {
        setLoading(true);
        const result = await getPlayerStats(leagueCode, statType, 10);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch player stats:", err);
        setError("Failed to load player stats. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchPlayerStats();
  }, [leagueCode, statType]);

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

  if (!data || data.players.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow} text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        No player stats available for {leagueCode}.
      </div>
    );
  }

  const getStatColumns = () => {
    switch (leagueCode) {
      case 'NHL':
        return [
          { key: 'goals', label: 'Goals' },
          { key: 'assists', label: 'Assists' },
          { key: 'points', label: 'Points' }
        ];
      case 'PREMIER_LEAGUE':
        return [
          { key: 'goals', label: 'Goals' },
          { key: 'assists', label: 'Assists' },
          { key: 'points', label: 'Points' }
        ];
      case 'NFL':
        if (statType === 'passing') {
          return [
            { key: 'pass_yards', label: 'Pass Yards' },
            { key: 'pass_touchdowns', label: 'TDs' },
            { key: 'interceptions', label: 'INTs' }
          ];
        }
        return [];
      case 'NBA':
        return [
          { key: 'points_per_game', label: 'PPG' },
          { key: 'rebounds_per_game', label: 'RPG' },
          { key: 'assists_per_game', label: 'APG' }
        ];
      default:
        return [];
    }
  };

  const statColumns = getStatColumns();

  return (
    <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className={`text-2xl font-bold ${themeClasses.heading}`}>Player Statistics</h2>
        
        {/* Stat Type Selector for NFL */}
        {leagueCode === 'NFL' && (
          <div className="mt-4 sm:mt-0">
            <select
              value={statType}
              onChange={(e) => setStatType(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.surface} ${themeClasses.border} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <option value="passing">Passing</option>
              <option value="rushing">Rushing</option>
              <option value="receiving">Receiving</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {data.players.map((player, index) => (
          <div key={`${player.name}-${index}`} className={`flex items-center justify-between p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border}`}>
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${themeClasses.surface}`}>
                {index + 1}
              </div>
              <div>
                <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{player.name}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {player.team} • {player.position}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {statColumns.map((col) => (
                <div key={col.key} className="text-center">
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {player[col.key] || '-'}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {col.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className={`mt-4 p-3 rounded-lg ${themeClasses.surface} ${themeClasses.border}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center`}>
          Top {data.players.length} players in {statType} statistics
        </div>
      </div>
    </div>
  );
}
