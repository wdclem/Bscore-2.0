'use client';

import { useState, useEffect } from 'react';
import { getVenueStats } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';

export default function VenueStats({ leagueCode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    async function fetchVenueStats() {
      try {
        setLoading(true);
        const result = await getVenueStats(leagueCode);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch venue stats:", err);
        setError("Failed to load venue stats. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchVenueStats();
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
        No venue data available for {leagueCode}.
      </div>
    );
  }

  // Get top 10 most used venues for the chart
  const topVenues = data.venues.slice(0, 10);
  const maxGames = Math.max(...topVenues.map(item => item.games));

  return (
    <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
      <h2 className={`text-2xl font-bold mb-4 ${themeClasses.heading}`}>Venue Statistics</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-blue-500 mb-2`}>
            {data.total_games}
          </div>
          <div className={`text-sm ${themeClasses.textSecondary}`}>Games with Venue Data</div>
        </div>
        
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-green-500 mb-2`}>
            {data.total_unique_venues}
          </div>
          <div className={`text-sm ${themeClasses.textSecondary}`}>Unique Venues</div>
        </div>
        
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-lg font-bold text-purple-500 mb-2 truncate`} title={data.most_used_venue}>
            {data.most_used_venue || 'N/A'}
          </div>
          <div className={`text-sm ${themeClasses.textSecondary}`}>Most Used Venue</div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold ${themeClasses.heading}`}>Top 10 Most Used Venues</h3>
        
        {topVenues.map((item, index) => {
          const barWidth = (item.games / maxGames) * 100;
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
            <div key={item.venue} className="flex items-center space-x-4">
              <div className={`w-32 text-sm font-medium ${themeClasses.text} truncate`} title={item.venue}>
                {item.venue}
              </div>
              
              <div className="flex-1 relative">
                <div className={`h-8 rounded-lg ${colors[index % colors.length]} flex items-center justify-end pr-3`}
                     style={{ width: `${Math.max(barWidth, 5)}%` }}>
                  <span className="text-white text-sm font-medium">
                    {item.games} ({item.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Venue List */}
      {data.venues.length > 10 && (
        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-3 ${themeClasses.heading}`}>All Venues</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.venues.map((item, index) => (
              <div key={item.venue} className={`p-3 rounded ${themeClasses.surface} ${themeClasses.border}`}>
                <div className={`font-medium ${themeClasses.text} truncate`} title={item.venue}>
                  {item.venue}
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.games} games ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
