"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/games");
        if (!res.ok) throw new Error("Failed to fetch games");
        const data = await res.json();
        setGames(data);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">NHL Games</h1>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await fetch(
                (process.env.NEXT_PUBLIC_API_URL?.replace("/games", "") || "http://localhost:8000") +
                  "/scrape",
                { method: "POST" }
              );
              if (!res.ok) throw new Error("Failed to scrape");
              const res2 = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/games");
              setGames(await res2.json());
            } catch (e) {
              setError(String(e));
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Scrape now
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map((g) => (
          <li key={g.id ?? `${g.awayTeam}-${g.homeTeam}-${g.scrapedAt}`} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{g.awayTeam}</div>
                <div className="text-sm">Score: {g.awayScore}</div>
              </div>
              <div>
                <div className="font-semibold text-right">{g.homeTeam}</div>
                <div className="text-sm text-right">Score: {g.homeScore}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
