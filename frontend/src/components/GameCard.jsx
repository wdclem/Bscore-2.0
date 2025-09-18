'use client';

import { useState } from 'react';

export default function GameCard({ game, league }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getLeagueStyle = (league) => {
    switch (league) {
      case 'NFL':
        return {
          bg: 'bg-gradient-to-br from-orange-500 to-red-600',
          accent: 'border-orange-400',
          text: 'text-orange-100'
        };
      case 'NBA':
        return {
          bg: 'bg-gradient-to-br from-purple-600 to-indigo-700',
          accent: 'border-purple-400',
          text: 'text-purple-100'
        };
      case 'MLB':
        return {
          bg: 'bg-gradient-to-br from-blue-600 to-blue-800',
          accent: 'border-blue-400',
          text: 'text-blue-100'
        };
      case 'NHL':
        return {
          bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
          accent: 'border-gray-400',
          text: 'text-gray-100'
        };
      case 'PREMIER_LEAGUE':
        return {
          bg: 'bg-gradient-to-br from-green-600 to-emerald-700',
          accent: 'border-green-400',
          text: 'text-green-100'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-600 to-slate-800',
          accent: 'border-slate-400',
          text: 'text-slate-100'
        };
    }
  };

  const style = getLeagueStyle(league);
  const gameDate = game.game_date ? new Date(game.game_date) : null;
  const isWinner = (score, opponentScore) => score > opponentScore;

  return (
    <div className="relative w-72 h-56 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px' }}>
      {/* Card Container with 3D Flip Effect */}
      <div 
        className={`relative w-full h-full transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ 
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front of Card */}
        <div 
          className={`absolute inset-0 ${style.bg} rounded-xl shadow-2xl border-2 ${style.accent} p-4 backface-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* League Badge */}
          <div className="absolute top-3 right-3">
            {/* <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.text} bg-black bg-opacity-30`}>
              {league}
            </span> */}
          </div>

          {/* Date */}
          <div className={`text-sm ${style.text} opacity-80 mb-4`}>
            {gameDate ? gameDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
                }) : 'TBD'}
          </div>

          {/* Teams and Score */}
          <div className="space-y-3">
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {game.awayTeamLogo && (
                    <img 
                      src={game.awayTeamLogo} 
                      alt={game.awayTeam}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {!game.awayTeamLogo && (
                    <span className="text-lg">
                      {game.awayTeam.charAt(0)}
                    </span>
                  )}
                </div>
                <span className={`font-bold ${style.text} ${isWinner(game.awayScore, game.homeScore) ? 'text-yellow-300' : ''} truncate max-w-32`}>
                  {game.awayTeam}
                </span>
              </div>
              <span className={`text-2xl font-black ${style.text}`}>
                {game.awayScore ?? "-"}
              </span>
            </div>

            {/* VS */}
            <div className="text-center">
              <span className={`text-sm ${style.text} opacity-60`}>VS</span>
            </div>

            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {game.homeTeamLogo && (
                    <img 
                      src={game.homeTeamLogo} 
                      alt={game.homeTeam}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {!game.homeTeamLogo && (
                    <span className="text-lg">
                      {game.homeTeam.charAt(0)}
                    </span>
                  )}
                </div>
                <span className={`font-bold ${style.text} ${isWinner(game.homeScore, game.awayScore) ? 'text-yellow-300' : ''}`}>
                  {game.homeTeam}
                </span>
              </div>
              <span className={`text-2xl font-black ${style.text}`}>
                {game.homeScore ?? "-"}
              </span>
            </div>
          </div>

          {/* Status */}
          {/* <div className="absolute bottom-3 left-6">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${style.text} bg-black bg-opacity-30`}>
              FINAL
            </span>
          </div> */}

          {/* Flip hint */}
          <div className="absolute bottom-3 right-6">
            <span className={`text-xs ${style.text} opacity-60`}>Click to flip</span>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className={`absolute inset-0 ${style.bg} rounded-xl shadow-2xl border-2 ${style.accent} p-6 backface-hidden`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Detailed Stats */}
          <div className="space-y-3">
            <h3 className={`text-lg font-bold ${style.text} mb-4`}>Game Details</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${style.text} opacity-80`}>Venue:</span>
                <span className={`text-sm ${style.text}`}>{game.venue || 'TBD'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={`text-sm ${style.text} opacity-80`}>Referee:</span>
                <span className={`text-sm ${style.text}`}>{game.referee || 'TBD'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={`text-sm ${style.text} opacity-80`}>Attendance:</span>
                <span className={`text-sm ${style.text}`}>{game.attendance ? `${game.attendance.toLocaleString()}` : 'TBD'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={`text-sm ${style.text} opacity-80`}>Date:</span>
                <span className={`text-sm ${style.text}`}>
                  {game.game_date ? new Date(game.game_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            {/* Click to flip back */}
            <div className="absolute bottom-3 left-6">
              <span className={`text-xs ${style.text} opacity-60`}>Click to flip back</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
