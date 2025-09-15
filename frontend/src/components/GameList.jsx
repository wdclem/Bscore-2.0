export default function GameList({ games, loading, onLoadMore, hasMore, loadingMore }) {
  return (
    <div className="space-y-4">
      {games.map((g) => (
        <div key={g.id} className="
          bg-white rounded-xl shadow-lg hover:shadow-xl 
          transition-all duration-300 p-6
          border-l-4 border-blue-500
        ">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-3 font-medium">
                {new Date(g.gameDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
              <div className="text-xl font-bold text-gray-900">
                <span className="text-gray-600">{g.awayTeam}</span>
                <span className="mx-4 text-gray-400">@</span>
                <span>{g.homeTeam}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-gray-900">
                <span className={g.awayScore > g.homeScore ? "text-green-600" : ""}>
                  {g.awayScore ?? "-"}
                </span>
                <span className="mx-3 text-gray-400">-</span>
                <span className={g.homeScore > g.awayScore ? "text-green-600" : ""}>
                  {g.homeScore ?? "-"}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1 font-medium">Final</div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="
              px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
              hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            {loadingMore ? 'Loading...' : 'Load More Games'}
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {loading && games.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading games...</div>
        </div>
      )}
    </div>
  );
}


