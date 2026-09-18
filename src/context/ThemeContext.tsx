import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notifyThemeChange } from '../utils/mermaidRenderer';

interface ThemeContextType {
  isDark: boolean;
  isTransitioning: boolean;
  targetTheme: 'dark' | 'light' | null;
  isFallback: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  isTransitioning: false,
  targetTheme: null,
  isFallback: false,
  toggleTheme: () => {},
  setDark: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

function getInitialDark(): boolean {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
  } catch (_) {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [targetTheme, setTargetTheme] = useState<'dark' | 'light' | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);

  const applyTheme = useCallback((dark: boolean) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (_) {}
  }, []);

  // Sync initial theme without triggering animation
  useEffect(() => {
    applyTheme(isDark);
  }, []);

  const dispatchThemeEvents = useCallback((dark: boolean) => {
    // Schedule heavy re-renders (Mermaid diagrams, etc.) on idle / next tick to avoid animation jank
    const trigger = () => {
      notifyThemeChange();
      window.dispatchEvent(
        new CustomEvent('app-theme-change', { detail: { isDark: dark } })
      );
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(trigger);
      } else {
        requestAnimationFrame(() => setTimeout(trigger, 16));
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (isTransitioningRef.current) return;

    const nextDark = !isDark;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion is requested, switch immediately without horizontal wipe
    if (prefersReducedMotion) {
      setIsDark(nextDark);
      applyTheme(nextDark);
      dispatchThemeEvents(nextDark);
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTargetTheme(nextDark ? 'dark' : 'light');

    // Modern browser View Transition API with custom Left-to-Right CSS sweep
    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof (document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition === 'function'
    ) {
      setIsFallback(false);
      try {
        const transition = (document as unknown as {
          startViewTransition: (cb: () => void) => { finished: Promise<void> };
        }).startViewTransition(() => {
          applyTheme(nextDark);
          setIsDark(nextDark);
        });

        transition.finished
          .catch(() => {})
          .finally(() => {
            isTransitioningRef.current = false;
            setIsTransitioning(false);
            setTargetTheme(null);
            // Defer diagram recomputation until sweep is 100% completed
            dispatchThemeEvents(nextDark);
          });
      } catch (_) {
        // Fallback if startViewTransition throws unexpectedly
        applyTheme(nextDark);
        setIsDark(nextDark);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        setTargetTheme(null);
        dispatchThemeEvents(nextDark);
      }
    } else {
      // High-performance fallback for browsers without View Transitions
      setIsFallback(true);
      setTimeout(() => {
        applyTheme(nextDark);
        setIsDark(nextDark);
        setTimeout(() => {
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          setTargetTheme(null);
          setIsFallback(false);
          dispatchThemeEvents(nextDark);
        }, 50);
      }, 500);
    }
  }, [isDark, applyTheme, dispatchThemeEvents]);

  const setDark = useCallback(
    (dark: boolean) => {
      setIsDark(dark);
      applyTheme(dark);
      dispatchThemeEvents(dark);
    },
    [applyTheme, dispatchThemeEvents]
  );

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        isTransitioning,
        targetTheme,
        isFallback,
        toggleTheme,
        setDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
