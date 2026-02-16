import Link from 'next/link';
import { getAllChapters } from '@/lib/fileSystem';

export default function ChaptersPage() {
  const chapters = getAllChapters();

  // Group chapters by arc
  const chaptersByArc = chapters.reduce((acc, chapter) => {
    const arc = chapter.arc || 'Unassigned';
    if (!acc[arc]) {
      acc[arc] = [];
    }
    acc[arc].push(chapter);
    return acc;
  }, {} as Record<string, typeof chapters>);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Chapters</h1>
        <Link
          href="/chapters/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          New Chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">No Chapters Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start writing your story by creating your first chapter.
          </p>
          <Link
            href="/chapters/new"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First Chapter
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(chaptersByArc).map(([arc, arcChapters]) => (
            <div key={arc} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                {arc}
              </h2>
              <div className="space-y-3">
                {arcChapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/chapters/${chapter.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all bg-white dark:bg-gray-900"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          Episode {chapter.episodeNumber}: {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {chapter.wordCount} words • {' '}
                          Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
                        </p>
                        {chapter.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            Note: {chapter.notes.substring(0, 100)}
                            {chapter.notes.length > 100 && '...'}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 ${
                        chapter.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        chapter.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {chapter.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {chapters.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Chapters</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chapters.length}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Words</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {chapters.reduce((sum, ch) => sum + ch.wordCount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {chapters.filter(ch => ch.status === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {chapters.filter(ch => ch.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
