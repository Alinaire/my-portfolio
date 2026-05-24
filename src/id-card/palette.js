import { useEffect, useState } from 'react';

export const DEFAULT_PALETTE = {
  bg: '#f5efe5',
  surface: 'rgba(255, 255, 255, 0.72)',
  surfaceStrong: 'rgba(255, 255, 255, 0.94)',
  text: '#101827',
  muted: '#52606d',
  border: 'rgba(16, 24, 40, 0.1)',
  accent: '#0f766e',
  accentStrong: '#115e59',
  accentSoft: 'rgba(15, 118, 110, 0.14)',
};

export function useProjectPalette() {
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const readPalette = () => {
      const styles = window.getComputedStyle(window.document.documentElement);
      setPalette({
        bg: styles.getPropertyValue('--bg').trim() || DEFAULT_PALETTE.bg,
        surface: styles.getPropertyValue('--surface').trim() || DEFAULT_PALETTE.surface,
        surfaceStrong:
          styles.getPropertyValue('--surface-strong').trim() || DEFAULT_PALETTE.surfaceStrong,
        text: styles.getPropertyValue('--text').trim() || DEFAULT_PALETTE.text,
        muted: styles.getPropertyValue('--muted').trim() || DEFAULT_PALETTE.muted,
        border: styles.getPropertyValue('--border').trim() || DEFAULT_PALETTE.border,
        accent: styles.getPropertyValue('--accent').trim() || DEFAULT_PALETTE.accent,
        accentStrong:
          styles.getPropertyValue('--accent-strong').trim() || DEFAULT_PALETTE.accentStrong,
        accentSoft: styles.getPropertyValue('--accent-soft').trim() || DEFAULT_PALETTE.accentSoft,
      });
    };

    readPalette();

    const onThemeChange = () => readPalette();
    const onStorage = (event) => {
      if (event.key === 'theme') readPalette();
    };

    const observer = new MutationObserver(readPalette);
    observer.observe(window.document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    window.addEventListener('themechange', onThemeChange);
    window.addEventListener('storage', onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('themechange', onThemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return palette;
}
