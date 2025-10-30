'use client';

import { useParams } from 'next/navigation';
import Header from "@/components/Header";
import StandingsTable from "@/components/StandingsTable";
import LeagueSwitcher from "@/components/LeagueSwitcher";
import { useTheme } from '@theme/contexts/ThemeContext';

export default function StandingsPage() {
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
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${getTextColor()}`}>{code} Standings</h1>
              <p className={getSubTextColor()}>Current league standings and team records</p>
            </div>
            
            <div className="flex items-center gap-3">
              <LeagueSwitcher currentLeague={code} />
            </div>
          </div>
        </div>

        <StandingsTable leagueCode={code} />
      </main>
    </div>
  );
}
