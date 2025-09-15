

export default function GameSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg border-l-4 border-gray-300 animate-pulse">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-32 mb-3"></div>
              <div className="flex items-center space-x-4">
                <div className="h-6 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-4"></div>
                <div className="h-6 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3 mb-1">
                <div className="h-8 bg-gray-300 rounded w-8"></div>
                <div className="h-4 bg-gray-300 rounded w-2"></div>
                <div className="h-8 bg-gray-300 rounded w-8"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

