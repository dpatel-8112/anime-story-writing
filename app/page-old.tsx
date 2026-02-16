import Link from 'next/link';
import { getAllChapters, getAllCharacters, getMetadata } from '@/lib/fileSystem';

export default function Dashboard() {
  const metadata = getMetadata();
  const chapters = getAllChapters();
  const characters = getAllCharacters();

  const recentChapters = chapters.slice(-5).reverse();
  const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
  const inProgressChapters = chapters.filter(ch => ch.status === 'in-progress').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{metadata.title}</h1>
        {metadata.synopsis && (
          <p className="text-gray-600 mb-4">{metadata.synopsis}</p>
        )}
        <Link
          href="/settings"
          className="text-blue-600 hover:underline text-sm"
        >
          Edit Story Info
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Chapters</h3>
          <p className="text-3xl font-bold text-blue-600">{metadata.totalChapters}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Words</h3>
          <p className="text-3xl font-bold text-green-600">
            {metadata.totalWordCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Characters</h3>
          <p className="text-3xl font-bold text-purple-600">{characters.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-orange-600">{inProgressChapters}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/chapters/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            New Chapter
          </Link>
          <Link
            href="/characters"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
          >
            Add Character
          </Link>
          <Link
            href="/world"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
          >
            Add World Element
          </Link>
        </div>
      </div>

      {/* Recent Chapters */}
      {recentChapters.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Chapters</h2>
          <div className="space-y-3">
            {recentChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/chapters/${chapter.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      Episode {chapter.episodeNumber}: {chapter.title}
                    </h3>
                    {chapter.arc && (
                      <p className="text-sm text-gray-600">Arc: {chapter.arc}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {chapter.wordCount} words • {' '}
                      Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chapter.status === 'completed' ? 'bg-green-100 text-green-800' :
                    chapter.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {chapter.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/chapters"
            className="block mt-4 text-center text-blue-600 hover:underline"
          >
            View All Chapters
          </Link>
        </div>
      )}

      {chapters.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Start Writing Your Story!</h2>
          <p className="text-gray-600 mb-6">
            Create your first chapter to begin your anime story journey.
          </p>
          <Link
            href="/chapters/new"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First Chapter
          </Link>
        </div>
      )}
    </div>
  );
}
