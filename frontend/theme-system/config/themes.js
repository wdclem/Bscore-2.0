export const themes = {
    default: {
      name: 'Default',
      description: 'Clean and professional',
      colors: {
        primary: 'blue',
        secondary: 'gray',
        accent: 'indigo',
        background: 'gray-50',
        surface: 'white',
        text: 'gray-900',
        textSecondary: 'gray-600',
        border: 'gray-200',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      },
      fonts: {
        heading: 'font-bold',
        body: 'font-normal',
        mono: 'font-mono'
      },
      spacing: {
        container: 'max-w-6xl',
        section: 'py-12',
        card: 'p-6'
      },
      effects: {
        shadow: 'shadow-lg',
        hover: 'hover:shadow-xl',
        transition: 'transition-all duration-300'
      }
    },
    dark: {
      name: 'Dark',
      description: 'Sleek dark theme',
      colors: {
        primary: 'blue',
        secondary: 'gray',
        accent: 'cyan',
        background: 'gray-900',
        surface: 'gray-800',
        text: 'white',
        textSecondary: 'gray-300',
        border: 'gray-700',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      },
      fonts: {
        heading: 'font-bold',
        body: 'font-normal',
        mono: 'font-mono'
      },
      spacing: {
        container: 'max-w-6xl',
        section: 'py-12',
        card: 'p-6'
      },
      effects: {
        shadow: 'shadow-2xl',
        hover: 'hover:shadow-3xl',
        transition: 'transition-all duration-300'
      }
    },
    vibrant: {
      name: 'Vibrant',
      description: 'Colorful and energetic',
      colors: {
        primary: 'purple',
        secondary: 'pink',
        accent: 'indigo',
        background: 'gradient-to-br from-purple-50 to-pink-50',
        surface: 'white',
        text: 'gray-900',
        textSecondary: 'gray-600',
        border: 'purple-200',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      },
      fonts: {
        heading: 'font-black',
        body: 'font-medium',
        mono: 'font-mono'
      },
      spacing: {
        container: 'max-w-6xl',
        section: 'py-16',
        card: 'p-8'
      },
      effects: {
        shadow: 'shadow-2xl',
        hover: 'hover:shadow-3xl hover:scale-105',
        transition: 'transition-all duration-500'
      }
    },
    minimal: {
      name: 'Minimal',
      description: 'Clean and minimal',
      colors: {
        primary: 'gray',
        secondary: 'gray',
        accent: 'black',
        background: 'white',
        surface: 'gray-50',
        text: 'black',
        textSecondary: 'gray-500',
        border: 'gray-300',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      },
      fonts: {
        heading: 'font-light',
        body: 'font-normal',
        mono: 'font-mono'
      },
      spacing: {
        container: 'max-w-4xl',
        section: 'py-8',
        card: 'p-4'
      },
      effects: {
        shadow: 'shadow-sm',
        hover: 'hover:shadow-md',
        transition: 'transition-all duration-200'
      }
    },
    retro: {
      name: 'Retro',
      description: 'Nostalgic retro vibes',
      colors: {
        primary: 'orange',
        secondary: 'yellow',
        accent: 'red',
        background: 'gradient-to-br from-orange-100 to-yellow-100',
        surface: 'white',
        text: 'gray-900',
        textSecondary: 'gray-600',
        border: 'orange-300',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      },
      fonts: {
        heading: 'font-bold',
        body: 'font-normal',
        mono: 'font-mono'
      },
      spacing: {
        container: 'max-w-6xl',
        section: 'py-12',
        card: 'p-6'
      },
      effects: {
        shadow: 'shadow-lg',
        hover: 'hover:shadow-xl hover:rotate-1',
        transition: 'transition-all duration-300'
      }
    },
    'videobg-1': {
      name: 'Video Background 1',
      description: 'Video background with clean minimal cards',
      colors: {
        primary: 'white',
        secondary: 'gray',
        accent: 'blue',
        background: 'black',
        surface: 'white',
        text: 'white',
        textSecondary: 'gray-300',
        border: 'gray-200',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      },
      fonts: {
        heading: 'font-light',
        body: 'font-normal',
        mono: 'font-mono'
      },
      spacing: {
        container: 'max-w-7xl',
        section: 'py-20',
        card: 'p-8'
      },
      effects: {
        shadow: 'shadow-2xl',
        hover: 'hover:shadow-3xl hover:scale-105',
        transition: 'transition-all duration-500'
      }
    }
  };
  
  export const getThemeClasses = (theme, component) => {
    const themeConfig = themes[theme] || themes.default;
    
    const classMaps = {
      background: `bg-${themeConfig.colors.background}`,
      surface: `bg-${themeConfig.colors.surface}`,
      text: `text-${themeConfig.colors.text}`,
      textSecondary: `text-${themeConfig.colors.textSecondary}`,
      border: `border-${themeConfig.colors.border}`,
      primary: `bg-${themeConfig.colors.primary}-600 text-white`,
      primaryText: `text-${themeConfig.colors.primary}-600`,
      card: `bg-${themeConfig.colors.surface} ${themeConfig.effects.shadow} ${themeConfig.effects.hover} ${themeConfig.effects.transition} ${themeConfig.spacing.card}`,
      container: `${themeConfig.spacing.container} mx-auto px-6`,
      section: `${themeConfig.spacing.section}`,
      heading: `${themeConfig.fonts.heading} text-${themeConfig.colors.text}`,
      body: `${themeConfig.fonts.body} text-${themeConfig.colors.textSecondary}`
    };
    
    return classMaps[component] || '';
  };


