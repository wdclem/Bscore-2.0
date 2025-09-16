'use client';

import { useState } from 'react';
import Header from "@/components/Header";
import FloatingSidePanel from "@/components/FloatingSidePanel";
import { useTheme } from "@theme/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  const [showLeagueSelection, setShowLeagueSelection] = useState(false);

  const leagues = [
    { code: 'nfl', name: 'NFL', icon: '🏈', description: 'National Football League' },
    { code: 'nhl', name: 'NHL', icon: '🏒', description: 'National Hockey League' },
    { code: 'nba', name: 'NBA', icon: '🏀', description: 'National Basketball Association' },
    { code: 'mlb', name: 'MLB', icon: '⚾', description: 'Major League Baseball' },
    { code: 'premier_league', name: 'Premier League', icon: '⚽', description: 'English Premier League' }
  ];

  // Video background layout
  if (theme === 'videobg-1') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/stadium-video2.mp4" type="video/mp4" />
          </video>
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Floating Side Panel */}
        <FloatingSidePanel />

        {/* Content */}
        <div className="relative z-10">
          <Header />
          
          {/* Hero Section - Centered and Constrained */}
          <section className="h-screen flex flex-col justify-center items-center">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h1 className="text-7xl font-light mb-6 tracking-tight text-white">
                Better<span className="text-blue-400">Score</span>
              </h1>
              <p className="text-2xl mb-16 leading-relaxed text-white text-opacity-90">
                Experience sports like never before
              </p>

              {/* Central Action Buttons - Centered Layout */}
              <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                <button 
                  onClick={() => setShowLeagueSelection(!showLeagueSelection)}
                  className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <span className="text-xl">🏈</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Live</p>
                    <strong className="text-lg font-bold uppercase">Games</strong>
                  </div>
                  <svg className={`w-5 h-5 ml-2 transition-transform ${showLeagueSelection ? 'rotate-180' : 'group-hover:translate-x-1'}`}>
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </button>
                
                <a href="/league-selector" className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Explore All</p>
                    <strong className="text-lg font-bold uppercase">Leagues</strong>
                  </div>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </a>
              </div>

              {/* League Selection Buttons */}
              {showLeagueSelection && (
                <div className="mb-24">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-light text-white mb-2">Select League</h2>
                    <p className="text-white text-opacity-80">Choose a league to view live games</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                    {leagues.map((league) => (
                      <a
                        key={league.code}
                        href={`/${league.code}/games`}
                        className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all duration-300 hover:scale-105 min-w-[200px]"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-xl">{league.icon}</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium">{league.name}</p>
                          <p className="text-sm text-white text-opacity-70">{league.description}</p>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>


        </div>
      </div>
    );
  }

  // Default layout - use videobg-1 theme
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/stadium-video2.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Floating Side Panel */}
      <FloatingSidePanel />

      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section - Centered and Constrained */}
        <section className="h-screen flex flex-col justify-center items-center">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-7xl font-light mb-6 tracking-tight text-white">
              Better<span className="text-blue-400">Score</span>
            </h1>
            <p className="text-2xl mb-16 leading-relaxed text-white text-opacity-90">
              Experience sports like never before
            </p>

            {/* Central Action Buttons - Centered Layout */}
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <button 
                onClick={() => setShowLeagueSelection(!showLeagueSelection)}
                className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xl">🏈</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">View Live</p>
                  <strong className="text-lg font-bold uppercase">Games</strong>
                </div>
                <svg className={`w-5 h-5 ml-2 transition-transform ${showLeagueSelection ? 'rotate-180' : 'group-hover:translate-x-1'}`}>
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                </svg>
              </button>
              
              <a href="/league-selector" className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Explore All</p>
                  <strong className="text-lg font-bold uppercase">Leagues</strong>
                </div>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                </svg>
              </a>
            </div>

            {/* League Selection Buttons */}
            {showLeagueSelection && (
              <div className="mb-24">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-light text-white mb-2">Select League</h2>
                  <p className="text-white text-opacity-80">Choose a league to view live games</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                  {leagues.map((league) => (
                    <a
                      key={league.code}
                      href={`/${league.code}/games`}
                      className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all duration-300 hover:scale-105 min-w-[200px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-xl">{league.icon}</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{league.name}</p>
                        <p className="text-sm text-white text-opacity-70">{league.description}</p>
                      </div>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}