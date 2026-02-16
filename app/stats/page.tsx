'use client';

import { useEffect, useState } from 'react';
import { getAllChapters } from '@/lib/fileSystem';
import { Chapter } from '@/lib/types';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react';

export default function StatsPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [writingGoal, setWritingGoal] = useState(1000);
  const [showGoalInput, setShowGoalInput] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/chapters');
      const data = await response.json();
      setChapters(data);

      const saved = localStorage.getItem('writingGoal');
      if (saved) {
        setWritingGoal(parseInt(saved));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = () => {
    localStorage.setItem('writingGoal', writingGoal.toString());
    setShowGoalInput(false);
  };

  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const avgWordsPerChapter = chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0;
  const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
  const inProgressChapters = chapters.filter(ch => ch.status === 'in-progress').length;

  // Calculate progress by arc
  const chaptersByArc = chapters.reduce((acc, ch) => {
    const arc = ch.arc || 'Unassigned';
    if (!acc[arc]) {
      acc[arc] = { total: 0, words: 0, completed: 0 };
    }
    acc[arc].total++;
    acc[arc].words += ch.wordCount;
    if (ch.status === 'completed') acc[arc].completed++;
    return acc;
  }, {} as Record<string, { total: number; words: number; completed: number }>);

  // Find longest and shortest chapters
  const sortedByLength = [...chapters].sort((a, b) => b.wordCount - a.wordCount);
  const longestChapter = sortedByLength[0];
  const shortestChapter = sortedByLength[sortedByLength.length - 1];

  // Recent writing activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentChapters = chapters.filter(ch => {
    const updated = new Date(ch.updatedAt);
    return updated >= sevenDaysAgo;
  });

  const recentWords = recentChapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <BarChart3 className="text-blue-600" />
          Writing Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your writing progress and achievements
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">Total Words</h3>
          <p className="text-4xl font-bold">{totalWords.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">Chapters</h3>
          <p className="text-4xl font-bold">{chapters.length}</p>
          <p className="text-sm opacity-90 mt-1">{completedChapters} completed</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">Avg per Chapter</h3>
          <p className="text-4xl font-bold">{avgWordsPerChapter}</p>
          <p className="text-sm opacity-90 mt-1">words</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">In Progress</h3>
          <p className="text-4xl font-bold">{inProgressChapters}</p>
          <p className="text-sm opacity-90 mt-1">chapters</p>
        </div>
      </div>

      {/* Writing Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="text-blue-600" />
            Daily Writing Goal
          </h3>
          <button
            onClick={() => setShowGoalInput(!showGoalInput)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showGoalInput ? 'Cancel' : 'Edit Goal'}
          </button>
        </div>

        {showGoalInput ? (
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={writingGoal}
              onChange={(e) => setWritingGoal(parseInt(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">words per day</span>
            <button
              onClick={saveGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {writingGoal} words per day
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((recentWords / 7 / writingGoal) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Avg last 7 days: {Math.round(recentWords / 7)} words/day
            </p>
          </div>
        )}
      </div>

      {/* Progress by Arc */}
      {Object.keys(chaptersByArc).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Progress by Arc</h3>
          <div className="space-y-4">
            {Object.entries(chaptersByArc).map(([arc, stats]) => (
              <div key={arc}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{arc}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.completed}/{stats.total} chapters • {stats.words.toLocaleString()} words
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Longest/Shortest Chapters */}
        {chapters.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Chapter Length</h3>
            <div className="space-y-3">
              {longestChapter && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Chapter</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    Ep {longestChapter.episodeNumber}: {longestChapter.title}
                  </p>
                  <p className="text-sm text-blue-600">{longestChapter.wordCount} words</p>
                </div>
              )}
              {shortestChapter && chapters.length > 1 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shortest Chapter</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    Ep {shortestChapter.episodeNumber}: {shortestChapter.title}
                  </p>
                  <p className="text-sm text-blue-600">{shortestChapter.wordCount} words</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Recent Activity (7 days)
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chapters Edited</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{recentChapters.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Words Written</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{recentWords.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Average</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{Math.round(recentWords / 7)}</p>
            </div>
          </div>
        </div>
      </div>

      {chapters.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">No Data Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start writing chapters to see your statistics here!
          </p>
        </div>
      )}
    </div>
  );
}
