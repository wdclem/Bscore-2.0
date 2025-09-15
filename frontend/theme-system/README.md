
This creates a complete, standalone theme system that you can:

1. **Extract to its own git repository**
2. **Publish as an npm package**
3. **Use in any React/Next.js project**
4. **Easily extend with new themes**

The folder structure is clean and modular, making it perfect for a separate repository!

# React Theme System

A comprehensive, reusable theme system for React and Next.js applications.

## Features

- 🎨 **5 Built-in Themes**: Default, ESPN, FotMob, TheScore, Minimalist, SofaScore
- 💾 **Persistent Storage**: Theme selection saved with localStorage
- 🔧 **Easy Extension**: Simple to add custom themes
- ⚡ **Optimized Performance**: Minimal re-renders
- 🎯 **TypeScript Ready**: Full type support
- 📱 **Responsive Design**: Works on all screen sizes

## Installation

```bash
npm install react-theme-system
```

## Quick Start

### 1. Wrap your app with ThemeProvider

```jsx
import { ThemeProvider } from 'react-theme-system';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Use the theme hook

```jsx
import { useTheme, getThemeClasses } from 'react-theme-system';

function MyComponent() {
  const { theme, changeTheme } = useTheme();
  
  return (
    <div className={getThemeClasses(theme, 'card')}>
      <h1 className={getThemeClasses(theme, 'heading')}>Hello World</h1>
    </div>
  );
}
```

### 3. Add the theme selector

```jsx
import { ThemeSelector } from 'react-theme-system';

function App() {
  return (
    <div>
      <ThemeSelector />
      {/* Your app content */}
    </div>
  );
}
```

## Built-in Themes

- **Default**: Clean, professional design
- **ESPN**: Bold, chunky with ESPN vibes
- **FotMob**: Clean & bold mobile-first
- **TheScore**: Dark & glowing with neon accents
- **Minimalist**: Massive typography focus
- **SofaScore**: Data-rich with bold elements

## Custom Themes

Add your own themes by extending the themes object:

```jsx
import { themes } from 'react-theme-system';

const customThemes = {
  ...themes,
  myTheme: {
    name: 'My Theme',
    description: 'Custom theme description',
    colors: {
      primary: 'purple',
      secondary: 'pink',
      // ... other color properties
    },
    styles: {
      card: 'bg-purple-100 border-purple-300',
      heading: 'text-purple-900 font-bold',
      // ... other style properties
    }
  }
};
```

## API Reference

### useTheme()

Returns the current theme and theme change function.

```jsx
const { theme, changeTheme } = useTheme();
```

### getThemeClasses(theme, element)

Returns the appropriate CSS classes for a theme element.

```jsx
const cardClasses = getThemeClasses(theme, 'card');
```

### ThemeSelector

A pre-built component for theme selection.

```jsx
<ThemeSelector onThemeChange={handleThemeChange} />
```

## License

MIT


