'use client';

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function SimpleEditor({ content, onChange, placeholder }: SimpleEditorProps) {
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Start writing your chapter...'}
        className="w-full h-96 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base resize-y dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
