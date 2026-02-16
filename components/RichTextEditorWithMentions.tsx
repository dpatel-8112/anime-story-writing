'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Mention from '@tiptap/extension-mention';
import { useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Quote, Undo, Redo, Highlighter
} from 'lucide-react';
import { Character, WorldElement } from '@/lib/types';

interface RichTextEditorWithMentionsProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface MentionSuggestion {
  id: string;
  label: string;
  type: 'character' | 'location';
}

export default function RichTextEditorWithMentions({ content, onChange, placeholder }: RichTextEditorWithMentionsProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<WorldElement[]>([]);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  // Load characters and locations
  useEffect(() => {
    const loadData = async () => {
      try {
        const [charsRes, worldRes] = await Promise.all([
          fetch('/api/characters'),
          fetch('/api/world')
        ]);
        const charsData = await charsRes.json();
        const worldData = await worldRes.json();

        setCharacters(charsData);
        setLocations(worldData.filter((el: WorldElement) => el.type === 'location'));
      } catch (error) {
        console.error('Failed to load suggestions data:', error);
      }
    };
    loadData();
  }, []);

  const getSuggestions = useCallback((query: string) => {
    const allSuggestions: MentionSuggestion[] = [
      ...characters.map(char => ({
        id: char.id,
        label: char.name,
        type: 'character' as const
      })),
      ...locations.map(loc => ({
        id: loc.id,
        label: loc.title,
        type: 'location' as const
      }))
    ];

    if (!query) {
      return allSuggestions;
    }

    const lowerQuery = query.toLowerCase();
    return allSuggestions.filter(item =>
      item.label.toLowerCase().includes(lowerQuery)
    );
  }, [characters, locations]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your chapter... (Type @ to mention characters or places)',
      }),
      CharacterCount,
      Highlight.configure({
        multicolor: true,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        renderLabel({ node }) {
          return `@${node.attrs.label}`;
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4 dark:prose-invert',
      },
      handleKeyDown: (view, event) => {
        // Handle @ key to show suggestions
        if (event.key === '@') {
          const { state } = view;
          const { selection } = state;
          const coords = view.coordsAtPos(selection.from);

          console.log('@ key pressed, showing suggestions at:', coords);

          setSuggestionPosition({
            top: coords.bottom + 8,
            left: coords.left
          });

          // Show all suggestions
          const allSuggestions = getSuggestions('');
          console.log('Available suggestions:', allSuggestions);
          setSuggestions(allSuggestions);
          setSelectedIndex(0);
          setShowSuggestions(true);
          setSuggestionQuery('');
          return false; // Allow the @ to be typed
        }

        // Handle arrow keys and Enter when suggestions are shown
        if (showSuggestions) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
            return true;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
            return true;
          }

          if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            const selected = suggestions[selectedIndex];
            if (selected) {
              // Remove the @ and any typed query
              const { state, dispatch } = view;
              const { selection } = state;
              const text = state.doc.textBetween(Math.max(0, selection.from - 20), selection.from);
              const atIndex = text.lastIndexOf('@');

              if (atIndex !== -1) {
                const deleteFrom = selection.from - (text.length - atIndex);
                const tr = state.tr.delete(deleteFrom, selection.from);
                dispatch(tr);

                // Insert the mention
                setTimeout(() => {
                  editor?.chain().focus().insertContent({
                    type: 'mention',
                    attrs: { id: selected.id, label: selected.label }
                  }).insertContent(' ').run();
                }, 0);
              }

              setShowSuggestions(false);
            }
            return true;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            setShowSuggestions(false);
            return true;
          }

          // Filter suggestions as user types
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            const newQuery = suggestionQuery + event.key;
            setSuggestionQuery(newQuery);
            const filtered = getSuggestions(newQuery);
            setSuggestions(filtered);
            setSelectedIndex(0);
          }

          if (event.key === 'Backspace' && suggestionQuery.length > 0) {
            const newQuery = suggestionQuery.slice(0, -1);
            setSuggestionQuery(newQuery);
            const filtered = getSuggestions(newQuery);
            setSuggestions(filtered);
            setSelectedIndex(0);
          }
        }

        return false;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = editor.getHTML();
      const newContent = content || '';

      if (currentContent !== newContent) {
        editor.commands.setContent(newContent, false);
      }
    }
  }, [content, editor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  const insertMention = (item: MentionSuggestion) => {
    if (editor) {
      // Get current selection
      const { state } = editor.view;
      const { selection } = state;

      // Find and remove the @ and query text
      const text = state.doc.textBetween(Math.max(0, selection.from - 20), selection.from);
      const atIndex = text.lastIndexOf('@');

      if (atIndex !== -1) {
        const deleteFrom = selection.from - (text.length - atIndex);
        const tr = state.tr.delete(deleteFrom, selection.from);
        editor.view.dispatch(tr);

        // Insert the mention
        setTimeout(() => {
          editor.chain().focus().insertContent({
            type: 'mention',
            attrs: { id: item.id, label: item.label }
          }).insertContent(' ').run();
        }, 0);
      }

      setShowSuggestions(false);
    }
  };

  if (!editor) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
      </div>
    );
  }

  const MenuButton = ({ onClick, active, disabled, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative">
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* Toolbar */}
        <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 flex flex-wrap gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Code"
          >
            <Code size={18} />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={18} />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </MenuButton>

          {/* Word Count */}
          <div className="ml-auto flex items-center text-sm text-gray-600 dark:text-gray-300 px-3">
            {editor.storage.characterCount.words()} words
          </div>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="fixed z-[9999] bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
            minWidth: '300px',
            maxWidth: '400px'
          }}
        >
          {suggestions.map((item, index) => (
            <button
              key={item.id}
              onClick={() => insertMention(item)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                item.type === 'character'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
                {item.type === 'character' ? 'Character' : 'Location'}
              </span>
              <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
