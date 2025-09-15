
This creates a complete, standalone theme system that you can:

1. **Extract to its own git repository**
2. **Publish as an npm package**
3. **Use in any React/Next.js project**
4. **Easily extend with new themes**

The folder structure is clean and modular, making it perfect for a separate repository!

# React Theme System

A comprehensive, reusable theme system for React and Next.js applications.

## Features

-  5 built-in themes (Default, Dark, Vibrant, Minimal, Retro)
- 💾 Persistent theme storage with localStorage
- 🔧 Easy to extend with custom themes
- ⚡ Optimized performance with minimal re-renders
- 🎯 TypeScript support ready
- 📱 Responsive design

## Installation

```bash
npm install react-theme-system
```

## Usage

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
      // ... other color properties
    },
    // ... other theme properties
  }
};
```

## License

MIT


