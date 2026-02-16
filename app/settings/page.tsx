'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoryMetadata } from '@/lib/types';
import { Save, ArrowLeft } from 'lucide-react';

const ANIME_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
  'Thriller', 'Mecha', 'Isekai', 'Shounen', 'Shoujo', 'Seinen', 'Josei'
];

export default function SettingsPage() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<StoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setMetadata(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!metadata) return;

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (response.ok) {
        const updated = await response.json();
        setMetadata(updated);
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genre: string) => {
    if (!metadata) return;
    const genres = metadata.genre || [];
    if (genres.includes(genre)) {
      setMetadata({ ...metadata, genre: genres.filter(g => g !== genre) });
    } else {
      setMetadata({ ...metadata, genre: [...genres, genre] });
    }
  };

  const addTag = () => {
    if (!metadata || !tagInput.trim()) return;
    const tags = metadata.tags || [];
    if (!tags.includes(tagInput.trim())) {
      setMetadata({ ...metadata, tags: [...tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!metadata) return;
    setMetadata({ ...metadata, tags: (metadata.tags || []).filter(t => t !== tag) });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading settings...</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Failed to Load Settings
        </h1>
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:underline"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Story Settings
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Story Title
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Enter your story title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Author Name
          </label>
          <input
            type="text"
            value={metadata.author}
            onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Your name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Synopsis
          </label>
          <textarea
            value={metadata.synopsis}
            onChange={(e) => setMetadata({ ...metadata, synopsis: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            rows={4}
            placeholder="Brief description of your story..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <input
            type="text"
            value={metadata.language || ''}
            onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., English, Japanese..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Copyright
          </label>
          <input
            type="text"
            value={metadata.copyright || ''}
            onChange={(e) => setMetadata({ ...metadata, copyright: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="© 2026 Your Name. All rights reserved."
          />
        </div>
      </div>

      {/* Genre Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Genres
        </h2>
        <div className="flex flex-wrap gap-2">
          {ANIME_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                (metadata.genre || []).includes(genre)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Tags
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(metadata.tags || []).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Writing Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Writing Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Word Count
            </label>
            <input
              type="number"
              value={metadata.targetWordCount || ''}
              onChange={(e) => setMetadata({ ...metadata, targetWordCount: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="e.g., 50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Writing Goal
            </label>
            <input
              type="number"
              value={metadata.writingGoal || ''}
              onChange={(e) => setMetadata({ ...metadata, writingGoal: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="e.g., 1000 words/day"
            />
          </div>
        </div>
      </div>

      {/* Statistics (Read-only) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Story Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Chapters</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metadata.totalChapters}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Word Count</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metadata.totalWordCount.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metadata.targetWordCount
                ? `${Math.round((metadata.totalWordCount / metadata.targetWordCount) * 100)}%`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
