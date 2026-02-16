'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { Moon, Sun, Target, Search } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useTheme();

  const isActive = (path: string) => {
    return pathname === path
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Anime Story Writer
          </Link>
          <div className="flex space-x-2 items-center">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              href="/chapters"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/chapters')}`}
            >
              Chapters
            </Link>
            <Link
              href="/characters"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/characters')}`}
            >
              Characters
            </Link>
            <Link
              href="/world"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/world')}`}
            >
              World
            </Link>
            <Link
              href="/goals"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/goals')}`}
            >
              <Target size={18} className="inline mr-1" />
              Goals
            </Link>
            <Link
              href="/search"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/search')}`}
            >
              <Search size={18} className="inline mr-1" />
              Search
            </Link>
            <Link
              href="/settings"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/settings')}`}
            >
              Settings
            </Link>
            <Link
              href="/export"
              className={`px-4 py-2 rounded-md transition-colors ${isActive('/export')}`}
            >
              Export
            </Link>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
