import Fuse from 'fuse.js';
import { Chapter, Character, WorldElement, Scene } from './types';
import {
  getAllChapters,
  getAllCharacters,
  getAllWorldElements,
  getAllScenes
} from './fileSystem';

export interface SearchResults {
  chapters: Chapter[];
  characters: Character[];
  worldElements: WorldElement[];
  scenes: Scene[];
}

export function searchAll(query: string): SearchResults {
  if (!query || query.trim() === '') {
    return {
      chapters: [],
      characters: [],
      worldElements: [],
      scenes: [],
    };
  }

  // Get all data
  const chapters = getAllChapters();
  const characters = getAllCharacters();
  const worldElements = getAllWorldElements();
  const scenes = getAllScenes();

  // Configure Fuse.js for fuzzy search
  const chapterFuse = new Fuse(chapters, {
    keys: ['title', 'content', 'arc', 'notes', 'tags'],
    threshold: 0.3, // Lower = more strict matching
    includeScore: true,
  });

  const characterFuse = new Fuse(characters, {
    keys: ['name', 'description', 'appearance', 'personality', 'backstory', 'goals', 'conflicts', 'tags'],
    threshold: 0.3,
    includeScore: true,
  });

  const worldFuse = new Fuse(worldElements, {
    keys: ['name', 'description', 'significance', 'tags'],
    threshold: 0.3,
    includeScore: true,
  });

  const sceneFuse = new Fuse(scenes, {
    keys: ['title', 'description', 'purpose', 'notes'],
    threshold: 0.3,
    includeScore: true,
  });

  // Perform searches
  const chapterResults = chapterFuse.search(query).map(result => result.item);
  const characterResults = characterFuse.search(query).map(result => result.item);
  const worldResults = worldFuse.search(query).map(result => result.item);
  const sceneResults = sceneFuse.search(query).map(result => result.item);

  return {
    chapters: chapterResults,
    characters: characterResults,
    worldElements: worldResults,
    scenes: sceneResults,
  };
}

export function filterByTags<T extends { tags?: string[] }>(
  items: T[],
  tags: string[]
): T[] {
  if (!tags || tags.length === 0) {
    return items;
  }

  return items.filter(item => {
    if (!item.tags || item.tags.length === 0) {
      return false;
    }

    // Check if item has at least one of the specified tags
    return tags.some(tag => item.tags?.includes(tag));
  });
}

export function searchByType(
  query: string,
  type: 'chapters' | 'characters' | 'world' | 'scenes'
): Chapter[] | Character[] | WorldElement[] | Scene[] {
  const results = searchAll(query);
  return results[type];
}

export function advancedSearch(options: {
  query?: string;
  tags?: string[];
  type?: 'chapters' | 'characters' | 'world' | 'scenes' | 'all';
  sortBy?: 'relevance' | 'date' | 'alphabetical';
}): SearchResults {
  const { query = '', tags = [], type = 'all', sortBy = 'relevance' } = options;

  let results: SearchResults;

  // Get filtered results
  if (query) {
    results = searchAll(query);
  } else {
    results = {
      chapters: getAllChapters(),
      characters: getAllCharacters(),
      worldElements: getAllWorldElements(),
      scenes: getAllScenes(),
    };
  }

  // Apply tag filters
  if (tags.length > 0) {
    results.chapters = filterByTags(results.chapters, tags);
    results.characters = filterByTags(results.characters, tags);
    results.worldElements = filterByTags(results.worldElements, tags);
    // Scenes don't have tags, so skip
  }

  // Filter by type if specified
  if (type !== 'all') {
    const emptyResults: SearchResults = {
      chapters: [],
      characters: [],
      worldElements: [],
      scenes: [],
    };

    switch (type) {
      case 'chapters':
        return { ...emptyResults, chapters: results.chapters };
      case 'characters':
        return { ...emptyResults, characters: results.characters };
      case 'world':
        return { ...emptyResults, worldElements: results.worldElements };
      case 'scenes':
        return { ...emptyResults, scenes: results.scenes };
    }
  }

  // Apply sorting
  if (sortBy === 'date') {
    results.chapters.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    results.characters.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    results.worldElements.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } else if (sortBy === 'alphabetical') {
    results.chapters.sort((a, b) => a.title.localeCompare(b.title));
    results.characters.sort((a, b) => a.name.localeCompare(b.name));
    results.worldElements.sort((a, b) => a.name.localeCompare(b.name));
    results.scenes.sort((a, b) => a.title.localeCompare(b.title));
  }

  return results;
}
