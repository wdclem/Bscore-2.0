'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "@/components/Header";
import GameList from "@/components/GameList";
import TeamPanel from "@/components/TeamPanel";
import LeagueSwitcher from "@/components/LeagueSwitcher";
import dynamic from 'next/dynamic';

// Lazy load statistical components
const StandingsTable = dynamic(() => import("@/components/StandingsTable"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});
const TopScorers = dynamic(() => import("@/components/TopScorers"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});
const AttendanceStats = dynamic(() => import("@/components/AttendanceStats"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});
const ScoreDistribution = dynamic(() => import("@/components/ScoreDistribution"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});
const HomeAwayStats = dynamic(() => import("@/components/HomeAwayStats"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});
const PlayerStats = dynamic(() => import("@/components/PlayerStats"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});
import { getLeagueGames } from "@/lib/apiClient";
import { useTheme } from '@theme/contexts/ThemeContext';

const GAMES_PER_PAGE = 9; // Changed from 10 to 9

export default function LeagueGamesPage() {
  const params = useParams();
  const league = params.league;
  const { theme } = useTheme();
  
  // Convert hyphen to underscore for database lookup
  const code = decodeURIComponent(league).toUpperCase().replace('-', '_');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showTopScorers, setShowTopScorers] = useState(false);
  const [showAttendanceStats, setShowAttendanceStats] = useState(false);
  const [showScoreDistribution, setShowScoreDistribution] = useState(false);
  const [showHomeAwayStats, setShowHomeAwayStats] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);

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

  const loadGames = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentOffset = reset ? 0 : offset;
      const data = await getLeagueGames(code, GAMES_PER_PAGE, currentOffset, selectedTeam);
      
      if (reset) {
        setGames(data);
      } else {
        // Deduplicate games by ID before adding
        setGames(prev => {
          const existingIds = new Set(prev.map(g => g.id));
          const newGames = data.filter(g => !existingIds.has(g.id));
          return [...prev, ...newGames];
        });
      }
      
      setHasMore(data.length === GAMES_PER_PAGE);
      setOffset(currentOffset + GAMES_PER_PAGE);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch games:", err);
      setError("Failed to load games. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (code) {
      loadGames(true);
    }
  }, [code, selectedTeam]);

  const handleLoadMore = () => {
    loadGames(false);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setIsPanelOpen(false);
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12 pt-24"> {/* Added pt-24 to account for fixed header */}
        <div className="mb-8 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${getTextColor()}`}>{code} Games</h1>
              <p className={getSubTextColor()}>Games results</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Standings Toggle Button */}
              <button
                onClick={() => setShowStandings(!showStandings)}
                className={`px-4 sm:px-6 py-3 ${showStandings ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Standings</span>
                <svg className={`w-4 h-4 transition-transform ${showStandings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Top Scorers Toggle Button */}
              <button
                onClick={() => setShowTopScorers(!showTopScorers)}
                className={`px-4 sm:px-6 py-3 ${showTopScorers ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Top Scorers</span>
                <svg className={`w-4 h-4 transition-transform ${showTopScorers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Attendance Stats Toggle Button */}
              <button
                onClick={() => setShowAttendanceStats(!showAttendanceStats)}
                className={`px-4 sm:px-6 py-3 ${showAttendanceStats ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Attendance</span>
                <svg className={`w-4 h-4 transition-transform ${showAttendanceStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Score Distribution Toggle Button */}
              <button
                onClick={() => setShowScoreDistribution(!showScoreDistribution)}
                className={`px-4 sm:px-6 py-3 ${showScoreDistribution ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Score Chart</span>
                <svg className={`w-4 h-4 transition-transform ${showScoreDistribution ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Home/Away Stats Toggle Button */}
              <button
                onClick={() => setShowHomeAwayStats(!showHomeAwayStats)}
                className={`px-4 sm:px-6 py-3 ${showHomeAwayStats ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'} text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
                <span className="hidden sm:inline">Home/Away</span>
                <svg className={`w-4 h-4 transition-transform ${showHomeAwayStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>


              {/* Player Stats Toggle Button */}
              <button
                onClick={() => setShowPlayerStats(!showPlayerStats)}
                className={`px-4 sm:px-6 py-3 ${showPlayerStats ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'} text-white font-semibold rounded-lg transition-all flex items-center space-x-2 touch-manipulation`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Players</span>
                <svg className={`w-4 h-4 transition-transform ${showPlayerStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* League Switcher */}
              <LeagueSwitcher currentLeague={code} />
              
              {/* Team Filter Button */}
              <button
                onClick={() => setIsPanelOpen(true)}
                className="px-4 sm:px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span className="hidden sm:inline">{selectedTeam || 'All Teams'}</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Collapsible Standings Table */}
        <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${showStandings ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showStandings && <StandingsTable leagueCode={code} />}
        </div>

        {/* Collapsible Top Scorers */}
        <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${showTopScorers ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showTopScorers && <TopScorers leagueCode={code} />}
        </div>

        {/* Collapsible Attendance Stats */}
        <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${showAttendanceStats ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showAttendanceStats && <AttendanceStats leagueCode={code} />}
        </div>

        {/* Collapsible Score Distribution */}
        <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${showScoreDistribution ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showScoreDistribution && <ScoreDistribution leagueCode={code} />}
        </div>

        {/* Collapsible Home/Away Stats */}
        <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${showHomeAwayStats ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showHomeAwayStats && <HomeAwayStats leagueCode={code} />}
        </div>

        {/* Collapsible Venue Stats */}

        {/* Collapsible Player Stats */}
        <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${showPlayerStats ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showPlayerStats && <PlayerStats leagueCode={code} />}
        </div>
        
        <GameList 
          games={games}
          loading={loading}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          league={code}
        />
      </main>

      {/* Team Panel */}
      <TeamPanel
        leagueCode={code}
        onTeamSelect={handleTeamSelect}
        selectedTeam={selectedTeam}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}