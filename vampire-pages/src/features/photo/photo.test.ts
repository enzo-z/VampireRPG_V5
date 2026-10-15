import { describe, expect, it } from 'vitest';
import { PHOTO_MAX_BYTES, photoProblem } from './photo.ts';

describe('photoProblem', () => {
  it('accepts JPEG, PNG and WebP up to the size limit', () => {
    expect(photoProblem({ type: 'image/jpeg', size: PHOTO_MAX_BYTES })).toBeNull();
    expect(photoProblem({ type: 'image/png', size: 1024 })).toBeNull();
    expect(photoProblem({ type: 'image/webp', size: 1024 })).toBeNull();
  });

  it('refuses other file types', () => {
    expect(photoProblem({ type: 'image/gif', size: 1024 })).toBe('Escolha uma foto JPEG (PNG e WebP também servem).');
    expect(photoProblem({ type: 'application/pdf', size: 1024 })).not.toBeNull();
  });

  it('refuses files over the limit, saying how big they are', () => {
    expect(photoProblem({ type: 'image/jpeg', size: 12.5 * 1024 * 1024 })).toBe('Foto grande demais (12,5 MB); o limite é 8 MB.');
  });
});
