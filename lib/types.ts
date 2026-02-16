export interface Chapter {
  id: string;
  title: string;
  episodeNumber: number;
  arc: string;
  content: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in-progress' | 'completed';
  notes?: string;
  tags?: string[];
  scenes?: Scene[];
  versions?: ChapterVersion[];
}

export interface Character {
  id: string;
  name: string;
  aliases?: string[];
  age?: number;
  description: string;
  appearance: string;
  personality: string;
  abilities?: string[];
  powerLevel?: number;
  relationships: Relationship[];
  backstory: string;
  background?: string;
  goals?: string;
  conflicts?: string;
  appearances?: string[]; // chapter IDs where character appears
  arc?: CharacterArc[];
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  characterId: string;
  type: 'family' | 'friend' | 'rival' | 'enemy' | 'romantic' | 'mentor' | 'other';
  description: string;
  strength: number; // 1-10
}

export interface CharacterArc {
  chapterId: string;
  status: string;
  development: string;
  significance: 'minor' | 'moderate' | 'major';
}

export interface WorldElement {
  id: string;
  name: string;
  type: 'location' | 'organization' | 'item' | 'concept' | 'magic-system';
  description: string;
  significance?: string;
  relatedCharacters?: string[];
  relatedChapters?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryMetadata {
  title: string;
  author: string;
  genre: string[];
  synopsis: string;
  totalChapters: number;
  totalWordCount: number;
  createdAt: string;
  updatedAt: string;
  darkMode?: boolean;
  writingGoal?: number;
  targetDate?: string;
  tags?: string[];
  language?: string;
  targetWordCount?: number;
  coverImage?: string;
  copyright?: string;
}

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  characters: string[];
  location?: string;
  purpose?: string;
  conflictLevel?: number; // 1-10
  order: number;
  status: 'planned' | 'drafted' | 'completed';
  notes?: string;
}

export interface ChapterVersion {
  id: string;
  content: string;
  title: string;
  wordCount: number;
  timestamp: string;
  note?: string;
  label: string;
  changedFields?: string[];
  contentDiff?: {
    added: number;
    removed: number;
  };
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  chapterId?: string;
  type: 'setup' | 'conflict' | 'climax' | 'resolution';
  completed: boolean;
}

export interface WritingStats {
  date: string;
  wordCount: number;
  chaptersEdited: number;
  timeSpent?: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string; // In-story date/time
  chapterId?: string;
  characters: string[];
  location?: string;
  significance: 'minor' | 'moderate' | 'major' | 'critical';
  category: 'plot' | 'character' | 'world' | 'backstory';
}

export interface WritingGoal {
  id: string;
  type: 'word-count' | 'chapter-count' | 'custom';
  title: string;
  description?: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'one-time';
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  targetType: 'chapter' | 'character' | 'world' | 'scene';
  targetId: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  lastOpened: string;
  favorite: boolean;
}

export interface ExportSettings {
  format: 'pdf' | 'epub' | 'markdown' | 'html' | 'docx';
  chapters: 'all' | 'range' | 'specific';
  chapterIds?: string[];
  chapterRange?: { start: number; end: number };
  includeTOC: boolean;
  includeChapterNumbers: boolean;
  includeCharacterGlossary: boolean;
  includeWorldGlossary: boolean;
  includeCoverPage: boolean;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  pageSize?: 'A4' | 'Letter' | 'A5';
}
