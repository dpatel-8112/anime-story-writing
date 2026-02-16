'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';

interface SaveVersionModalProps {
  onSave: (note?: string) => void;
  onCancel: () => void;
}

export default function SaveVersionModal({ onSave, onCancel }: SaveVersionModalProps) {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Save Version</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., 'Fixed plot hole in scene 3', 'First draft complete', 'Added character development'..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  onSave(note || undefined);
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add a note to help you identify this version later. Press Ctrl+Enter to save quickly.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(note || undefined)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} />
              Save Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
