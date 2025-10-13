// Favorite teams management using localStorage

const FAVORITES_KEY = 'betterscore_favorites';

export function getFavoriteTeams() {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

export function addFavoriteTeam(teamName) {
  const favorites = getFavoriteTeams();
  
  if (!favorites.includes(teamName)) {
    favorites.push(teamName);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
  
  return favorites;
}

export function removeFavoriteTeam(teamName) {
  const favorites = getFavoriteTeams();
  const updated = favorites.filter(team => team !== teamName);
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleFavoriteTeam(teamName) {
  const favorites = getFavoriteTeams();
  
  if (favorites.includes(teamName)) {
    return removeFavoriteTeam(teamName);
  } else {
    return addFavoriteTeam(teamName);
  }
}

export function isFavoriteTeam(teamName) {
  return getFavoriteTeams().includes(teamName);
}

