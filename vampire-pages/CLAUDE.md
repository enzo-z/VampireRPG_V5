# Vampire Pages

App de apoio ao mestre (Vampire V5): fichas dos jogadores + consulta às notas deste vault.
Este repo também é um vault do Obsidian; o app fica em `vampire-pages/` (Vite + React + TS).

## Regras
- Não ler nem commitar livros/PDFs (`External Documents/`, `vault/bibliografia/`).
- `..\vampire-5e-referencia` é o worktree do Pedro: somente leitura, só consulta.
- Só notas com `publicar: true` no frontmatter aparecem no app.
- Responder em português; código e identificadores em inglês.

## Convenções
- TypeScript estrito, sem `any`; módulos pequenos e coesos.
- Cores, espaçamentos e tipografia via design tokens (CSS variables), nunca valores soltos.
- Dados das fichas em JSON tipado com `schemaVersion`.