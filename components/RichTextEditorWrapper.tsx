'use client';

import dynamic from 'next/dynamic';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = dynamic<RichTextEditorProps>(
  () => import('./RichTextEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export default function RichTextEditorWrapper(props: RichTextEditorProps) {
  return <RichTextEditor {...props} />;
}
