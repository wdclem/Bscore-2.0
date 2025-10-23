/**
 * Simple in-memory cache service for API responses
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get cached data if it exists and is not expired
   */
  get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set cached data with TTL
   */
  set(endpoint, params = {}, data, ttl = null) {
    const key = this.generateKey(endpoint, params);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
  }

  /**
   * Clear all cache or specific endpoint
   */
  clear(endpoint = null) {
    if (endpoint) {
      // Clear specific endpoint
      for (const [key, value] of this.cache.entries()) {
        if (key.startsWith(`${endpoint}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let total = 0;
    let expired = 0;
    let active = 0;

    for (const [key, value] of this.cache.entries()) {
      total++;
      if (now > value.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total,
      active,
      expired,
      size: this.cache.size
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Clean up expired entries every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

export default cacheService;
