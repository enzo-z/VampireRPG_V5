// SHA-256 (FIPS 180-4) in plain TypeScript. The browser's crypto.subtle only exists on
// secure origins (https or localhost), and the app may be opened by LAN IP at the table.

const PRIMES = (count: number): number[] => {
  const primes: number[] = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    if (primes.every((prime) => candidate % prime !== 0)) primes.push(candidate);
  }
  return primes;
};

/** First 32 bits of the fractional part of x. */
const fraction32 = (x: number) => Math.floor((x - Math.floor(x)) * 2 ** 32) >>> 0;

const FIRST_PRIMES = PRIMES(64);
const ROUND_CONSTANTS = FIRST_PRIMES.map((prime) => fraction32(Math.cbrt(prime)));
const INITIAL_HASH = FIRST_PRIMES.slice(0, 8).map((prime) => fraction32(Math.sqrt(prime)));

const rotr = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));

/** Hex SHA-256 of the UTF-8 bytes of `text`. */
export function sha256Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const data = new Uint8Array(paddedLength);
  data.set(bytes);
  data[bytes.length] = 0x80;
  const view = new DataView(data.buffer);
  const bitLength = bytes.length * 8;
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 2 ** 32));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  const hash = [...INITIAL_HASH];
  const words = new Uint32Array(64);
  const word = (index: number) => words[index] ?? 0;
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) words[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(word(i - 15), 7) ^ rotr(word(i - 15), 18) ^ (word(i - 15) >>> 3);
      const s1 = rotr(word(i - 2), 17) ^ rotr(word(i - 2), 19) ^ (word(i - 2) >>> 10);
      words[i] = word(i - 16) + s0 + word(i - 7) + s1;
    }

    let [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0] = hash;
    for (let i = 0; i < 64; i += 1) {
      const sum1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choice + (ROUND_CONSTANTS[i] ?? 0) + word(i)) >>> 0;
      const sum0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    [a, b, c, d, e, f, g, h].forEach((value, index) => {
      hash[index] = ((hash[index] ?? 0) + value) >>> 0;
    });
  }
  return hash.map((value) => value.toString(16).padStart(8, '0')).join('');
}
