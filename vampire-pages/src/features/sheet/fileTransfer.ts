import { normalizeText } from '../../domain/identityCatalog.ts';

/** "Nina Volkov" → "nina-volkov.json" */
export function jsonFileName(name: string): string {
  const slug = normalizeText(name).replace(/ /g, '-');
  return `${slug === '' ? 'ficha' : slug}.json`;
}

export function downloadText(fileName: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
