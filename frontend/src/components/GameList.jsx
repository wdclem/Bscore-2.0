import GameSkeleton from './GameSkeleton';
import GameCard from './GameCard';
import { useTheme } from '@theme/contexts/ThemeContext';

export default function GameList({ games, loading, onLoadMore, hasMore, loadingMore, league }) {
  const { theme } = useTheme();

  // Get text colors based on theme
  const getTextColor = () => {
    switch (theme) {
      case 'videobg-dark':
        return 'text-gray-300';
      case 'videobg-light':
        return 'text-emerald-700';
      default:
        return 'text-gray-500';
    }
  };

  const getSubTextColor = () => {
    switch (theme) {
      case 'videobg-dark':
        return 'text-gray-400';
      case 'videobg-light':
        return 'text-emerald-600';
      default:
        return 'text-gray-400';
    }
  };

  // Show skeleton while loading
  if (loading && games.length === 0) {
    return <GameSkeleton />;
  }

  // Show message when no games
  if (!loading && games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className={`text-lg mb-2 ${getTextColor()}`}>No games found</div>
        <div className={`text-sm ${getSubTextColor()}`}>Games will appear here once data is available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {games.map((game) => (
          <GameCard key={game.id} game={game} league={league} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="
              px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl
              hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 disabled:cursor-not-allowed
              transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105
            "
          >
            {loadingMore ? 'Loading...' : 'Load More Games'}
          </button>
        </div>
      )}
    </div>
  );
}


