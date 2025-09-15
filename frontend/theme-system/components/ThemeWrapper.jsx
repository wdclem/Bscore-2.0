'use client';

import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../config/themes';

export default function ThemeWrapper({ children, className = '' }) {
  const { theme, isLoaded } = useTheme();
  
  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const backgroundClass = getThemeClasses(theme, 'background');
  
  return (
    <div className={`min-h-screen ${backgroundClass} ${className}`}>
      {children}
    </div>
  );
}
```

```

