export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export async function getJson(path, init) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${url}`);
  }
  return res.json();
}

// API functions for leagues and games
export async function getLeagues() {
  return getJson("/api/leagues");
}

export async function getLeagueGames(leagueCode, limit = 20, offset = 0, teamFilter = null) {
  let url = `/api/leagues/${leagueCode}/games?limit=${limit}&offset=${offset}`;
  if (teamFilter) {
    url += `&team=${encodeURIComponent(teamFilter)}`;
  }
  return getJson(url);
}

// Add teams API function
export async function getLeagueTeams(leagueCode) {
  return getJson(`/api/leagues/${leagueCode}/teams`);
}


