'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Chapter } from '@/lib/types';
import RichTextEditorWithMentionsWrapper from '@/components/RichTextEditorWithMentionsWrapper';
import VersionHistory from '@/components/VersionHistory';
import VersionCompare from '@/components/VersionCompare';
import SaveVersionModal from '@/components/SaveVersionModal';
import { Save, Trash2, Clock, Tag, History } from 'lucide-react';

export default function ChapterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        tags: [],
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

  const saveChapter = async (createVersion: boolean = false, versionNote?: string) => {
    if (!chapter) return;

    setSaving(true);
    try {
      // Calculate word count from HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = chapter.content || '';
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;

      const updatedChapter = {
        ...chapter,
        updatedAt: new Date().toISOString(),
        wordCount,
      };

      const response = await fetch(
        id === 'new' ? '/api/chapters' : `/api/chapters/${id}`,
        {
          method: id === 'new' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapter: updatedChapter,
            createVersion,
            versionNote,
          }),
        }
      );

      if (response.ok) {
        const savedChapter = await response.json();
        setChapter(savedChapter);
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

  const handleManualSave = () => {
    if (id === 'new') {
      // For new chapters, save without version
      saveChapter(false);
    } else {
      // For existing chapters, show modal to create version
      setShowSaveModal(true);
    }
  };

  const handleSaveWithNote = async (note?: string) => {
    setShowSaveModal(false);
    await saveChapter(true, note);
  };

  const handleRestore = async (versionId: string) => {
    try {
      const response = await fetch(`/api/chapters/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (response.ok) {
        const restoredChapter = await response.json();
        setChapter(restoredChapter);
        setShowVersionHistory(false);
        alert('Version restored successfully!');
        // Reload the page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version');
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

  const addTag = () => {
    if (!chapter || !tagInput.trim()) return;
    const newTags = [...(chapter.tags || []), tagInput.trim()];
    setChapter({ ...chapter, tags: newTags });
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!chapter) return;
    const newTags = (chapter.tags || []).filter(tag => tag !== tagToRemove);
    setChapter({ ...chapter, tags: newTags });
  };

  // Debounced auto-save - saves 3 seconds after user stops editing
  const debouncedAutoSave = useCallback(() => {
    if (!chapter || id === 'new') return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (without creating version)
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveChapter(false); // createVersion: false
    }, 3000); // 3 seconds after user stops typing
  }, [chapter, id]);

  // Trigger debounced auto-save when chapter content changes
  useEffect(() => {
    if (!chapter || id === 'new') return;

    debouncedAutoSave();

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [chapter?.content, chapter?.title, debouncedAutoSave]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Chapter Not Found</h1>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {id === 'new' ? 'New Chapter' : 'Edit Chapter'}
        </h1>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock size={16} />
              {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {id !== 'new' && (
            <button
              onClick={() => setShowVersionHistory(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <History size={18} />
              History
            </button>
          )}
          <button
            onClick={handleManualSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {id !== 'new' && (
            <button
              onClick={deleteChapter}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Chapter Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Episode Number
            </label>
            <input
              type="number"
              value={chapter.episodeNumber}
              onChange={(e) => setChapter({ ...chapter, episodeNumber: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Arc
            </label>
            <input
              type="text"
              value={chapter.arc}
              onChange={(e) => setChapter({ ...chapter, arc: e.target.value })}
              placeholder="e.g., Training Arc"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={chapter.status}
              onChange={(e) => setChapter({ ...chapter, status: e.target.value as Chapter['status'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chapter Title
          </label>
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => setChapter({ ...chapter, title: e.target.value })}
            placeholder="Enter chapter title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <input
            type="text"
            value={chapter.notes || ''}
            onChange={(e) => setChapter({ ...chapter, notes: e.target.value })}
            placeholder="Add any notes or ideas..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Tag size={16} />
            Tags
          </label>
          <div className="flex gap-2 mb-2">
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
            {chapter.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
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
      </div>

      {/* Rich Text Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
        </div>
        <RichTextEditorWithMentionsWrapper
          content={chapter.content}
          onChange={(content) => setChapter({ ...chapter, content })}
          placeholder="Start writing your chapter... (Type @ to mention characters or places)"
        />
      </div>

      {/* Auto-save Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
        <strong>Auto-save:</strong> Your work is automatically saved 3 seconds after you stop typing (without creating versions).
        <br />
        <strong>Version History:</strong> Click the Save button to create a version snapshot you can restore later.
      </div>

      {/* Modals and Sidebars */}
      {showVersionHistory && (
        <VersionHistory
          chapterId={id}
          onRestore={handleRestore}
          onCompare={(versionId) => setCompareVersionId(versionId)}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {showSaveModal && (
        <SaveVersionModal
          onSave={handleSaveWithNote}
          onCancel={() => setShowSaveModal(false)}
        />
      )}

      {compareVersionId && chapter && (
        <VersionCompare
          chapterId={id}
          versionId={compareVersionId}
          currentContent={chapter.content}
          currentTitle={chapter.title}
          onClose={() => setCompareVersionId(null)}
        />
      )}
    </div>
  );
}
