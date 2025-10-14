'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "@/components/Header";
import GameList from "@/components/GameList";
import TeamPanel from "@/components/TeamPanel";
import LeagueSwitcher from "@/components/LeagueSwitcher";
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