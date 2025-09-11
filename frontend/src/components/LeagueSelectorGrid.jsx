'use client';

import { useState, useEffect } from 'react';
import LeagueCard from './LeagueCard';
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
          { id: 1, name: "National Football League", code: "NFL" },
          { id: 2, name: "National Hockey League", code: "NHL" },
          { id: 3, name: "National Basketball Association", code: "NBA" },
          { id: 4, name: "Major League Baseball", code: "MLB" },
          { id: 5, name: "Premier League", code: "Premier League" },
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
        {leagues.map((league) => (
          <LeagueCard 
            key={league.code} 
            code={league.code} 
            name={league.name}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
