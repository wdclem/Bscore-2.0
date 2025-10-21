'use client';

import { useState, useEffect } from 'react';
import { getTeamStats } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';

export default function TeamStatsTooltip({ teamId, teamName, children }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    if (show && teamId && !stats) {
      setLoading(true);
      getTeamStats(teamId)
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch team stats:', err);
          setLoading(false);
        });
    }
  }, [show, teamId, stats]);

  if (!teamId) return children;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
      {show && (
        <div className={`absolute z-50 w-64 p-4 mt-2 rounded-lg shadow-lg border ${themeClasses.surface} ${themeClasses.border} transform -translate-x-1/2 left-1/2`}>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {stats.team_logo && (
                  <img 
                    src={stats.team_logo} 
                    alt={stats.team_name} 
                    className="w-8 h-8 object-contain"
                  />
                )}
                <h3 className={`font-bold text-lg ${themeClasses.heading}`}>
                  {stats.team_name}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className={`text-center p-2 rounded ${themeClasses.surface}`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.wins}</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Wins</div>
                </div>
                <div className={`text-center p-2 rounded ${themeClasses.surface}`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.losses}</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Losses</div>
                </div>
                <div className={`text-center p-2 rounded ${themeClasses.surface}`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.draws}</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Draws</div>
                </div>
                <div className={`text-center p-2 rounded ${themeClasses.surface}`}>
                  <div className={`text-2xl font-bold text-green-500`}>{stats.win_percentage}%</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Win Rate</div>
                </div>
              </div>
              
              <div className={`text-center pt-2 border-t ${themeClasses.border}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stats.total_games} games played
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-4 ${themeClasses.textSecondary}`}>
              No stats available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
