'use client';

import { useState, useEffect } from 'react';
import { getScoreDistribution } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';

export default function ScoreDistribution({ leagueCode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    async function fetchScoreDistribution() {
      try {
        setLoading(true);
        const result = await getScoreDistribution(leagueCode);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch score distribution:", err);
        setError("Failed to load score distribution. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchScoreDistribution();
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

  if (!data || data.total_games === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow} text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        No score data available for {leagueCode}.
      </div>
    );
  }

  // Get top 10 most common scores for the chart
  const topScores = data.score_distribution.slice(0, 10);
  const maxCount = Math.max(...topScores.map(item => item.count));

  return (
    <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
      <h2 className={`text-2xl font-bold mb-4 ${themeClasses.heading}`}>Score Distribution</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-2xl font-bold text-blue-500 mb-1`}>
            {data.total_games}
          </div>
          <div className={`text-sm ${themeClasses.textSecondary}`}>Total Games</div>
        </div>
        
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-2xl font-bold text-green-500 mb-1`}>
            {data.most_common_score || 'N/A'}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Most Common Score</div>
        </div>
        
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-2xl font-bold text-purple-500 mb-1`}>
            {data.average_goals_per_game}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Goals/Game</div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold ${themeClasses.heading}`}>Top 10 Most Common Scores</h3>
        
        {topScores.map((item, index) => {
          const barWidth = (item.count / maxCount) * 100;
          const colors = [
            'bg-blue-500',
            'bg-green-500', 
            'bg-purple-500',
            'bg-orange-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-red-500',
            'bg-yellow-500',
            'bg-teal-500',
            'bg-gray-500'
          ];
          
          return (
            <div key={item.score} className="flex items-center space-x-4">
              <div className={`w-16 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {item.score}
              </div>
              
              <div className="flex-1 relative">
                <div className={`h-8 rounded-lg ${colors[index % colors.length]} flex items-center justify-end pr-3`}
                     style={{ width: `${Math.max(barWidth, 5)}%` }}>
                  <span className="text-white text-sm font-medium">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Distribution Table */}
      {data.score_distribution.length > 10 && (
        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-3 ${themeClasses.heading}`}>All Score Combinations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {data.score_distribution.map((item, index) => (
              <div key={item.score} className={`p-2 rounded ${themeClasses.surface} ${themeClasses.border} text-center`}>
                <div className={`font-medium ${themeClasses.text}`}>{item.score}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
