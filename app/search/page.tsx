'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { SearchResults } from '@/lib/searchHelpers';

type ContentType = 'all' | 'chapters' | 'characters' | 'world' | 'scenes';
type SortBy = 'relevance' | 'date' | 'alphabetical';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResults>({
    chapters: [],
    characters: [],
    worldElements: [],
    scenes: [],
  });
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    // Load available tags from all content
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      // Get tags from metadata
      const metadataRes = await fetch('/api/settings');
      const metadata = await metadataRes.json();
      const tags = new Set<string>(metadata.tags || []);

      // Could also fetch from characters, world elements, etc.
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      setResults({ chapters: [], characters: [], worldElements: [], scenes: [] });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: contentType,
        sortBy: sortBy,
      });

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setContentType('all');
    setSortBy('relevance');
  };

  const getTotalResults = () => {
    return (
      results.chapters.length +
      results.characters.length +
      results.worldElements.length +
      results.scenes.length
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Search
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters, characters, world elements..."
            className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter size={18} />
            Filters
            <ChevronDown
              size={16}
              className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Content Type Filter */}
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All Content</option>
            <option value="chapters">Chapters</option>
            <option value="characters">Characters</option>
            <option value="world">World Elements</option>
            <option value="scenes">Scenes</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="date">Sort by Date</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>

          {(selectedTags.length > 0 || contentType !== 'all' || sortBy !== 'relevance') && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {showFilters && availableTags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Filter by Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {query && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            'Searching...'
          ) : (
            <>
              Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''} for "{query}"
            </>
          )}
        </div>
      )}

      {/* Results Sections */}
      {!loading && query && (
        <div className="space-y-6">
          {/* Chapters */}
          {(contentType === 'all' || contentType === 'chapters') && results.chapters.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Chapters ({results.chapters.length})
              </h2>
              <div className="space-y-3">
                {results.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => router.push(`/chapters/${chapter.id}`)}
                    className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Chapter {chapter.episodeNumber}: {chapter.title}
                        </h3>
                        {chapter.arc && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Arc: {chapter.arc}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {chapter.content.substring(0, 200)}...
                        </p>
                        {chapter.tags && chapter.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {chapter.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                        {chapter.wordCount.toLocaleString()} words
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Characters */}
          {(contentType === 'all' || contentType === 'characters') && results.characters.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Characters ({results.characters.length})
              </h2>
              <div className="space-y-3">
                {results.characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => router.push(`/characters/${character.id}`)}
                    className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {character.name}
                        </h3>
                        {character.role && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {character.role}
                          </p>
                        )}
                        {character.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {character.description}
                          </p>
                        )}
                        {character.tags && character.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {character.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* World Elements */}
          {(contentType === 'all' || contentType === 'world') && results.worldElements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                World Elements ({results.worldElements.length})
              </h2>
              <div className="space-y-3">
                {results.worldElements.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => router.push(`/world/${element.id}`)}
                    className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {element.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {element.type}
                        </p>
                        {element.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {element.description}
                          </p>
                        )}
                        {element.tags && element.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {element.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scenes */}
          {(contentType === 'all' || contentType === 'scenes') && results.scenes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Scenes ({results.scenes.length})
              </h2>
              <div className="space-y-3">
                {results.scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => router.push(`/chapters/${scene.chapterId}`)}
                    className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {scene.title}
                        </h3>
                        {scene.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {scene.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {getTotalResults() === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search query or filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Search your story
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search query to find chapters, characters, world elements, and scenes
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-96">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading search...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
