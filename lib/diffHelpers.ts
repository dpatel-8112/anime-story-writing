export function stripHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  }
  // Server-side fallback: simple regex strip
  return html.replace(/<[^>]*>/g, '');
}

export function calculateSimilarity(oldContent: string, newContent: string): number {
  const oldText = stripHtml(oldContent);
  const newText = stripHtml(newContent);

  const totalLength = Math.max(oldText.length, newText.length);
  if (totalLength === 0) return 100;

  // Simple character-based similarity
  let matches = 0;
  const minLength = Math.min(oldText.length, newText.length);

  for (let i = 0; i < minLength; i++) {
    if (oldText[i] === newText[i]) {
      matches++;
    }
  }

  return Math.round((matches / totalLength) * 100);
}
