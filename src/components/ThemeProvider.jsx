import React, { createContext, useContext, useEffect, useState } from 'react';

    const ThemeProviderContext = createContext({
      theme: 'system',
      setTheme: () => null,
      isNightMode: false,
      setIsNightMode: () => null,
    });

    export function ThemeProvider({
      children,
      defaultTheme = 'system',
      storageKey = 'echovault-theme',
      nightModeStorageKey = 'echovault-night-mode',
      ...props
    }) {
      const [theme, setThemeState] = useState(
        () => localStorage.getItem(storageKey) || defaultTheme
      );
      const [isNightMode, setIsNightModeState] = useState(
        () => JSON.parse(localStorage.getItem(nightModeStorageKey)) || false
      );

      useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark', 'night');

        let currentTheme = theme;

        if (theme === 'system') {
          currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        
        if (isNightMode && currentTheme === 'dark') {
           root.classList.add('night');
        } else {
           root.classList.add(currentTheme);
        }

      }, [theme, isNightMode]);

      const setTheme = (newTheme) => {
        localStorage.setItem(storageKey, newTheme);
        setThemeState(newTheme);
      };

      const setIsNightMode = (enabled) => {
        localStorage.setItem(nightModeStorageKey, JSON.stringify(enabled));
        setIsNightModeState(enabled);
      };


      const value = {
        theme,
        setTheme,
        isNightMode,
        setIsNightMode,
      };

      return (
        <ThemeProviderContext.Provider {...props} value={value}>
          {children}
        </ThemeProviderContext.Provider>
      );
    }

    export const useTheme = () => {
      const context = useContext(ThemeProviderContext);

      if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

      return context;
    };
  