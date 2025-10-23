/**
 * Cached API client that wraps the regular API client with caching
 */

import * as apiClient from './apiClient';
import cacheService from './cacheService';

class CachedApiClient {
  constructor() {
    this.apiClient = apiClient;
  }

  /**
   * Simple cached request method
   */
  async cachedRequest(cacheKey, apiCall, ttl = null) {
    // Check cache first
    const cached = cacheService.get(cacheKey, {});
    if (cached) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return cached;
    }

    // Make API request
    console.log(`🌐 API request for ${cacheKey}`);
    try {
      const data = await apiCall();
      
      // Cache the response
      cacheService.set(cacheKey, {}, data, ttl);
      
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${cacheKey}:`, error);
      throw error;
    }
  }

  // Cached versions of API methods
  async getLeagueGames(leagueCode, limit = 20, offset = 0, teamFilter = null) {
    return this.cachedRequest(
      `league-games-${leagueCode}-${limit}-${offset}-${teamFilter || 'all'}`,
      () => this.apiClient.getLeagueGames(leagueCode, limit, offset, teamFilter),
      2 * 60 * 1000
    ); // 2 minutes
  }

  async getTeamStats(teamId) {
    return this.cachedRequest(
      `team-stats-${teamId}`,
      () => this.apiClient.getTeamStats(teamId),
      10 * 60 * 1000
    ); // 10 minutes
  }

  async getTopScorers(leagueCode, limit = 10) {
    return this.cachedRequest(
      `top-scorers-${leagueCode}-${limit}`,
      () => this.apiClient.getTopScorers(leagueCode, limit),
      30 * 60 * 1000
    ); // 30 minutes
  }

  async getAttendanceStats(leagueCode) {
    return this.cachedRequest(
      `attendance-stats-${leagueCode}`,
      () => this.apiClient.getAttendanceStats(leagueCode),
      30 * 60 * 1000
    ); // 30 minutes
  }

  async getScoreDistribution(leagueCode) {
    return this.cachedRequest(
      `score-distribution-${leagueCode}`,
      () => this.apiClient.getScoreDistribution(leagueCode),
      30 * 60 * 1000
    ); // 30 minutes
  }

  async getHomeAwayStats(leagueCode) {
    return this.cachedRequest(
      `home-away-stats-${leagueCode}`,
      () => this.apiClient.getHomeAwayStats(leagueCode),
      30 * 60 * 1000
    ); // 30 minutes
  }


  async getPlayerStats(leagueCode, statType = 'scoring', limit = 20) {
    return this.cachedRequest(
      `player-stats-${leagueCode}-${statType}-${limit}`,
      () => this.apiClient.getPlayerStats(leagueCode, statType, limit),
      30 * 60 * 1000
    ); // 30 minutes
  }

  // Cache management methods
  clearCache(endpoint = null) {
    cacheService.clear(endpoint);
  }

  getCacheStats() {
    return cacheService.getStats();
  }
}

// Create singleton instance
const cachedApiClient = new CachedApiClient();

export default cachedApiClient;
