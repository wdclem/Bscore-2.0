'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLeagues } from '@/lib/apiClient';

export default function LeagueSwitcher({ currentLeague }) {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (error) {
        console.error('Failed to load leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagues();
  }, []);

  const handleLeagueSelect = (league) => {
    // Convert league name to URL format (PREMIER_LEAGUE -> premier-league)
    const leaguePath = league.name.toLowerCase().replace('_', '-');
    router.push(`/${leaguePath}/games`);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="text-gray-500">Loading leagues...</div>
    );
  }

  const currentLeagueData = leagues.find(l => l.name === currentLeague);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <span className="text-gray-900 font-medium">
          {currentLeagueData ? currentLeagueData.name : 'Select League'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => handleLeagueSelect(league)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center justify-between transition-colors ${
                league.name === currentLeague ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
              }`}
            >
              <span>{league.name}</span>
              {league.name === currentLeague && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
