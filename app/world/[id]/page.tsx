'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { WorldElement } from '@/lib/types';

export default function WorldElementEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [id, setId] = useState<string>('');
  const [element, setElement] = useState<WorldElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      if (isNew) {
        // Initialize new world element
        const newElement: WorldElement = {
          id: p.id,
          name: '',
          type: 'location',
          description: '',
          relatedCharacters: [],
          relatedChapters: [],
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setElement(newElement);
        setLoading(false);
      } else {
        fetchElement(p.id);
      }
    });
  }, [isNew]);

  const fetchElement = async (elementId: string) => {
    try {
      const response = await fetch(`/api/world/${elementId}`);
      if (response.ok) {
        const data = await response.json();
        setElement(data);
      } else {
        console.error('Element not found');
        router.push('/world');
      }
    } catch (error) {
      console.error('Failed to load element:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!element || !element.name.trim()) {
      alert('Please enter a name for this element');
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? '/api/world' : `/api/world/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(element),
      });

      if (response.ok) {
        alert('World element saved successfully!');
        if (isNew) {
          router.push('/world');
        }
      } else {
        alert('Failed to save world element');
      }
    } catch (error) {
      console.error('Failed to save element:', error);
      alert('Failed to save world element');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this world element? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/world/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/world');
      } else {
        alert('Failed to delete world element');
      }
    } catch (error) {
      console.error('Failed to delete element:', error);
      alert('Failed to delete world element');
    }
  };

  const addTag = () => {
    if (!element || !tagInput.trim()) return;
    const tags = element.tags || [];
    if (!tags.includes(tagInput.trim())) {
      setElement({ ...element, tags: [...tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!element) return;
    setElement({ ...element, tags: (element.tags || []).filter(t => t !== tag) });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading world element...</p>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          World Element Not Found
        </h1>
        <button
          onClick={() => router.push('/world')}
          className="text-blue-600 hover:underline"
        >
          Back to World Building
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/world')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isNew ? 'New World Element' : element.name || 'Unnamed Element'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isNew ? 'Create a new world element' : 'Edit world element details'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete world element"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Element'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={element.name}
                onChange={(e) => setElement({ ...element, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Element name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={element.type}
                onChange={(e) => setElement({ ...element, type: e.target.value as WorldElement['type'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="location">Location</option>
                <option value="organization">Organization</option>
                <option value="item">Item</option>
                <option value="concept">Concept</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Significance
            </label>
            <select
              value={element.significance}
              onChange={(e) => setElement({ ...element, significance: e.target.value as 'minor' | 'moderate' | 'major' | 'critical' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={element.description}
              onChange={(e) => setElement({ ...element, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              rows={3}
              placeholder="Brief description of this element"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(element.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Relationships */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Relationships
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Related Characters: {element.relatedCharacters?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Related Chapters: {element.relatedChapters?.length || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Relationships will be automatically tracked when you reference this element in your story.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
