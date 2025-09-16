'use client';

import { useTheme } from '@theme/contexts/ThemeContext';

function FloatingSidePanel() {
  const { theme } = useTheme();

  // Show for all video background themes
  if (!theme.startsWith('videobg')) return null;

  const quickLinks = [
    { 
      href: '/nfl/games', 
      icon: '🏈', 
      label: 'NFL Games',
    },
    { 
      href: '/nhl/games', 
      icon: '🏒', 
      label: 'NHL Games',
    },
    { 
      href: '/nba/games', 
      icon: '🏀', 
      label: 'NBA Games',
    },
    { 
      href: '/mlb/games', 
      icon: '⚾', 
      label: 'MLB Games',
    },
    { 
      href: '/premier_league/games', 
      icon: '⚽', 
      label: 'Premier League',
    }
  ];

  // Get gradient background based on theme
  const getGradientBg = () => {
    switch (theme) {
      case 'videobg-dark':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'videobg-light':
        return 'bg-gradient-to-br from-emerald-600 to-emerald-800';
      default:
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
    }
  };

  return (
    <section className="floating-icons fixed left-1/2 z-50 flex flex-col gap-2 max-md:bottom-4 max-md:hidden max-md:-translate-x-1/2 max-md:flex-row max-md:rounded-full max-md:px-6 max-md:py-3 md:left-4 md:top-1/2 md:-translate-y-1/2">
      {quickLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`group flex items-center rounded-lg ${getGradientBg()} shadow-md transition-all duration-300 hover:scale-115 overflow-hidden w-fit`}
        >
          <div className="p-3 transition-all duration-300 group-hover:rotate-12">
            <span className="text-xl text-white">{link.icon}</span>
          </div>
          <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-40">
            <p className="whitespace-nowrap px-3 py-3 text-white font-medium">
              {link.label}
            </p>
          </div>
        </a>
      ))}
    </section>
  );
}

export default FloatingSidePanel;
