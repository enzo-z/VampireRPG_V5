// Ficha names are unique: a repeated name gets " (1)", " (2)"… like copied files.

const SUFFIX = /^(.*?) \((\d+)\)$/;

const nameKey = (name: string) => name.trim().toLocaleLowerCase('pt-BR');

/** `name` if no other ficha uses it (ignoring case and outer spaces), else the first free "name (n)". */
export function uniqueName(name: string, taken: Iterable<string>): string {
  const wanted = name.trim();
  const used = new Set([...taken].map(nameKey));
  if (!used.has(nameKey(wanted))) return wanted;
  const base = SUFFIX.exec(wanted)?.[1] ?? wanted;
  for (let copy = 1; ; copy += 1) {
    const candidate = `${base} (${copy})`;
    if (!used.has(nameKey(candidate))) return candidate;
  }
}
