'use client';

import { useEffect, useState } from 'react';
import { getAllChapters, getAllCharacters, getAllWorldElements, getMetadata } from '@/lib/fileSystem';
import { Chapter, Character, WorldElement, StoryMetadata } from '@/lib/types';

export default function ExportPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldElements, setWorldElements] = useState<WorldElement[]>([]);
  const [metadata, setMetadata] = useState<StoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [includeWorld, setIncludeWorld] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [chaptersRes, charactersRes, worldRes] = await Promise.all([
        fetch('/api/chapters'),
        fetch('/api/characters'),
        fetch('/api/world'),
      ]);

      const chaptersData = await chaptersRes.json();
      const charactersData = await charactersRes.json();
      const worldData = await worldRes.json();

      setChapters(chaptersData);
      setCharacters(charactersData);
      setWorldElements(worldData);

      // Select all chapters by default
      setSelectedChapters(new Set(chaptersData.map((c: Chapter) => c.id)));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (id: string) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedChapters(newSelected);
  };

  const selectAll = () => {
    setSelectedChapters(new Set(chapters.map(c => c.id)));
  };

  const deselectAll = () => {
    setSelectedChapters(new Set());
  };

  const exportAsText = () => {
    let content = '';

    // Add metadata
    content += '=' .repeat(60) + '\n';
    content += 'MY ANIME STORY\n';
    content += '='.repeat(60) + '\n\n';

    // Add selected chapters
    const selectedChaptersList = chapters.filter(c => selectedChapters.has(c.id));
    selectedChaptersList.forEach((chapter, index) => {
      content += `\n${'='.repeat(60)}\n`;
      content += `EPISODE ${chapter.episodeNumber}: ${chapter.title}\n`;
      if (chapter.arc) {
        content += `Arc: ${chapter.arc}\n`;
      }
      content += `${'='.repeat(60)}\n\n`;
      content += chapter.content + '\n\n';
    });

    // Add characters
    if (includeCharacters && characters.length > 0) {
      content += `\n${'='.repeat(60)}\n`;
      content += 'CHARACTERS\n';
      content += `${'='.repeat(60)}\n\n`;

      characters.forEach(char => {
        content += `\n${char.name}`;
        if (char.age) content += ` (Age: ${char.age})`;
        content += '\n';
        content += `Role: ${char.role}\n`;
        if (char.description) content += `Description: ${char.description}\n`;
        if (char.appearance) content += `Appearance: ${char.appearance}\n`;
        if (char.personality) content += `Personality: ${char.personality}\n`;
        if (char.abilities.length > 0) content += `Abilities: ${char.abilities.join(', ')}\n`;
        if (char.backstory) content += `Backstory: ${char.backstory}\n`;
        content += '\n';
      });
    }

    // Add world elements
    if (includeWorld && worldElements.length > 0) {
      content += `\n${'='.repeat(60)}\n`;
      content += 'WORLD BUILDING\n';
      content += `${'='.repeat(60)}\n\n`;

      const groupedElements = worldElements.reduce((acc, el) => {
        if (!acc[el.type]) acc[el.type] = [];
        acc[el.type].push(el);
        return acc;
      }, {} as Record<string, WorldElement[]>);

      Object.entries(groupedElements).forEach(([type, elements]) => {
        content += `\n--- ${type.toUpperCase()} ---\n\n`;
        elements.forEach(el => {
          content += `${el.title}\n`;
          if (el.description) content += `${el.description}\n`;
          if (el.details) content += `${el.details}\n`;
          content += '\n';
        });
      });
    }

    // Download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anime-story.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    let content = '';

    // Add metadata
    content += '# My Anime Story\n\n';

    // Add selected chapters
    const selectedChaptersList = chapters.filter(c => selectedChapters.has(c.id));
    selectedChaptersList.forEach((chapter) => {
      content += `\n## Episode ${chapter.episodeNumber}: ${chapter.title}\n\n`;
      if (chapter.arc) {
        content += `**Arc:** ${chapter.arc}\n\n`;
      }
      content += chapter.content + '\n\n';
      content += '---\n\n';
    });

    // Add characters
    if (includeCharacters && characters.length > 0) {
      content += '\n## Characters\n\n';

      characters.forEach(char => {
        content += `### ${char.name}`;
        if (char.age) content += ` (Age: ${char.age})`;
        content += '\n\n';
        content += `**Role:** ${char.role}\n\n`;
        if (char.description) content += `**Description:** ${char.description}\n\n`;
        if (char.appearance) content += `**Appearance:** ${char.appearance}\n\n`;
        if (char.personality) content += `**Personality:** ${char.personality}\n\n`;
        if (char.abilities.length > 0) content += `**Abilities:** ${char.abilities.join(', ')}\n\n`;
        if (char.backstory) content += `**Backstory:** ${char.backstory}\n\n`;
        content += '---\n\n';
      });
    }

    // Add world elements
    if (includeWorld && worldElements.length > 0) {
      content += '\n## World Building\n\n';

      const groupedElements = worldElements.reduce((acc, el) => {
        if (!acc[el.type]) acc[el.type] = [];
        acc[el.type].push(el);
        return acc;
      }, {} as Record<string, WorldElement[]>);

      Object.entries(groupedElements).forEach(([type, elements]) => {
        content += `\n### ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
        elements.forEach(el => {
          content += `#### ${el.title}\n\n`;
          if (el.description) content += `${el.description}\n\n`;
          if (el.details) content += `${el.details}\n\n`;
        });
      });
    }

    // Download file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anime-story.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const selectedChaptersList = chapters.filter(c => selectedChapters.has(c.id));

    const data = {
      chapters: selectedChaptersList,
      ...(includeCharacters && { characters }),
      ...(includeWorld && { worldElements }),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anime-story.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const selectedCount = selectedChapters.size;
  const totalWords = chapters
    .filter(c => selectedChapters.has(c.id))
    .reduce((sum, c) => sum + c.wordCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Export Story</h1>
        <p className="text-gray-600 dark:text-gray-400">Export your story in various formats</p>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Export Options</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeCharacters"
              checked={includeCharacters}
              onChange={(e) => setIncludeCharacters(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="includeCharacters" className="ml-2 text-gray-700 dark:text-gray-300">
              Include Character Profiles
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeWorld"
              checked={includeWorld}
              onChange={(e) => setIncludeWorld(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="includeWorld" className="ml-2 text-gray-700 dark:text-gray-300">
              Include World Building Elements
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportAsText}
            disabled={selectedCount === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export as Text (.txt)
          </button>
          <button
            onClick={exportAsMarkdown}
            disabled={selectedCount === 0}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export as Markdown (.md)
          </button>
          <button
            onClick={exportAsJSON}
            disabled={selectedCount === 0}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export as JSON (.json)
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              Selected {selectedCount} chapter{selectedCount !== 1 ? 's' : ''} ({totalWords.toLocaleString()} words)
            </p>
          </div>
        )}
      </div>

      {/* Chapter Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Select Chapters</h2>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
            >
              Deselect All
            </button>
          </div>
        </div>

        {chapters.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No chapters available to export. Create some chapters first!
          </p>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedChapters.has(chapter.id)
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedChapters.has(chapter.id)}
                    onChange={() => toggleChapter(chapter.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                      Episode {chapter.episodeNumber}: {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chapter.arc && `Arc: ${chapter.arc} • `}
                      {chapter.wordCount} words
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chapter.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    chapter.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {chapter.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
