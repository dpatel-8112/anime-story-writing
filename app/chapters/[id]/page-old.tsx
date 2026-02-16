'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Chapter } from '@/lib/types';

export default function ChapterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === 'new') {
      const newChapter: Chapter = {
        id: `chapter-${Date.now()}`,
        title: '',
        episodeNumber: 1,
        arc: '',
        content: '',
        wordCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        notes: '',
      };
      setChapter(newChapter);
      setLoading(false);
    } else {
      fetch(`/api/chapters/${id}`)
        .then(res => res.json())
        .then(data => {
          setChapter(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load chapter:', err);
          setLoading(false);
        });
    }
  }, [id]);

  const saveChapter = async () => {
    if (!chapter) return;

    setSaving(true);
    try {
      const updatedChapter = {
        ...chapter,
        updatedAt: new Date().toISOString(),
        wordCount: chapter.content.trim().split(/\s+/).filter(word => word.length > 0).length,
      };

      const response = await fetch(
        id === 'new' ? '/api/chapters' : `/api/chapters/${id}`,
        {
          method: id === 'new' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedChapter),
        }
      );

      if (response.ok) {
        setChapter(updatedChapter);
        setLastSaved(new Date());

        if (id === 'new') {
          router.push(`/chapters/${updatedChapter.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save chapter:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteChapter = async () => {
    if (!chapter || id === 'new') return;

    if (confirm('Are you sure you want to delete this chapter?')) {
      try {
        await fetch(`/api/chapters/${id}`, { method: 'DELETE' });
        router.push('/chapters');
      } catch (error) {
        console.error('Failed to delete chapter:', error);
      }
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!chapter || id === 'new') return;

    const interval = setInterval(() => {
      saveChapter();
    }, 30000);

    return () => clearInterval(interval);
  }, [chapter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chapter Not Found</h1>
        <button
          onClick={() => router.push('/chapters')}
          className="text-blue-600 hover:underline"
        >
          Back to Chapters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {id === 'new' ? 'New Chapter' : 'Edit Chapter'}
        </h1>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={saveChapter}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {id !== 'new' && (
            <button
              onClick={deleteChapter}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Chapter Metadata */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Episode Number
            </label>
            <input
              type="number"
              value={chapter.episodeNumber}
              onChange={(e) => setChapter({ ...chapter, episodeNumber: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arc
            </label>
            <input
              type="text"
              value={chapter.arc}
              onChange={(e) => setChapter({ ...chapter, arc: e.target.value })}
              placeholder="e.g., Training Arc"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={chapter.status}
              onChange={(e) => setChapter({ ...chapter, status: e.target.value as Chapter['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chapter Title
          </label>
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => setChapter({ ...chapter, title: e.target.value })}
            placeholder="Enter chapter title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <input
            type="text"
            value={chapter.notes || ''}
            onChange={(e) => setChapter({ ...chapter, notes: e.target.value })}
            placeholder="Add any notes or ideas..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chapter Content Editor */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-lg font-medium text-gray-700">
            Content
          </label>
          <span className="text-sm text-gray-500">
            {chapter.content.trim().split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
        <textarea
          value={chapter.content}
          onChange={(e) => setChapter({ ...chapter, content: e.target.value })}
          placeholder="Start writing your chapter here..."
          className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base resize-y"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Quick Save Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Auto-save is enabled. Your work is automatically saved every 30 seconds.
        You can also manually save using the Save button above.
      </div>
    </div>
  );
}
