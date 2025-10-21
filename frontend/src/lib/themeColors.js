/**
 * Centralized theme color utilities for consistent dark/light mode handling
 */

export const getThemeColors = (theme) => {
  switch (theme) {
    case 'videobg-dark':
      return {
        bg: 'bg-slate-800/90',
        headerBg: 'bg-slate-700',
        text: 'text-white',
        subText: 'text-gray-300',
        border: 'border-slate-600',
        hoverBg: 'hover:bg-slate-700/50',
        // Additional utility colors
        primaryText: 'text-white',
        secondaryText: 'text-gray-300',
        mutedText: 'text-gray-400',
        surface: 'bg-slate-800',
        surfaceLight: 'bg-slate-700'
      };
    case 'videobg-light':
      return {
        bg: 'bg-white/90',
        headerBg: 'bg-emerald-100',
        text: 'text-emerald-900',
        subText: 'text-emerald-700',
        border: 'border-emerald-200',
        hoverBg: 'hover:bg-emerald-50',
        // Additional utility colors
        primaryText: 'text-emerald-900',
        secondaryText: 'text-emerald-700',
        mutedText: 'text-emerald-600',
        surface: 'bg-white',
        surfaceLight: 'bg-emerald-50'
      };
    case 'dark':
      return {
        bg: 'bg-gray-800/90',
        headerBg: 'bg-gray-700',
        text: 'text-white',
        subText: 'text-gray-300',
        border: 'border-gray-600',
        hoverBg: 'hover:bg-gray-700/50',
        // Additional utility colors
        primaryText: 'text-white',
        secondaryText: 'text-gray-300',
        mutedText: 'text-gray-400',
        surface: 'bg-gray-800',
        surfaceLight: 'bg-gray-700'
      };
    default:
      return {
        bg: 'bg-white/90',
        headerBg: 'bg-blue-100',
        text: 'text-gray-900',
        subText: 'text-gray-700',
        border: 'border-gray-200',
        hoverBg: 'hover:bg-gray-50',
        // Additional utility colors
        primaryText: 'text-gray-900',
        secondaryText: 'text-gray-700',
        mutedText: 'text-gray-600',
        surface: 'bg-white',
        surfaceLight: 'bg-gray-50'
      };
  }
};

/**
 * Simple text color utility for common use cases
 */
export const getTextColors = (theme) => {
  const colors = getThemeColors(theme);
  return {
    primary: colors.primaryText,
    secondary: colors.secondaryText,
    muted: colors.mutedText
  };
};

/**
 * Surface color utility for backgrounds
 */
export const getSurfaceColors = (theme) => {
  const colors = getThemeColors(theme);
  return {
    main: colors.surface,
    light: colors.surfaceLight,
    border: colors.border
  };
};
