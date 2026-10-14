import type { z } from 'zod';

// Turns zod issues into short pt-BR messages with a readable path,
// e.g. "fichas[2].trackers.health.max: deve ser ≤ 12".

const MAX_LISTED_ISSUES = 5;

export function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((text, key) => {
    if (typeof key === 'number') return `${text}[${key}]`;
    const name = String(key);
    return text === '' ? name : `${text}.${name}`;
  }, '');
}

function describeIssue(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case 'too_big':
      return issue.origin === 'array'
        ? `deve ter no máximo ${String(issue.maximum)} itens`
        : `deve ser ≤ ${String(issue.maximum)}`;
    case 'too_small':
      if (issue.origin === 'array') {
        return issue.exact
          ? `deve ter exatamente ${String(issue.minimum)} itens`
          : `deve ter pelo menos ${String(issue.minimum)} itens`;
      }
      return issue.origin === 'string' ? 'não pode ficar vazio' : `deve ser ≥ ${String(issue.minimum)}`;
    case 'invalid_type':
      return `tipo inválido (esperado ${issue.expected})`;
    case 'unrecognized_keys':
      return `campo desconhecido: ${issue.keys.join(', ')}`;
    case 'invalid_value':
      return `valor inválido (esperado ${issue.values.map((value) => JSON.stringify(value)).join(' ou ')})`;
    case 'invalid_union':
      return 'valor inválido';
    default:
      return issue.message;
  }
}

export function formatIssues(issues: readonly z.core.$ZodIssue[]): string {
  const lines = issues.slice(0, MAX_LISTED_ISSUES).map((issue) => {
    const path = formatPath(issue.path);
    return path === '' ? describeIssue(issue) : `${path}: ${describeIssue(issue)}`;
  });
  const hidden = issues.length - lines.length;
  if (hidden > 0) lines.push(`… e mais ${hidden} problema(s).`);
  return lines.join('\n');
}
