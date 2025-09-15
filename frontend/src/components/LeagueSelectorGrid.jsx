'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues } from '../lib/apiClient';

export default function LeagueSelectorGrid({ theme = 'default' }) {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (err) {
        console.error('Failed to fetch leagues:', err);
        setError(err.message);
        // Fallback to mock data
        setLeagues([
          { id: 1, name: "NFL", code: "NFL" },
          { id: 2, name: "NHL", code: "NHL" },
          { id: 3, name: "NBA", code: "NBA" },
          { id: 4, name: "MLB", code: "MLB" },
          { id: 5, name: "PREMIER_LEAGUE", code: "PREMIER_LEAGUE" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg">Loading leagues...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {error}
        </div>
      )}
      <div className="text-center mb-4 text-sm text-gray-500">
        Showing {leagues.length} leagues
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {leagues.map((league) => {
          // Convert league name to URL format (PREMIER_LEAGUE -> premier-league)
          const leaguePath = league.name.toLowerCase().replace('_', '-');
          
          return (
            <Link key={league.id} href={`/${leaguePath}/games`} className="group block">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl opacity-20">
                  🏈
                </div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-2 font-bold">{league.name}</div>
                  <div className="text-sm opacity-90">View Games</div>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
