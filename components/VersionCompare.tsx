'use client';

import { useState, useEffect } from 'react';
import { ChapterVersion } from '@/lib/types';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { X } from 'lucide-react';

interface VersionCompareProps {
  chapterId: string;
  versionId: string;
  currentContent: string;
  currentTitle: string;
  onClose: () => void;
}

export default function VersionCompare({
  chapterId,
  versionId,
  currentContent,
  currentTitle,
  onClose,
}: VersionCompareProps) {
  const [version, setVersion] = useState<ChapterVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersion();
  }, [versionId]);

  const fetchVersion = async () => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}/versions/${versionId}`);
      const data = await response.json();
      setVersion(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch version:', error);
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Version Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading comparison...</p>
          ) : version ? (
            <div>
              {/* Title Comparison */}
              {version.title !== currentTitle && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title Change
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Old:</span>
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{version.title}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">New:</span>
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{currentTitle}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Comparison */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Changes
                </h3>
                <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <ReactDiffViewer
                    oldValue={stripHtml(version.content)}
                    newValue={stripHtml(currentContent)}
                    splitView={true}
                    leftTitle={`Version (${new Date(version.timestamp).toLocaleString()})`}
                    rightTitle="Current"
                    useDarkTheme={false}
                    showDiffOnly={false}
                    styles={{
                      variables: {
                        dark: {
                          diffViewerBackground: '#1f2937',
                          diffViewerColor: '#f3f4f6',
                          addedBackground: '#064e3b',
                          addedColor: '#d1fae5',
                          removedBackground: '#7f1d1d',
                          removedColor: '#fee2e2',
                          wordAddedBackground: '#065f46',
                          wordRemovedBackground: '#991b1b',
                          addedGutterBackground: '#064e3b',
                          removedGutterBackground: '#7f1d1d',
                          gutterBackground: '#374151',
                          gutterBackgroundDark: '#1f2937',
                          highlightBackground: '#4b5563',
                          highlightGutterBackground: '#374151',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Version not found</p>
          )}
        </div>
      </div>
    </div>
  );
}
