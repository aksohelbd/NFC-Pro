import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('app_theme') as 'light' | 'dark' | null;
    if (saved === 'light') return 'light';
    return 'dark'; // Default is strictly dark mode
  });

  useEffect(() => {
    const saved = localStorage.getItem('app_theme') as 'light' | 'dark' | null;
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('app_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border shadow-xs cursor-pointer ${
        theme === 'dark'
          ? 'bg-neutral-900 border-neutral-700 text-amber-400 hover:bg-neutral-800'
          : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-[11px]">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-medium text-[11px]">Dark Mode</span>
        </>
      )}
    </button>
  );
}
