'use client';

import { useState, useEffect } from 'react';
import { ChapterVersion } from '@/lib/types';
import { Clock, RotateCcw, GitCompare, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  chapterId: string;
  onRestore: (versionId: string) => void;
  onCompare: (versionId: string) => void;
  onClose: () => void;
}

export default function VersionHistory({
  chapterId,
  onRestore,
  onCompare,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [chapterId]);

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}/versions`);
      const data = await response.json();
      setVersions(data.versions.reverse()); // Newest first
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Clock size={20} />
          Version History
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Version List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading versions...</p>
        ) : versions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p>No versions yet</p>
            <p className="text-sm mt-2">Click Save to create your first version</p>
          </div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
            >
              {/* Version Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {version.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                  </div>
                </div>
                {index === 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Latest
                  </span>
                )}
              </div>

              {/* Version Info */}
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 space-y-1">
                <div>Words: {version.wordCount.toLocaleString()}</div>
                {version.note && (
                  <div className="mt-1 italic text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 p-2 rounded">
                    "{version.note}"
                  </div>
                )}
                {version.contentDiff && (version.contentDiff.added > 0 || version.contentDiff.removed > 0) && (
                  <div className="mt-1 flex gap-2">
                    {version.contentDiff.added > 0 && (
                      <span className="text-green-600 dark:text-green-400">+{version.contentDiff.added} words</span>
                    )}
                    {version.contentDiff.removed > 0 && (
                      <span className="text-red-600 dark:text-red-400">-{version.contentDiff.removed} words</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onCompare(version.id)}
                  className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <GitCompare size={14} />
                  Compare
                </button>
                <button
                  onClick={() => {
                    if (confirm('Restore this version? Your current work will be saved as a new version before restoring.')) {
                      onRestore(version.id);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} />
                  Restore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
