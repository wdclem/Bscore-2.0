'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@theme/contexts/ThemeContext';

export default function StandingsTable({ leagueCode }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    loadStandings();
  }, [leagueCode]);

  const loadStandings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8001/api/leagues/${leagueCode}/standings`);
      
      if (!response.ok) {
        throw new Error('Failed to load standings');
      }
      
      const data = await response.json();
      setStandings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading standings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'videobg-dark':
        return {
          bg: 'bg-slate-800/90',
          headerBg: 'bg-slate-700',
          text: 'text-white',
          subText: 'text-gray-300',
          border: 'border-slate-600',
          hoverBg: 'hover:bg-slate-700/50'
        };
      case 'videobg-light':
        return {
          bg: 'bg-white/90',
          headerBg: 'bg-emerald-100',
          text: 'text-emerald-900',
          subText: 'text-emerald-700',
          border: 'border-emerald-200',
          hoverBg: 'hover:bg-emerald-50'
        };
      default:
        return {
          bg: 'bg-white/90',
          headerBg: 'bg-blue-100',
          text: 'text-gray-900',
          subText: 'text-gray-700',
          border: 'border-gray-200',
          hoverBg: 'hover:bg-gray-50'
        };
    }
  };

  const colors = getThemeColors();

  if (loading) {
    return (
      <div className={`${colors.bg} rounded-xl p-6 shadow-lg backdrop-blur-sm`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${colors.bg} rounded-xl p-6 shadow-lg backdrop-blur-sm`}>
        <p className="text-red-500">Error loading standings: {error}</p>
      </div>
    );
  }

  // Determine which columns to show based on league
  const isNHL = leagueCode === 'NHL';
  const isPremierLeague = leagueCode === 'PREMIER_LEAGUE';
  const isNFL = leagueCode === 'NFL';

  return (
    <div className={`${colors.bg} rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden`}>
      <div className={`${colors.headerBg} px-6 py-4 border-b ${colors.border}`}>
        <h2 className={`text-2xl font-bold ${colors.text}`}>Standings</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${colors.headerBg} border-b ${colors.border}`}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-semibold ${colors.text} uppercase tracking-wider`}>#</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold ${colors.text} uppercase tracking-wider`}>Team</th>
              <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>GP</th>
              <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>W</th>
              {isPremierLeague && (
                <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>D</th>
              )}
              <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>L</th>
              {isNHL && (
                <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>OT</th>
              )}
              {(isNHL || isPremierLeague) && (
                <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>PTS</th>
              )}
              {isNFL && (
                <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>PCT</th>
              )}
              {(isNHL || isPremierLeague) && (
                <>
                  <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>GF</th>
                  <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>GA</th>
                  <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>DIFF</th>
                </>
              )}
              {isNFL && (
                <>
                  <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>PF</th>
                  <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.text} uppercase tracking-wider`}>PA</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {standings.map((standing, index) => (
              <tr key={standing.team_id} className={`${colors.hoverBg} transition-colors`}>
                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${colors.text}`}>
                  {index + 1}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap`}>
                  <div className="flex items-center space-x-3">
                    {standing.team_logo && (
                      <img 
                        src={standing.team_logo} 
                        alt={standing.team_name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className={`text-sm font-medium ${colors.text}`}>{standing.team_name}</span>
                  </div>
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                  {standing.games_played}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-green-600`}>
                  {standing.wins}
                </td>
                {isPremierLeague && (
                  <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                    {standing.draws || 0}
                  </td>
                )}
                <td className={`px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-red-600`}>
                  {standing.losses}
                </td>
                {isNHL && (
                  <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                    {standing.ot_losses || 0}
                  </td>
                )}
                {(isNHL || isPremierLeague) && (
                  <td className={`px-4 py-3 whitespace-nowrap text-center text-sm font-bold ${colors.text}`}>
                    {standing.points || 0}
                  </td>
                )}
                {isNFL && (
                  <td className={`px-4 py-3 whitespace-nowrap text-center text-sm font-bold ${colors.text}`}>
                    {standing.win_pct ? standing.win_pct.toFixed(3) : '0.000'}
                  </td>
                )}
                {(isNHL || isPremierLeague) && (
                  <>
                    <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                      {standing.goals_for || 0}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                      {standing.goals_against || 0}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-center text-sm font-medium ${standing.goal_diff > 0 ? 'text-green-600' : standing.goal_diff < 0 ? 'text-red-600' : colors.subText}`}>
                      {standing.goal_diff > 0 ? '+' : ''}{standing.goal_diff || 0}
                    </td>
                  </>
                )}
                {isNFL && (
                  <>
                    <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                      {standing.points_for || 0}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${colors.subText}`}>
                      {standing.points_against || 0}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

