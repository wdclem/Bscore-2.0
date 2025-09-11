import Link from "next/link";

const leagueAssets = {
  NFL: { 
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/200px-National_Football_League_logo.svg.png",
    colors: "from-green-600 to-green-700",
    bgPattern: "🏈"
  },
  NHL: { 
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/200px-05_NHL_Shield.svg.png", 
    colors: "from-blue-600 to-blue-700",
    bgPattern: "🏒"
  },
  NBA: { 
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/200px-National_Basketball_Association_logo.svg.png",
    colors: "from-orange-500 to-red-600", 
    bgPattern: "🏀"
  },
  MLB: { 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/200px-Major_League_Baseball_logo.svg.png",
    colors: "from-red-600 to-red-700",
    bgPattern: "⚾"
  },
  PREMIER_LEAGUE: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/200px-Premier_League_Logo.svg.png",
    colors: "from-purple-600 to-purple-700",
    bgPattern: "⚽"
  }
};

export default function LeagueCard({ code, name, theme = 'default' }) {
  const assets = leagueAssets[code] || leagueAssets.NFL;
  
  // Theme variations
  const themes = {
    default: {
      colors: assets.colors,
      bgPattern: assets.bgPattern,
      logo: assets.logo,
      style: "rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2",
      textSize: "text-3xl",
      subTextSize: "text-sm"
    },
    espn: {
      colors: "from-red-600 to-red-800",
      bgPattern: "📺",
      logo: assets.logo,
      style: "rounded-lg p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-110 border-4 border-white",
      textSize: "text-4xl font-black",
      subTextSize: "text-base font-bold"
    },
    fotmob: {
      colors: "from-slate-700 to-slate-900",
      bgPattern: "📱",
      logo: assets.logo,
      style: "rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-600",
      textSize: "text-2xl font-bold",
      subTextSize: "text-sm font-medium"
    },
    thescore: {
      colors: "from-gray-900 to-black",
      bgPattern: "⚡",
      logo: assets.logo,
      style: "rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-cyan-400 shadow-cyan-500/50",
      textSize: "text-3xl font-bold text-cyan-400",
      subTextSize: "text-sm text-cyan-300"
    },
    minimalist: {
      colors: "from-gray-100 to-gray-200",
      bgPattern: "",
      logo: assets.logo,
      style: "rounded-none p-12 text-black shadow-none hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-black",
      textSize: "text-6xl font-black",
      subTextSize: "text-lg font-bold"
    },
    sofa: {
      colors: "from-indigo-600 to-indigo-800",
      bgPattern: "📊",
      logo: assets.logo,
      style: "rounded-lg p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-l-4 border-yellow-400",
      textSize: "text-2xl font-bold",
      subTextSize: "text-xs font-semibold uppercase tracking-wide"
    }
  };
  
  const currentTheme = themes[theme] || themes.default;
  
  return (
    <Link href={`/${code}/games`} className="group block">
      <div className={`bg-gradient-to-br ${currentTheme.colors} ${currentTheme.style} relative overflow-hidden`}>
        {currentTheme.bgPattern && (
          <div className="absolute top-4 right-4 text-6xl opacity-20">
            {currentTheme.bgPattern}
          </div>
        )}
        <div className="relative z-10 text-center">
          <img 
            src={currentTheme.logo} 
            alt={`${code} logo`}
            className="w-16 h-16 mx-auto mb-4 drop-shadow-lg object-contain"
          />
          <div className={`${currentTheme.textSize} mb-2`}>{code}</div>
          <div className={`${currentTheme.subTextSize} opacity-90`}>{name}</div>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl" />
      </div>
    </Link>
  );
}


