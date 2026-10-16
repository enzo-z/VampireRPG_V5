# Handoff — Vampire Pages (2026-10-15)

Continuação de uma sessão longa do Claude Code. Leia este arquivo, depois `CLAUDE.md` (raiz do vault) e `vampire-pages/CLAUDE.md`, que têm as regras do projeto. Responda em português; código, identificadores e commits em inglês.

## Contexto
- **Vampire Pages**: app do mestre (Enzo) para a one-shot de VtM V5 **Auld Sanguine**, 8 jogadores iniciantes, **sábado 2026-10-17**. Vite + React 19 + TypeScript strict + zod + Vitest, sem backend (`localStorage`).
- O repo é também um vault do Obsidian (`VampireRPG_V5`); o app fica em `vampire-pages/`. Branch **`ficha-app`** (main é `main`). Último commit: `58f774b feat: printable player's cheat sheet, page 1`. Nada foi enviado ao remoto (sem push).
- `..\vampire-5e-referencia` é o worktree do Pedro: **somente leitura**, só consulta.

## Regras que o Enzo reforçou ao longo da sessão
- Não ler nem commitar livros/PDFs (`External Documents/`, `vault/bibliografia/`, `design-refs/`).
- Só mexer em notas do vault (`*.md` fora de `vampire-pages/`) quando ele pedir. Ao editar, **manter a marcação "texto do app do Pedro"** (indica origem, não falta de revisão).
- Commitar só quando ele pedir; vault e app em commits separados (`vault: …` / `feat: …`), com a linha `Co-Authored-By` do sistema.
- No **app**, Claude pode decidir layout e UX à vontade. Na **impressão** (ficha impressa e cola), o Enzo sempre revisa: mostre o PDF renderizado antes de dar por pronto.
- Vocabulário: Clan Bane, Player, Predator Type, Blood Potency, Blood Surge, Mend Amount ficam em inglês. "Sangue Ralo" = Thin-Bloods.
- Design tokens (CSS variables) sempre; há um teste (`noRawColors.test.ts`) que barra cores soltas. Fonte mínima impressa: 7 pt.
- `vampire-pages/docs/players/` (PDFs/JSONs dos jogadores) e `docs/prototipos/prompt-vantagens-defeitos.md` **não são versionados** (estão untracked de propósito).

## O que existe hoje (resumo)
- **Shell**: menu lateral recolhível (`src/app/Sidebar.tsx`), app abre na **Mesa** (cards por personagem com trackers), fichas listadas no menu, menu ⋯ por ficha (`FichaActions.tsx`: Exportar JSON/PDF, Duplicar, Excluir com Desfazer), nomes únicos (`src/domain/names.ts`).
- **Ficha** em duas abas (I · Mecânica, II · Perfil), modo leitura (olho), painel de referência clicável. Schema v3 (`src/schema/`).
- **Impressão da ficha** (`src/features/print/`): 2 páginas A4, aviso de transbordo por caixa (`fit.ts` → `overflowingFields`, atributo `data-fit-label`), escala compartilhada em `printScale.module.css`, geometria em `printLayout.ts`.
- **Catálogos do vault** lidos no build (`vite/vaultModulePlugin.ts` + `vite/build*.ts` + `src/catalog/parse*.ts` + teste de contrato em `src/test/*Note.test.ts`): Disciplinas, Advantages, Predator Type, Gerações/Blood Potency, Clãs e agora a **Cola**.
- **Destaque de testes** no texto (`src/reference/highlightRolls.ts`): "Atributo + Perícia", Rouse Check, Dificuldade.

## Cola do jogador (trabalho mais recente)
- **Página 1 (comum a todos) está pronta e commitada.** Texto em `Regras/Cola do Jogador.md` (`publicar: true`, `tipo: cola`): cada `##` vira um bloco, cada `###` um verbete; "Para saber mais" fica só no Obsidian. Títulos podem ter complemento ("Willpower (importante)") — `src/catalog/cola.ts` casa por prefixo.
- Código em `src/features/cola/`: `ColaView` (tela cheia, Voltar/Imprimir, aviso de transbordo), `ColaPage` (A4 fixa: colunas esquerda = Como rolar, Lendo os dados + painel, Fome; direita = Rouse Check, Willpower, Blood Surge, Curar, Humanidade; faixa de Termos e Clãs em 3 colunas), `DicePanel` + `D10` (d10 em SVG, preto/vermelho).
- A folha está **justa**: ~25–33 px de folga por coluna na tela. Qualquer frase a mais na nota provavelmente aciona o aviso; aí é encurtar texto ou ajustar layout.
- Clãs na nota estão ordenados do centro da Camarilla para fora, com contexto para um jogador iniciante da Camarilla (texto escrito pelo Claude a partir de `O Sangue (Vitae)/Clãs.md`; vale o Enzo revisar os clãs da mesa: Toreador, Tzimisce, Banu Haqim, Brujah, Gangrel, Ravnos).

## Próximo passo combinado
**Cola, página 2: específica de cada jogador**, começando pelo **Gideon**. Ideia: abrir pelo menu ⋯ da ficha (`FichaActions.tsx`), mesma estrutura de página A4 da cola, focada no personagem (disciplinas e poderes com o que rolar, Clan Bane e Compulsão do clã, Predator Type, trackers etc.). **Propor o plano ao Enzo antes de codar** (regra do projeto para mudanças grandes).

## Pendências abertas
- **Gideon** (`docs/players/fichas/gideon.json`): confirmar com o Enzo se a perícia é Occult ou Streetwise.
- **Vincent** (`docs/players/fichas/vincent.json`): há uma nota REVISAR sobre os níveis de Sect War Veteran, a conferir com a história do jogador.
- **Outras fichas** (Nina, Khalid, Daniel, Jesse, Gusman) ainda não foram convertidas de `docs/players/fichas-originais/`; o Enzo pediu foco só em Vincent e Gideon por enquanto. Cuidado: os PDFs têm salvamentos incrementais; o leitor de campos que funcionou foi um script Python que pega o valor mais recente de cada campo (o Read tool mostrou valores antigos do Gideon).
- **Revisão na importação** de fichas (modal): adiada.
- Talvez colocar `docs/players/` e o prompt no `.gitignore` (oferecido, sem resposta).

## Como verificar
- `cd vampire-pages && npm run check` (tsc + vitest, 252 testes) e `npm run build`.
- E2E com playwright-core + Edge em `%TEMP%\vp-e2e` (**fora do repo, pode sumir**): `run.ps1 -Script check-cola.mjs` sobe o vite na porta 5197, roda o script e derruba o servidor. Scripts: `check-cola`, `check-mesa`, `check-sheet`, `check-print`, `check-pages`, `check-catalog`, `check-advantages`, `check-predator`, `check-blood`, `check-clans`, `check-rolls`; `measure-cola.mjs` mostra a folga de cada coluna da cola. Os PDFs saem em `%TEMP%\vp-e2e\shots\` (renderizar com `pdftoppm` para revisar).
- O app abre na Mesa; scripts que precisam da ficha abrem a primeira pelo menu.
