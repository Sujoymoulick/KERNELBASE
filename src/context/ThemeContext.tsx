import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notifyThemeChange } from '../utils/mermaidRenderer';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  setDark: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Synchronously apply theme class to DOM and dispatch event
  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      try {
        localStorage.setItem('theme', 'dark');
      } catch (_) {}
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      try {
        localStorage.setItem('theme', 'light');
      } catch (_) {}
    }

    // Defer side-effects that trigger setState in other components (e.g.
    // ArchitectureDiagram, MermaidDiagram) until after React finishes
    // committing. Firing synchronously causes:
    //   "Cannot update a component (ArchitectureDiagram) while rendering
    //    a different component (ThemeProvider)"
    setTimeout(() => {
      notifyThemeChange();
      window.dispatchEvent(
        new CustomEvent('app-theme-change', { detail: { isDark: dark } })
      );
    }, 0);
  }, []);

  // Ensure initial state is accurately stamped on <html>
  useEffect(() => {
    applyTheme(isDark);
  }, [applyTheme, isDark]);

  // Listen to OS system color scheme changes if user hasn't manually pinned theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setIsDarkState(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setIsDarkState((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  const setDark = useCallback(
    (dark: boolean) => {
      setIsDarkState(dark);
      applyTheme(dark);
    },
    [applyTheme]
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
