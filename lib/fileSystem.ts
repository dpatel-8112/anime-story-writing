import fs from 'fs';
import path from 'path';
import {
  Chapter,
  Character,
  WorldElement,
  StoryMetadata,
  ChapterVersion,
  Scene,
  TimelineEvent,
  WritingGoal,
  Comment,
  Project
} from './types';
import { detectChangeType, calculateContentDiff, hasContentChanged } from './versionHelpers';

const DATA_DIR = path.join(process.cwd(), 'story-data');
const CHAPTERS_DIR = path.join(DATA_DIR, 'chapters');
const CHARACTERS_DIR = path.join(DATA_DIR, 'characters');
const WORLD_DIR = path.join(DATA_DIR, 'world');
const SCENES_DIR = path.join(DATA_DIR, 'scenes');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');
const TIMELINE_FILE = path.join(DATA_DIR, 'timeline.json');
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const PROJECTS_FILE = path.join(process.cwd(), 'projects', 'index.json');

// Ensure directories exist
export function ensureDirectories() {
  const dirs = [
    DATA_DIR,
    CHAPTERS_DIR,
    CHARACTERS_DIR,
    WORLD_DIR,
    SCENES_DIR,
    BACKUPS_DIR,
    path.join(process.cwd(), 'projects')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Chapter operations
export function getAllChapters(): Chapter[] {
  ensureDirectories();
  const files = fs.readdirSync(CHAPTERS_DIR);
  const chapters: Chapter[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(CHAPTERS_DIR, file), 'utf-8');
      chapters.push(JSON.parse(content));
    }
  }

  return chapters.sort((a, b) => a.episodeNumber - b.episodeNumber);
}

export function getChapter(id: string): Chapter | null {
  ensureDirectories();
  const filePath = path.join(CHAPTERS_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function saveChapter(chapter: Chapter): void {
  ensureDirectories();
  const filePath = path.join(CHAPTERS_DIR, `${chapter.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(chapter, null, 2));
  updateMetadata();
}

export function deleteChapter(id: string): void {
  const filePath = path.join(CHAPTERS_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    updateMetadata();
  }
}

// Character operations
export function getAllCharacters(): Character[] {
  ensureDirectories();
  const files = fs.readdirSync(CHARACTERS_DIR);
  const characters: Character[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(CHARACTERS_DIR, file), 'utf-8');
      characters.push(JSON.parse(content));
    }
  }

  return characters.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCharacter(id: string): Character | null {
  ensureDirectories();
  const filePath = path.join(CHARACTERS_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function saveCharacter(character: Character): void {
  ensureDirectories();
  const filePath = path.join(CHARACTERS_DIR, `${character.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(character, null, 2));
}

export function deleteCharacter(id: string): void {
  const filePath = path.join(CHARACTERS_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function updateCharacterAppearances(): void {
  // Scan chapters for @mentions and update character appearances
  const chapters = getAllChapters();
  const characters = getAllCharacters();

  characters.forEach(character => {
    const appearances: string[] = [];
    chapters.forEach(chapter => {
      if (chapter.content.includes(`@${character.name}`)) {
        appearances.push(chapter.id);
      }
    });
    character.appearances = appearances;
    saveCharacter(character);
  });
}

// World building operations
export function getAllWorldElements(): WorldElement[] {
  ensureDirectories();
  const files = fs.readdirSync(WORLD_DIR);
  const elements: WorldElement[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(WORLD_DIR, file), 'utf-8');
      elements.push(JSON.parse(content));
    }
  }

  return elements.sort((a, b) => a.name.localeCompare(b.name));
}

export function getWorldElement(id: string): WorldElement | null {
  ensureDirectories();
  const filePath = path.join(WORLD_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function saveWorldElement(element: WorldElement): void {
  ensureDirectories();
  const filePath = path.join(WORLD_DIR, `${element.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(element, null, 2));
}

export function deleteWorldElement(id: string): void {
  const filePath = path.join(WORLD_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Metadata operations
export function getMetadata(): StoryMetadata {
  ensureDirectories();

  if (!fs.existsSync(METADATA_FILE)) {
    const defaultMetadata: StoryMetadata = {
      title: 'My Anime Story',
      author: '',
      genre: [],
      synopsis: '',
      totalChapters: 0,
      totalWordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(defaultMetadata, null, 2));
    return defaultMetadata;
  }

  const content = fs.readFileSync(METADATA_FILE, 'utf-8');
  return JSON.parse(content);
}

export function saveMetadata(metadata: StoryMetadata): void {
  ensureDirectories();
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

export function updateMetadata(): void {
  const metadata = getMetadata();
  const chapters = getAllChapters();

  metadata.totalChapters = chapters.length;
  metadata.totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  metadata.updatedAt = new Date().toISOString();

  saveMetadata(metadata);
}

// Version management functions
export function createVersion(
  chapter: Chapter,
  note?: string,
  label?: string
): ChapterVersion {
  return {
    id: `v-${Date.now()}`,
    content: chapter.content,
    title: chapter.title,
    wordCount: chapter.wordCount,
    timestamp: new Date().toISOString(),
    note,
    label: label || 'Manual save',
    changedFields: [],
  };
}

export function saveChapterWithVersion(
  chapter: Chapter,
  createVersion: boolean,
  versionNote?: string
): void {
  ensureDirectories();

  // Get existing chapter to create version from
  const existingChapter = getChapter(chapter.id);

  if (createVersion && existingChapter) {
    // Only create version if content actually changed
    if (hasContentChanged(existingChapter, chapter)) {
      // Detect changes
      const { label, changedFields } = detectChangeType(existingChapter, chapter);
      const contentDiff = calculateContentDiff(existingChapter.content, chapter.content);

      const version: ChapterVersion = {
        id: `v-${Date.now()}`,
        content: existingChapter.content,
        title: existingChapter.title,
        wordCount: existingChapter.wordCount,
        timestamp: existingChapter.updatedAt,
        note: versionNote,
        label: versionNote ? 'Manual save' : label,
        changedFields,
        contentDiff,
      };

      // Add version to chapter
      chapter.versions = [...(existingChapter.versions || []), version];
    } else {
      // No changes detected, preserve existing versions
      chapter.versions = existingChapter.versions;
    }
  } else if (existingChapter) {
    // Not creating version, preserve existing versions
    chapter.versions = existingChapter.versions;
  } else {
    // New chapter, initialize empty versions array
    chapter.versions = chapter.versions || [];
  }

  // Save chapter
  const filePath = path.join(CHAPTERS_DIR, `${chapter.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(chapter, null, 2));
  updateMetadata();
}

export function getChapterVersion(
  chapterId: string,
  versionId: string
): ChapterVersion | null {
  const chapter = getChapter(chapterId);
  if (!chapter || !chapter.versions) return null;

  return chapter.versions.find((v) => v.id === versionId) || null;
}

export function restoreVersion(chapterId: string, versionId: string): Chapter | null {
  const chapter = getChapter(chapterId);
  if (!chapter) return null;

  const version = getChapterVersion(chapterId, versionId);
  if (!version) return null;

  // Create a new version before restoring (to save current state)
  const currentVersion: ChapterVersion = {
    id: `v-${Date.now()}`,
    content: chapter.content,
    title: chapter.title,
    wordCount: chapter.wordCount,
    timestamp: chapter.updatedAt,
    label: 'Before restore',
    changedFields: ['content', 'title'],
  };

  // Restore version content
  chapter.content = version.content;
  chapter.title = version.title;
  chapter.wordCount = version.wordCount;
  chapter.updatedAt = new Date().toISOString();
  chapter.versions = [...(chapter.versions || []), currentVersion];

  saveChapter(chapter);
  return chapter;
}

// Scene planning operations
export function getAllScenes(): Scene[] {
  ensureDirectories();
  const files = fs.readdirSync(SCENES_DIR);
  const scenes: Scene[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(SCENES_DIR, file), 'utf-8');
      scenes.push(JSON.parse(content));
    }
  }

  return scenes.sort((a, b) => a.order - b.order);
}

export function getScenesByChapter(chapterId: string): Scene[] {
  const allScenes = getAllScenes();
  return allScenes.filter(scene => scene.chapterId === chapterId).sort((a, b) => a.order - b.order);
}

export function getScene(id: string): Scene | null {
  ensureDirectories();
  const filePath = path.join(SCENES_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function saveScene(scene: Scene): void {
  ensureDirectories();
  const filePath = path.join(SCENES_DIR, `${scene.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(scene, null, 2));
}

export function deleteScene(id: string): void {
  const filePath = path.join(SCENES_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Timeline operations
export function getTimeline(): TimelineEvent[] {
  ensureDirectories();

  if (!fs.existsSync(TIMELINE_FILE)) {
    fs.writeFileSync(TIMELINE_FILE, JSON.stringify([], null, 2));
    return [];
  }

  const content = fs.readFileSync(TIMELINE_FILE, 'utf-8');
  return JSON.parse(content);
}

export function saveTimelineEvent(event: TimelineEvent): void {
  ensureDirectories();
  const events = getTimeline();
  const index = events.findIndex(e => e.id === event.id);

  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }

  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(events, null, 2));
}

export function deleteTimelineEvent(id: string): void {
  const events = getTimeline();
  const filtered = events.filter(e => e.id !== id);
  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(filtered, null, 2));
}

// Goals operations
export function getGoals(): WritingGoal[] {
  ensureDirectories();

  if (!fs.existsSync(GOALS_FILE)) {
    fs.writeFileSync(GOALS_FILE, JSON.stringify([], null, 2));
    return [];
  }

  const content = fs.readFileSync(GOALS_FILE, 'utf-8');
  return JSON.parse(content);
}

export function getAllGoals(): WritingGoal[] {
  return getGoals();
}

export function getGoal(id: string): WritingGoal | null {
  const goals = getGoals();
  return goals.find(g => g.id === id) || null;
}

export function saveGoal(goal: WritingGoal): void {
  ensureDirectories();
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === goal.id);

  if (index >= 0) {
    goals[index] = goal;
  } else {
    goals.push(goal);
  }

  fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2));
}

export function deleteGoal(id: string): void {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  fs.writeFileSync(GOALS_FILE, JSON.stringify(filtered, null, 2));
}

export function updateGoalProgress(): void {
  const goals = getGoals();
  const chapters = getAllChapters();
  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  goals.forEach(goal => {
    if (goal.type === 'word-count') {
      goal.current = totalWords;
      if (goal.current >= goal.target && goal.status === 'active') {
        goal.status = 'completed';
      }
    } else if (goal.type === 'chapter-count') {
      goal.current = chapters.length;
      if (goal.current >= goal.target && goal.status === 'active') {
        goal.status = 'completed';
      }
    }
  });

  fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2));
}

// Comments operations
export function getComments(targetType?: string, targetId?: string): Comment[] {
  ensureDirectories();

  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify([], null, 2));
    return [];
  }

  const content = fs.readFileSync(COMMENTS_FILE, 'utf-8');
  const allComments: Comment[] = JSON.parse(content);

  if (targetType && targetId) {
    return allComments.filter(c => c.targetType === targetType && c.targetId === targetId);
  }

  return allComments;
}

export function saveComment(comment: Comment): void {
  ensureDirectories();
  const comments = getComments();
  const index = comments.findIndex(c => c.id === comment.id);

  if (index >= 0) {
    comments[index] = comment;
  } else {
    comments.push(comment);
  }

  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

export function deleteComment(id: string): void {
  const comments = getComments();
  const filtered = comments.filter(c => c.id !== id);
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(filtered, null, 2));
}

// Backup/Restore operations
export function createBackup(): string {
  ensureDirectories();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}`;
  const backupPath = path.join(BACKUPS_DIR, backupName);

  // Create backup directory
  fs.mkdirSync(backupPath, { recursive: true });

  // Copy all data files
  const filesToBackup = [
    { src: CHAPTERS_DIR, dest: path.join(backupPath, 'chapters') },
    { src: CHARACTERS_DIR, dest: path.join(backupPath, 'characters') },
    { src: WORLD_DIR, dest: path.join(backupPath, 'world') },
    { src: SCENES_DIR, dest: path.join(backupPath, 'scenes') },
    { src: METADATA_FILE, dest: path.join(backupPath, 'metadata.json') },
    { src: TIMELINE_FILE, dest: path.join(backupPath, 'timeline.json') },
    { src: GOALS_FILE, dest: path.join(backupPath, 'goals.json') },
    { src: COMMENTS_FILE, dest: path.join(backupPath, 'comments.json') },
  ];

  filesToBackup.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        const files = fs.readdirSync(src);
        files.forEach(file => {
          fs.copyFileSync(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  });

  return backupPath;
}

export function restoreBackup(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup not found');
  }

  // Restore files
  const filesToRestore = [
    { src: path.join(backupPath, 'chapters'), dest: CHAPTERS_DIR },
    { src: path.join(backupPath, 'characters'), dest: CHARACTERS_DIR },
    { src: path.join(backupPath, 'world'), dest: WORLD_DIR },
    { src: path.join(backupPath, 'scenes'), dest: SCENES_DIR },
    { src: path.join(backupPath, 'metadata.json'), dest: METADATA_FILE },
    { src: path.join(backupPath, 'timeline.json'), dest: TIMELINE_FILE },
    { src: path.join(backupPath, 'goals.json'), dest: GOALS_FILE },
    { src: path.join(backupPath, 'comments.json'), dest: COMMENTS_FILE },
  ];

  filesToRestore.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        // Clear destination and copy
        if (fs.existsSync(dest)) {
          fs.rmSync(dest, { recursive: true });
        }
        fs.mkdirSync(dest, { recursive: true });
        const files = fs.readdirSync(src);
        files.forEach(file => {
          fs.copyFileSync(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  });
}

export function listBackups(): Array<{ path: string; timestamp: string; size: number }> {
  ensureDirectories();

  if (!fs.existsSync(BACKUPS_DIR)) {
    return [];
  }

  const backups = fs.readdirSync(BACKUPS_DIR);
  return backups.map(backup => {
    const backupPath = path.join(BACKUPS_DIR, backup);
    const stats = fs.statSync(backupPath);
    return {
      path: backupPath,
      timestamp: stats.birthtime.toISOString(),
      size: getDirectorySize(backupPath),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getDirectorySize(dirPath: string): number {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });

  return size;
}

// Projects operations
export function getProjects(): Project[] {
  ensureDirectories();

  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2));
    return [];
  }

  const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
  return JSON.parse(content);
}

export function saveProject(project: Project): void {
  ensureDirectories();
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export function deleteProject(id: string): void {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filtered, null, 2));
}
