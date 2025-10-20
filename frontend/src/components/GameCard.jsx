'use client';

import { useState, useEffect } from 'react';
import { isFavoriteTeam, toggleFavoriteTeam } from '@/lib/favorites';

export default function GameCard({ game, league }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [homeIsFavorite, setHomeIsFavorite] = useState(false);
  const [awayIsFavorite, setAwayIsFavorite] = useState(false);
  
  useEffect(() => {
    setHomeIsFavorite(isFavoriteTeam(game.homeTeam));
    setAwayIsFavorite(isFavoriteTeam(game.awayTeam));
  }, [game.homeTeam, game.awayTeam]);
  
  const handleToggleFavorite = (teamName, e) => {
    e.stopPropagation(); // Prevent card flip
    toggleFavoriteTeam(teamName);
    
    // Update state by re-reading from localStorage
    if (teamName === game.homeTeam) {
      setHomeIsFavorite(isFavoriteTeam(teamName));
    } else {
      setAwayIsFavorite(isFavoriteTeam(teamName));
    }
  };
  
  const isFavoriteGame = homeIsFavorite || awayIsFavorite;
  
  const handleShare = (e) => {
    e.stopPropagation(); // Prevent card flip
    
    const gameUrl = `${window.location.origin}/${league.toLowerCase()}/games?game=${game.id}`;
    const shareText = `${game.awayTeam} vs ${game.homeTeam} - ${game.awayScore ?? 0}-${game.homeScore ?? 0}`;
    
    // Try native share API first (mobile)
    if (navigator.share) {
      navigator.share({
        title: shareText,
        text: `Check out this game: ${shareText}`,
        url: gameUrl
      }).catch(() => {
        // User cancelled, do nothing
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(gameUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert(`Share this link: ${gameUrl}`);
      });
    }
  };

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
  
  // Determine game status
  const getGameStatus = () => {
    if (game.homeScore == null && game.awayScore == null) {
      return { label: 'SCHEDULED', color: 'bg-blue-500' };
    }
    return { label: 'FINAL', color: 'bg-green-600' };
  };
  
  const status = getGameStatus();

  return (
    <div className="relative w-full max-w-sm mx-auto h-56 cursor-pointer touch-manipulation" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px' }}>
      {/* Card Container with 3D Flip Effect */}
      <div 
        className={`relative w-full h-full transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ 
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front of Card */}
        <div 
          className={`absolute inset-0 ${style.bg} rounded-xl shadow-2xl border-2 ${isFavoriteGame ? 'border-yellow-400 ring-2 ring-yellow-300' : style.accent} p-4 backface-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Game Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${status.color} shadow-lg`}>
              {status.label}
            </span>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleToggleFavorite(game.awayTeam, e)}
                  className="hover:scale-125 transition-transform flex-shrink-0"
                  title={awayIsFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <span className={`text-lg ${awayIsFavorite ? 'text-yellow-300' : 'text-gray-400 opacity-50'}`}>
                    ★
                  </span>
                </button>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
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
                <span className={`font-bold ${style.text} ${isWinner(game.awayScore, game.homeScore) ? 'text-yellow-300' : ''} truncate`}>
                  {game.awayTeam}
                </span>
              </div>
              <span className={`text-2xl font-black ${style.text}`}>
                {game.awayScore ?? "-"}
              </span>
            </div>

            {/* VS */}
            <div className="text-center">
              <span className={`text-sm ${style.text} opacity-60`}>AT</span>
            </div>

            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleToggleFavorite(game.homeTeam, e)}
                  className="hover:scale-125 transition-transform flex-shrink-0"
                  title={homeIsFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <span className={`text-lg ${homeIsFavorite ? 'text-yellow-300' : 'text-gray-400 opacity-50'}`}>
                    ★
                  </span>
                </button>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
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
                <span className={`font-bold ${style.text} ${isWinner(game.homeScore, game.awayScore) ? 'text-yellow-300' : ''} truncate`}>
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

          {/* Share Button */}
          {/* <button
            onClick={handleShare}
            className="absolute bottom-3 left-3 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all hover:scale-110"
            title="Share game"
          >
            <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button> */}
          
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
