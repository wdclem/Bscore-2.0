'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from "@/components/Header";
import PlayerStats from "@/components/PlayerStats";
import LeagueSwitcher from "@/components/LeagueSwitcher";
import { useTheme } from '@theme/contexts/ThemeContext';

export default function PlayersPage() {
  const params = useParams();
  const league = params.league;
  const { theme } = useTheme();
  
  // Convert hyphen to underscore for database lookup
  const code = decodeURIComponent(league).toUpperCase().replace('-', '_');

  // Get background and text colors based on theme
  const getBackgroundClass = () => {
    switch (theme) {
      case 'videobg-dark':
        return 'bg-gradient-to-br from-slate-800 to-slate-900';
      case 'videobg-light':
        return 'bg-gradient-to-br from-emerald-50 to-green-100';
      default:
        return 'bg-gradient-to-br from-slate-50 to-slate-100';
    }
  };

  const getTextColor = () => {
    switch (theme) {
      case 'videobg-dark':
        return 'text-white';
      case 'videobg-light':
        return 'text-emerald-900';
      default:
        return 'text-gray-900';
    }
  };

  const getSubTextColor = () => {
    switch (theme) {
      case 'videobg-dark':
        return 'text-gray-300';
      case 'videobg-light':
        return 'text-emerald-700';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12 pt-24">
        <div className="mb-8 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${getTextColor()}`}>{code} Player Stats</h1>
              <p className={getSubTextColor()}>Individual player statistics and performance</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/${league}/games`}
                className="px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Games</span>
              </Link>

              <Link
                href={`/${league}/top-scorers`}
                className="px-4 sm:px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Top Scorers</span>
              </Link>

              <Link
                href={`/${league}/attendance`}
                className="px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Attendance</span>
              </Link>

              <Link
                href={`/${league}/score-distribution`}
                className="px-4 sm:px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Score Chart</span>
              </Link>

              <Link
                href={`/${league}/home-away`}
                className="px-4 sm:px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
                <span className="hidden sm:inline">Home/Away</span>
              </Link>
              
              <LeagueSwitcher currentLeague={code} />
            </div>
          </div>
        </div>

        <PlayerStats leagueCode={code} />
      </main>
    </div>
  );
}
