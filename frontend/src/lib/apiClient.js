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

// Get team statistics
export async function getTeamStats(teamId) {
  return getJson(`/api/teams/${teamId}/stats`);
}

// Get league standings
export async function getLeagueStandings(leagueCode) {
  return getJson(`/api/leagues/${leagueCode}/standings`);
}

// Get top scorers for a league
export async function getTopScorers(leagueCode, limit = 10) {
  return getJson(`/api/leagues/${leagueCode}/top-scorers?limit=${limit}`);
}

// Get attendance statistics for a league
export async function getAttendanceStats(leagueCode) {
  return getJson(`/api/leagues/${leagueCode}/attendance-stats`);
}

// Get score distribution for a league
export async function getScoreDistribution(leagueCode) {
  return getJson(`/api/leagues/${leagueCode}/score-distribution`);
}

// Get home vs away statistics for a league
export async function getHomeAwayStats(leagueCode) {
  return getJson(`/api/leagues/${leagueCode}/home-away-stats`);
}

// Get venue statistics for a league
export async function getVenueStats(leagueCode) {
  return getJson(`/api/leagues/${leagueCode}/venue-stats`);
}

// Get player statistics for a league
export async function getPlayerStats(leagueCode, statType = 'scoring', limit = 20) {
  return getJson(`/api/leagues/${leagueCode}/player-stats?stat_type=${statType}&limit=${limit}`);
}


