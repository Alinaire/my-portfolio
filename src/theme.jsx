import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function Theme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Update html/body classes and data-theme attributes
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
    }

    // Persist selection
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update mobile browser theme color meta tag to match background
    try {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = isDark ? '#07110f' : '#f5efe5';
    } catch {
      // ignore
    }

    // dispatch an event in case any non-React code listens for theme changes
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: isDark ? 'dark' : 'light' } }));
  }, [isDark]);

  // Listen for system theme changes if user hasn't explicitly chosen a theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    if (saved) return; // user preference exists, do not auto-sync

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const mqHandler = (e) => setIsDark(!!e.matches);

    if (mq.addEventListener) mq.addEventListener('change', mqHandler);
    else mq.addListener(mqHandler);

    // Keep components in sync: respond to theme changes from other components or tabs
    const themeChangeHandler = (e) => {
      const theme = e?.detail?.theme ?? localStorage.getItem('theme');
      if (theme) setIsDark(theme === 'dark');
    };

    const storageHandler = (e) => {
      if (e.key === 'theme') setIsDark(e.newValue === 'dark');
    };

    window.addEventListener('themechange', themeChangeHandler);
    window.addEventListener('storage', storageHandler);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', mqHandler);
      else mq.removeListener(mqHandler);
      window.removeEventListener('themechange', themeChangeHandler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <button
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-8 w-14 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-1 shadow-[var(--shadow)] backdrop-blur-xl transition-colors duration-300"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--accent)] shadow-sm transition-transform duration-300 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
      {isDark ? (
        <Moon className="absolute right-2 h-3.5 w-3.5 text-[var(--accent)]" />
      ) : (
        <Sun className="absolute left-2 h-3.5 w-3.5 text-[var(--accent)]" />
      )}
    </button>
  );
}
