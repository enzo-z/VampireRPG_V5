import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Colors must come from design tokens: raw values are allowed only in tokens.css.
const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));
const TOKENS_FILE = join('styles', 'tokens.css');
const SCANNED_EXTENSIONS = new Set(['.css', '.ts', '.tsx']);

const CSS_RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;
// In TS/TSX only string contents matter; this avoids matching private fields such as `#cache`.
const TS_RAW_COLOR = /['"`][^'"`\n]*(?:#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\()/;

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return SCANNED_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  });
}

function findRawColors(file: string): string[] {
  const pattern = extname(file) === '.css' ? CSS_RAW_COLOR : TS_RAW_COLOR;
  return readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((line, index) => (pattern.test(line) ? [`${index + 1}: ${line.trim()}`] : []));
}

describe('design tokens', () => {
  it('keeps raw color values out of every file except tokens.css', () => {
    const violations = listSourceFiles(SRC_DIR)
      .filter((file) => relative(SRC_DIR, file) !== TOKENS_FILE && !file.endsWith('.test.ts'))
      .flatMap((file) => findRawColors(file).map((hit) => `${relative(SRC_DIR, file)}:${hit}`));

    expect(violations).toEqual([]);
  });
});
