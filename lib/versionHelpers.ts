import { Chapter } from './types';

export function detectChangeType(
  oldChapter: Chapter,
  newChapter: Chapter
): { label: string; changedFields: string[] } {
  const changedFields: string[] = [];

  if (oldChapter.title !== newChapter.title) changedFields.push('title');
  if (oldChapter.content !== newChapter.content) changedFields.push('content');

  // Calculate word difference
  const oldWordCount = oldChapter.wordCount;
  const newWordCount = newChapter.wordCount;
  const wordDiff = Math.abs(newWordCount - oldWordCount);
  const percentChange = oldWordCount > 0 ? (wordDiff / oldWordCount) * 100 : 100;

  // Determine label based on changes
  let label = 'Manual save';

  if (changedFields.includes('title') && changedFields.includes('content')) {
    label = 'Title and content changed';
  } else if (changedFields.includes('title')) {
    label = 'Title changed';
  } else if (changedFields.includes('content')) {
    if (percentChange > 20) {
      label = 'Major edit';
    } else if (percentChange > 5) {
      label = 'Moderate edit';
    } else {
      label = 'Minor edit';
    }
  }

  return { label, changedFields };
}

export function calculateContentDiff(
  oldContent: string,
  newContent: string
): { added: number; removed: number } {
  // Strip HTML and get text
  const stripHtml = (html: string) => {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || '';
    }
    // Server-side fallback: simple regex strip
    return html.replace(/<[^>]*>/g, '');
  };

  const oldText = stripHtml(oldContent);
  const newText = stripHtml(newContent);

  const oldWords = oldText.trim().split(/\s+/).filter((w) => w.length > 0);
  const newWords = newText.trim().split(/\s+/).filter((w) => w.length > 0);

  // Simple word-based diff
  const added = Math.max(0, newWords.length - oldWords.length);
  const removed = Math.max(0, oldWords.length - newWords.length);

  return { added, removed };
}

export function hasContentChanged(oldChapter: Chapter, newChapter: Chapter): boolean {
  return oldChapter.content !== newChapter.content || oldChapter.title !== newChapter.title;
}
