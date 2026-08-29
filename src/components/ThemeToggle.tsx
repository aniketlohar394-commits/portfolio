'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('homemate-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('homemate-theme', nextTheme);
  };

  if (!mounted) {
    return (
      <button 
        className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border text-text-secondary opacity-50"
        aria-label="Toggle theme"
      >
        <Sun size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border text-text hover:text-primary transition-colors hover:scale-105 active:scale-95 shadow-sm"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun size={18} className="text-warning hover:text-orange-500 transition-colors" />
      ) : (
        <Moon size={18} className="text-text-secondary hover:text-primary transition-colors" />
      )}
    </button>
  );
}
