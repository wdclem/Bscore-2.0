'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues } from '../lib/apiClient';
import { useTheme } from '@theme/contexts/ThemeContext';
import { getThemeClasses } from '@theme/config/themes';

const leagueAssets = {
  NFL: { 
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/200px-National_Football_League_logo.svg.png",
    gradient: "from-green-500 via-green-600 to-green-700",
    accent: "green-400"
  },
  NHL: { 
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/200px-05_NHL_Shield.svg.png", 
    gradient: "from-blue-500 via-blue-600 to-blue-700",
    accent: "blue-400"
  },
  NBA: { 
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/200px-National_Basketball_Association_logo.svg.png",
    gradient: "from-orange-500 via-red-500 to-red-600",
    accent: "orange-400"
  },
  MLB: { 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/200px-Major_League_Baseball_logo.svg.png",
    gradient: "from-red-500 via-red-600 to-red-700",
    accent: "red-400"
  },
  PREMIER_LEAGUE: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/200px-Premier_League_Logo.svg.png",
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    accent: "purple-400"
  }
};

export default function LeagueSelectorGrid() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

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
      <div className="flex justify-center items-center py-16">
        <div className={`animate-pulse text-lg ${themeClasses.textSecondary}`}>Loading leagues...</div>
      </div>
    );
  }

  // Karellis-inspired layout with centered container
  if (theme === 'videobg-1') {
    return (
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-8 p-4 rounded-2xl border border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-sm text-white text-opacity-80">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-light bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 text-white text-opacity-80">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {leagues.length} leagues available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {leagues.map((league) => {
            const assets = leagueAssets[league.name] || leagueAssets.NFL;
            const leaguePath = league.name.toLowerCase().replace('_', '-');
            
            return (
              <Link key={league.id} href={`/${leaguePath}/games`} className="block group">
                <div className="relative overflow-hidden rounded-3xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-3 hover:bg-opacity-20">
                  {/* Content */}
                  <div className="p-10 text-center">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                      <div className="relative">
                        <img 
                          src={assets.logo} 
                          alt={`${league.name} logo`}
                          className="w-24 h-24 object-contain transition-transform duration-700 group-hover:scale-110 filter drop-shadow-lg"
                        />
                        {/* Subtle glow effect */}
                        <div className="absolute -inset-4 bg-white bg-opacity-10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                    </div>
                    
                    {/* League name */}
                    <h3 className="text-3xl font-light mb-4 text-white tracking-wide">
                      {league.name}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className="text-sm font-light text-white text-opacity-80 tracking-wider uppercase">
                      View Games
                    </p>
                  </div>
                  
                  {/* Elegant hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white from-opacity-5 via-transparent to-blue-400 to-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                  
                  {/* Subtle border glow on hover */}
                  <div className="absolute inset-0 rounded-3xl border border-white border-opacity-0 group-hover:border-opacity-40 transition-all duration-700" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Default layout for other themes
  return (
    <div className="w-full">
      {error && (
        <div className={`mb-8 p-4 rounded-2xl border ${themeClasses.surface} ${themeClasses.border} ${themeClasses.textSecondary}`}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          {error}
          </div>
        </div>
      )}
      
      <div className="text-center mb-12">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${themeClasses.surface} ${themeClasses.border} ${themeClasses.textSecondary}`}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {leagues.length} leagues available
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8`}>
        {leagues.map((league) => {
          const assets = leagueAssets[league.name] || leagueAssets.NFL;
          const leaguePath = league.name.toLowerCase().replace('_', '-');
          
          // Karellis-inspired card design
          if (theme === 'videobg-1') {
            return (
              <Link key={league.id} href={`/${leaguePath}/games`} className="block group">
                <div className="relative overflow-hidden rounded-3xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-3 hover:bg-opacity-20">
                  {/* Content */}
                  <div className="p-10 text-center">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                      <div className="relative">
                        <img 
                          src={assets.logo} 
                          alt={`${league.name} logo`}
                          className="w-24 h-24 object-contain transition-transform duration-700 group-hover:scale-110 filter drop-shadow-lg"
                        />
                        {/* Subtle glow effect */}
                        <div className="absolute -inset-4 bg-white bg-opacity-10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                    </div>
                    
                    {/* League name */}
                    <h3 className="text-3xl font-light mb-4 text-white tracking-wide">
                      {league.name}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className="text-sm font-light text-white text-opacity-80 tracking-wider uppercase">
                      View Games
                    </p>
                  </div>
                  
                  {/* Elegant hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white from-opacity-5 via-transparent to-blue-400 to-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                  
                  {/* Subtle border glow on hover */}
                  <div className="absolute inset-0 rounded-3xl border border-white border-opacity-0 group-hover:border-opacity-40 transition-all duration-700" />
                </div>
              </Link>
            );
          }
          
          // Default theme cards
          return (
            <Link key={league.id} href={`/${leaguePath}/games`} className="block">
              <div className={`group relative overflow-hidden rounded-3xl ${themeClasses.card} ${themeClasses.border}`}>
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${assets.gradient} opacity-0 group-hover:opacity-10 ${themeClasses.effects?.transition || 'transition-opacity duration-500'}`} />
                
                {/* Content */}
                <div className="p-8 text-center">
                  <div className="relative z-10">
                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <img 
                          src={assets.logo} 
                          alt={`${league.name} logo`}
                          className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className={`absolute -inset-2 bg-${assets.accent} opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-300`} />
                      </div>
                    </div>
                    
                    {/* League name */}
                    <h3 className={`text-2xl font-bold mb-2 ${themeClasses.heading}`}>
                      {league.name}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className={`text-sm font-medium ${themeClasses.body}`}>
                      View Games
                    </p>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 ${themeClasses.surface} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}