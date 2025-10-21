'use client';

import { useState, useEffect } from 'react';
import { getAttendanceStats } from '@/lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';
import { getTextColors } from '@/lib/themeColors';

export default function AttendanceStats({ leagueCode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const textColors = getTextColors(theme);

  useEffect(() => {
    async function fetchAttendanceStats() {
      try {
        setLoading(true);
        const data = await getAttendanceStats(leagueCode);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch attendance stats:", err);
        setError("Failed to load attendance stats. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendanceStats();
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

  if (!stats || stats.games_with_attendance === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow} text-center ${textColors.secondary}`}>
        No attendance data available for {leagueCode}.
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className={`p-6 rounded-xl ${themeClasses.surface} ${themeClasses.shadow}`}>
      <h2 className={`text-2xl font-bold mb-4 ${themeClasses.heading}`}>Attendance Stats</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Attendance */}
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-green-500 mb-2`}>
            {formatNumber(stats.highest_attendance)}
          </div>
          <div className={`text-sm ${textColors.secondary}`}>Highest Attendance</div>
        </div>

        {/* Average Attendance */}
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-blue-500 mb-2`}>
            {formatNumber(stats.average_attendance)}
          </div>
          <div className={`text-sm ${textColors.secondary}`}>Average Attendance</div>
        </div>

        {/* Total Attendance */}
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-purple-500 mb-2`}>
            {formatNumber(stats.total_attendance)}
          </div>
          <div className={`text-sm ${textColors.secondary}`}>Total Attendance</div>
        </div>

        {/* Games with Data */}
        <div className={`p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border} text-center`}>
          <div className={`text-3xl font-bold text-orange-500 mb-2`}>
            {stats.games_with_attendance}
          </div>
          <div className={`text-sm ${textColors.secondary}`}>Games with Data</div>
        </div>
      </div>

      {/* Highest Attendance Game Details */}
      {stats.highest_attendance_game && (
        <div className={`mt-6 p-4 rounded-lg ${themeClasses.surface} ${themeClasses.border}`}>
          <h3 className={`text-lg font-semibold mb-3 ${textColors.primary}`}>
            🏆 Highest Attendance Game
          </h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div>
              <div className={`text-sm ${textColors.secondary} mb-1`}>Match</div>
              <div className={`font-semibold ${textColors.primary}`}>
                {stats.highest_attendance_game.home_team} vs {stats.highest_attendance_game.away_team}
              </div>
            </div>
            <div>
              <div className={`text-sm ${textColors.secondary} mb-1`}>Score</div>
              <div className={`font-semibold ${textColors.primary}`}>
                {stats.highest_attendance_game.home_score} - {stats.highest_attendance_game.away_score}
              </div>
            </div>
            {stats.highest_attendance_game.venue && (
              <div>
                <div className={`text-sm ${textColors.secondary} mb-1`}>Venue</div>
                <div className={`font-semibold ${textColors.primary}`}>
                  {stats.highest_attendance_game.venue}
                </div>
              </div>
            )}
            {stats.highest_attendance_game.game_date && (
              <div>
                <div className={`text-sm ${textColors.secondary} mb-1`}>Date</div>
                <div className={`font-semibold ${textColors.primary}`}>
                  {new Date(stats.highest_attendance_game.game_date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className={`mt-4 p-3 rounded-lg ${themeClasses.surface} ${themeClasses.border}`}>
        <div className={`text-sm ${textColors.secondary} text-center`}>
          Based on {stats.games_with_attendance} games with attendance data
        </div>
      </div>
    </div>
  );
}
