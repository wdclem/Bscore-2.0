'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "@/components/Header";
import GameList from "@/components/GameList";
import { getLeagueGames } from "@/lib/apiClient";

export default function LeagueGamesPage() {
  const params = useParams();
  const league = params.league;
  const code = decodeURIComponent(league).toUpperCase();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        const data = await getLeagueGames(code);
        setGames(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch games:", err);
        setError("Failed to load games. Please try again later.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchGames();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{code} Games</h1>
          <p className="text-gray-600">Recent games and scores</p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              {error}
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Loading games...</div>
          </div>
        ) : games.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No games found for {code}</div>
            <div className="text-gray-400 text-sm mt-2">Games will appear here once data is available</div>
          </div>
        ) : (
          <GameList games={games} />
        )}
      </main>
    </div>
  );
}


