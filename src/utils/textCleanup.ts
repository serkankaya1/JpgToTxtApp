export function normalizeWhitespace(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function mergeBrokenLines(text: string): string {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ');
}
