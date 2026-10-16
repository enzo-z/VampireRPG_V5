import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { hashPassword } from '../features/secrets/password.ts';
import { sha256Hex } from '../features/secrets/sha256.ts';

const nodeSha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

describe('sha256Hex', () => {
  it('matches the standard test vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it.each(['senha', 'Pesadelo de 1999', 'ç'.repeat(40), 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'y'.repeat(1000)])(
    'matches node:crypto for %#',
    (text) => {
      expect(sha256Hex(text)).toBe(nodeSha256(text));
    },
  );
});

describe('hashPassword', () => {
  it('ignores spaces around the password but not case', () => {
    expect(hashPassword('  Sangue ')).toBe(hashPassword('Sangue'));
    expect(hashPassword('sangue')).not.toBe(hashPassword('Sangue'));
  });
});
