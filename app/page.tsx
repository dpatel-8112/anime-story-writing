import Link from 'next/link';
import { getAllChapters, getAllCharacters, getMetadata, getAllWorldElements, getAllGoals } from '@/lib/fileSystem';
import { BookOpen, Users, Globe, TrendingUp, Target } from 'lucide-react';

export default function Dashboard() {
  const metadata = getMetadata();
  const chapters = getAllChapters();
  const characters = getAllCharacters();
  const worldElements = getAllWorldElements();
  const goals = getAllGoals();

  const recentChapters = chapters.slice(-5).reverse();
  const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
  const inProgressChapters = chapters.filter(ch => ch.status === 'in-progress').length;

  // Calculate this week's progress
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentlyUpdated = chapters.filter(ch => new Date(ch.updatedAt) >= oneWeekAgo);
  const weeklyWords = recentlyUpdated.reduce((sum, ch) => sum + ch.wordCount, 0);

  // Active goals
  const activeGoals = goals.filter(g => g.status === 'active');
  const getProgressPercentage = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{metadata.title}</h1>
        {metadata.synopsis && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{metadata.synopsis}</p>
        )}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          {metadata.author && <span>By {metadata.author}</span>}
          {metadata.genre.length > 0 && <span>• {metadata.genre.join(', ')}</span>}
        </div>
      </div>

      {/* Stats Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Chapters</h3>
            <BookOpen size={24} className="opacity-80" />
          </div>
          <p className="text-4xl font-bold">{metadata.totalChapters}</p>
          <p className="text-sm opacity-90 mt-1">{completedChapters} completed</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Words</h3>
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-4xl font-bold">{metadata.totalWordCount.toLocaleString()}</p>
          <p className="text-sm opacity-90 mt-1">+{weeklyWords.toLocaleString()} this week</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Characters</h3>
            <Users size={24} className="opacity-80" />
          </div>
          <p className="text-4xl font-bold">{characters.length}</p>
          <p className="text-sm opacity-90 mt-1">
            {characters.filter(c => c.role === 'protagonist').length} main
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">World Elements</h3>
            <Globe size={24} className="opacity-80" />
          </div>
          <p className="text-4xl font-bold">{worldElements.length}</p>
          <p className="text-sm opacity-90 mt-1">
            {worldElements.filter(e => e.type === 'location').length} locations
          </p>
        </div>
      </div>

      {/* Writing Goals Widget */}
      {activeGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Active Writing Goals</h2>
            <Link
              href="/goals"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View All Goals
            </Link>
          </div>
          <div className="space-y-4">
            {activeGoals.slice(0, 3).map((goal) => {
              const percentage = getProgressPercentage(goal.current, goal.target);
              const progressColor = percentage >= 100 ? 'bg-green-500' :
                                   percentage >= 75 ? 'bg-blue-500' :
                                   percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

              return (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Target size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{goal.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {goal.type.replace('-', ' ')} • {goal.period}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {percentage}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${progressColor} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                      {goal.current} / {goal.target}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/chapters/new"
            className="group bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-all text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <span className="text-2xl mb-2 block">+</span>
            New Chapter
          </Link>
          <Link
            href="/characters"
            className="group bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-all text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <span className="text-2xl mb-2 block">👤</span>
            Add Character
          </Link>
          <Link
            href="/world"
            className="group bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-all text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <span className="text-2xl mb-2 block">🌍</span>
            Add World Element
          </Link>
          <Link
            href="/goals"
            className="group bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 transition-all text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <span className="text-2xl mb-2 block">🎯</span>
            Set Goals
          </Link>
        </div>
      </div>

      {/* Recent Chapters */}
      {recentChapters.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Recent Chapters</h2>
          <div className="space-y-3">
            {recentChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/chapters/${chapter.id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      Episode {chapter.episodeNumber}: {chapter.title}
                    </h3>
                    {chapter.arc && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Arc: {chapter.arc}</p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {chapter.wordCount} words • {' '}
                      Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
                    </p>
                    {chapter.tags && chapter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chapter.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chapter.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    chapter.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {chapter.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/chapters"
            className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Chapters
          </Link>
        </div>
      )}

      {chapters.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">Start Writing Your Story!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first chapter to begin your anime story journey.
          </p>
          <Link
            href="/chapters/new"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Create First Chapter
          </Link>
        </div>
      )}
    </div>
  );
}
