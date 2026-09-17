import mermaid from 'mermaid';

export interface MermaidRenderOptions {
  isDark: boolean;
  fontSize?: string;
  fontFamily?: string;
}

// Global promise chain to serialize Mermaid renders and prevent race conditions / collision
let renderQueue = Promise.resolve();

// Incremented on every theme change to invalidate obsolete in-flight renders
let globalThemeVersion = 0;

export function notifyThemeChange(): number {
  globalThemeVersion++;
  return globalThemeVersion;
}

export function getCurrentThemeVersion(): number {
  return globalThemeVersion;
}

/**
 * Configure Mermaid globally for dark or light theme before rendering
 */
export function configureMermaid(isDark: boolean): void {
  try {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
      securityLevel: 'antiscript',
      theme: isDark ? 'dark' : 'neutral',
      fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
      themeVariables: {
        darkMode: isDark,
        fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        // Node styling
        primaryColor: isDark ? '#312e81' : '#e0e7ff',
        primaryTextColor: isDark ? '#e0e7ff' : '#1e1b4b',
        primaryBorderColor: isDark ? '#4f46e5' : '#6366f1',
        nodeBorder: isDark ? '#4f46e5' : '#6366f1',
        mainBkg: isDark ? '#1e293b' : '#f8fafc',
        // Connections & lines
        lineColor: isDark ? '#94a3b8' : '#64748b',
        edgeLabelBackground: isDark ? '#0f172a' : '#ffffff',
        // Secondary & tertiary nodes / notes
        secondaryColor: isDark ? '#1e293b' : '#f8fafc',
        secondaryTextColor: isDark ? '#cbd5e1' : '#334155',
        secondaryBorderColor: isDark ? '#475569' : '#cbd5e1',
        tertiaryColor: isDark ? '#0f172a' : '#ffffff',
        tertiaryTextColor: isDark ? '#94a3b8' : '#475569',
        tertiaryBorderColor: isDark ? '#334155' : '#e2e8f0',
        // Subgraphs / Clusters
        clusterBkg: isDark ? '#1e293b66' : '#f1f5f9aa',
        clusterBorder: isDark ? '#475569' : '#cbd5e1',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        // Sequence Diagrams
        actorBkg: isDark ? '#1e293b' : '#e0e7ff',
        actorBorder: isDark ? '#4f46e5' : '#6366f1',
        actorTextColor: isDark ? '#e0e7ff' : '#1e1b4b',
        actorLineColor: isDark ? '#64748b' : '#94a3b8',
        signalColor: isDark ? '#e2e8f0' : '#1e293b',
        signalTextColor: isDark ? '#e2e8f0' : '#1e293b',
        labelBoxBkgColor: isDark ? '#1e293b' : '#f8fafc',
        labelBoxBorderColor: isDark ? '#4f46e5' : '#6366f1',
        labelTextColor: isDark ? '#e0e7ff' : '#1e1b4b',
        loopTextColor: isDark ? '#cbd5e1' : '#334155',
        noteBkgColor: isDark ? '#312e81' : '#fef3c7',
        noteBorderColor: isDark ? '#6366f1' : '#f59e0b',
        noteTextColor: isDark ? '#e0e7ff' : '#78350f',
        activationBorderColor: isDark ? '#6366f1' : '#4f46e5',
        activationBkgColor: isDark ? '#312e81' : '#c7d2fe',
      },
    });
  } catch (err) {
    console.warn('Failed to initialize mermaid:', err);
  }
}

/**
 * Remove any rogue DOM elements injected into body by Mermaid during render/parse errors
 */
export function cleanupMermaidDOMErrors(elementId?: string): void {
  try {
    const selectors = [
      'body > [id^="dmermaid"]',
      'body > [id^="darch-diagram"]',
      'body > svg.error-icon',
      'body > div.error-icon',
    ];
    if (elementId) {
      selectors.push(`body > #d${elementId}`, `body > [id^="d${elementId}"]`);
    }

    const strayElements = document.querySelectorAll(selectors.join(', '));
    strayElements.forEach((el) => {
      if (el && el.parentNode === document.body) {
        el.parentNode.removeChild(el);
      }
    });
  } catch (_) {
    // Ignore DOM cleanup errors
  }
}

/**
 * Serialized diagram renderer that guarantees thread safety, theme consistency, and error recovery.
 */
export function renderMermaidDiagram(
  chart: string,
  isDark: boolean,
  idPrefix = 'mermaid'
): Promise<string> {
  const currentVersion = globalThemeVersion;

  return new Promise((resolve, reject) => {
    // Ensure queue always continues even if previous item failed
    renderQueue = renderQueue
      .catch(() => {
        // Recover from any previous queue rejection
      })
      .then(async () => {
        // Sanitize prefix to ensure a valid CSS/DOM identifier starting with a letter
        const cleanPrefix = idPrefix.replace(/[^a-zA-Z0-9_]/g, '_');
        const uniqueId = `m_${cleanPrefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

        try {
          cleanupMermaidDOMErrors();
          configureMermaid(isDark);

          // 6-second render timeout safety net to prevent infinite loading spinners
          const renderTimeout = new Promise<never>((_, timeoutReject) => {
            setTimeout(() => {
              timeoutReject(new Error('Mermaid rendering timed out after 6 seconds.'));
            }, 6000);
          });

          const renderPromise = mermaid.render(uniqueId, chart);
          const { svg } = await Promise.race([renderPromise, renderTimeout]);

          cleanupMermaidDOMErrors(uniqueId);

          // Check if theme switched while this diagram was rendering
          if (currentVersion !== globalThemeVersion) {
            // Re-render with newest theme
            const reRendered = await renderMermaidDiagram(chart, isDark, idPrefix);
            resolve(reRendered);
            return;
          }

          // Ensure SVG has proper styling for fluid responsiveness
          const sanitizedSvg = svg
            .replace(/<svg\s+/, '<svg style="max-width: 100%; height: auto; display: block; margin: 0 auto;" ')
            .replace(/height="[^"]*"/, '')
            .replace(/style="([^"]*max-width:[^"]*)"/, 'style="max-width: 100%; height: auto; display: block; margin: 0 auto;"');

          resolve(sanitizedSvg);
        } catch (err) {
          cleanupMermaidDOMErrors(uniqueId);
          reject(err);
        }
      })
      .catch((err) => {
        cleanupMermaidDOMErrors();
        reject(err);
      });
  });
}
