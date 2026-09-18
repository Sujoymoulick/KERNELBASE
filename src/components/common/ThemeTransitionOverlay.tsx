import React from 'react';

interface ThemeTransitionOverlayProps {
  isTransitioning: boolean;
  targetTheme: 'dark' | 'light' | null;
  isFallback?: boolean;
}

export const ThemeTransitionOverlay: React.FC<ThemeTransitionOverlayProps> = ({
  isTransitioning,
  targetTheme,
  isFallback = false,
}) => {
  if (!isTransitioning || !targetTheme) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none"
      aria-hidden="true"
      style={{
        contain: 'strict',
        isolation: 'isolate',
      }}
    >
      {/* Fallback solid background layer for browsers without View Transitions */}
      {isFallback && (
        <div
          className="fixed inset-0 kb-theme-fallback-wipe"
          style={{
            backgroundColor: targetTheme === 'dark' ? '#120704' : '#FDF9F7',
          }}
        />
      )}

      {/* Subtle leading edge glow/border line moving strictly Left -> Right */}
      <div
        className={`kb-theme-edge-wipe ${
          targetTheme === 'dark' ? 'kb-edge-dark' : 'kb-edge-light'
        }`}
      />
    </div>
  );
};
