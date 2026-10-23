import { useCallback, useEffect, useState } from 'react';

// Light or dark look. The choice is remembered on this device. Until someone chooses, the site
// follows the device's own setting. index.html sets the starting theme before the page paints.
const KEY = 'rc-theme';
const COLORS = { light: '#2f4a3f', dark: '#12171a' };

const systemTheme = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const savedTheme = () => {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
};

function apply(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLORS[theme]);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const fromPage = typeof document !== 'undefined' ? document.documentElement.dataset.theme : null;
    return fromPage === 'dark' || fromPage === 'light' ? fromPage : savedTheme() || systemTheme();
  });

  useEffect(() => {
    apply(theme);
  }, [theme]);

  // Follow the device setting while no choice has been made, and stay in step with other tabs.
  useEffect(() => {
    let query;
    const onSystem = (event) => {
      if (!savedTheme()) setTheme(event.matches ? 'dark' : 'light');
    };
    const onStorage = (event) => {
      if (event.key === KEY && (event.newValue === 'dark' || event.newValue === 'light')) setTheme(event.newValue);
    };
    try {
      query = window.matchMedia('(prefers-color-scheme: dark)');
      query.addEventListener('change', onSystem);
    } catch {
      query = null;
    }
    window.addEventListener('storage', onStorage);
    return () => {
      query?.removeEventListener('change', onSystem);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(KEY, next);
      } catch {
        // Private browsing: the choice just lasts for this visit.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
