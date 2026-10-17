# Vampire Pages

App pessoal do mestre (Enzo) para a one-shot **Auld Sanguine** (VTM V5, 8 jogadores, 2026-10-17): exibir fichas dos jogadores e consultar notas do vault Obsidian. Pasta `vampire-pages/` na raiz do vault `VampireRPG_V5`, branch `ficha-app`.

## Idioma e estilo
- Conversa e UI em português (pt-BR). Código, identificadores, commits e comentários em inglês.
- O dono é engenheiro sênior (C#/.NET). Prefira fundamentos, clean code, tipos explícitos, funções puras testáveis, sem abstração especulativa.
- Mudanças pequenas: um commit/PR por tarefa. Nunca faça merge do fork do Pedro.

## Stack
Vite + React + TypeScript (strict). Testes: Vitest. Validação de dados: zod. Sem backend; persistência em `localStorage`.

## Fontes de verdade (leia antes de codar)
- `vampire-pages/docs/design-spec.md`: tokens de design (tema **claro** por padrão).
- `vampire-pages/docs/prototipos/`: protótipos A, B, C (`.dc.html`), `canvas.json`, `LEIAME.md`. Versionados.
- `vampire-pages/design-refs/`: fichas padrão do V5 (2 e 3 páginas). **Ignorado pelo git** (material do livro); nunca commitar.
- `vampire-pages/docs/INVENTARIO.md`: inventário do que existe no fork do Pedro.
- `CLAUDE.md` da raiz do repo trata do vault; este arquivo trata só do app. Em conflito, vale este dentro de `vampire-pages/`.
- Fork do Pedro (`pedro-seco/vampire-5e`) é só referência. Reaproveitar apenas: (1) o painel explicativo ao clicar em atributo/perícia; (2) algumas páginas do Vault, triadas por nota. Se uma nota do Pedro tiver o mesmo nome de uma do Enzo, vale a do Enzo. Não reaproveitar a diagramação da ficha.

## Os três protótipos (independentes entre si)
- **A, ficha de impressão**: um A4, sem scroll, todos os círculos e caixas visíveis, campos de texto editáveis. Base do PDF/impressão e da view "Raw PDF".
- **B, ficha com painel de referência**: base do app. Modo "olho" (somente leitura, mas o painel explicativo de atributos continua clicável), exportação JSON/PDF.
  - Desde 2026-10-15 a B tem duas páginas em abas fixas no topo: **I · Mecânica** (Attributes, Skills, Disciplines) e **II · Perfil** (Profile com foto 3 × 4, Beliefs, Vantagens e Defeitos, The Blood). Cabeçalho e trackers aparecem nas duas. A página escolhida se mantém ao trocar de ficha. Layout do app é livre para melhorar UX; a impressão (A) precisa de revisão do Enzo.
- **C, shell do app**: sidebar (Fichas, Mesa, Vault, Backlog, Raw PDF), Mesa com cards por personagem, sincronização Mesa↔ficha. Backlog fica desabilitado; o Vault existe desde 2026-10-17 (ver "Vault").
  - Implementado em 2026-10-15: menu lateral recolhível (lembrado por navegador; gaveta no celular) com a Mesa e **todas** as fichas listadas (sem seletor na barra superior); o app abre na Mesa; cartões editam Fome, Saúde, Willpower e Humanidade, e o rótulo Saúde/Willpower abre um modal com máximo e dano. Modo leitura vale para o app inteiro.
  - Decisões do Enzo: nomes de ficha nunca se repetem ("Nina (1)", "Nina (2)", como arquivos copiados) ao criar, renomear, duplicar ou importar; excluir não pede confirmação e oferece "Desfazer"; **não** há "imprimir todas" nem "Raw PDF": a impressão continua ficha por ficha (menu da ficha). A revisão na importação fica para depois.
- Não reimplemente o HTML dos protótipos literalmente: extraia estrutura, comportamento e tokens, e componha em React.

## Modelo dos trackers (regra de domínio, com testes)
- **Saúde / Willpower**: lista de caixas com estado 0 vazio, 1 superficial (barra, carmesim), 2 agravado (preenchido). Os **círculos definem o máximo**: clicar no N-ésimo define max = N; clicar no último preenchido remove um (mínimo 1). Reduzir o máximo **não apaga** o dano guardado no array, apenas oculta.
- Limites: Saúde e Willpower têm cap **12/12 em A, B e C**. A mostra tudo visível; B e C têm lápis (editar máximo, estado em rascunho) e ícone salvar. Visão natural mostra só os círculos preenchidos e as caixas até o máximo.
- **Fome**: guardada como número 0–5, exibida como 5 quadrados binários (clicar no N-ésimo define N; clicar no último cheio reduz um). **Humanidade**: 10 em dois grupos de 5, ciclo 0 → 1 → 2.
- **Decisão que prevalece (2026-10-14)**: os caps 12/12 e a Fome como número valem para o app mesmo que um protótipo diga outra coisa (B e C ainda desenham 20/15; A desenha a Fome como posições independentes). Ao sincronizar os protótipos, não sobrescreva estas duas linhas.
- Padrão inicial: Saúde max 7, Willpower max 5.

## Schema de dados
```
{ schemaVersion: 3, fichas: [ { name, identity, trackers, specs, advantages, beliefs, profile, ... } ] }
```
- `schemaVersion` obrigatório; import valida com zod e rejeita/migra versões desconhecidas, com mensagem clara.
- v2 (2026-10-15) acrescenta `advantages: { category: merit|background|flaw|loresheet, name, level, note }[]`; arquivos v1 migram sozinhos (`src/schema/migrations.ts`).
- v3 (2026-10-15) acrescenta a página 2: `beliefs { chronicleTenets, convictions, touchstones }` e `profile { sire, birthday, age, embraced, apparentAge, description, concept, photo }`. `photo` é data URL JPEG reduzida para 360 × 480 (cabe no `localStorage`); `notes` é o campo Notes da página 2.
- Catálogos lidos do vault no build: `O Sangue (Vitae)/Disciplinas/*.md`, `Advantages.md`, `Fome, a Caça e a Besta/Predator Type.md` (uma entrada por seção `# Nome`) `O Sangue (Vitae)/Clãs.md` (perfis em "# Perfis dos Clãs", cada um com a "Maldição dos X" e a Compulsão "X: Nome" do mesmo clã) `Regras/Cola do Jogador.md` (página 1 da cola impressa: cada `##` é um bloco, cada `###` um verbete; "Para saber mais" fica só no Obsidian) e `O Sangue (Vitae)/Gerações e Potência.md` (seções de "Lista de Gerações" pelas ordinais do título, a tabela de Blood Potency em markdown e as seções "Blood Potency N"); só com `publicar: true`. Itens listados em `ocultos: [...]` no frontmatter ficam na nota mas saem do app (busca, painel, sugestões e avisos). A ficha casa nomes com tolerância (acento, maiúscula, plural, apelido pt-BR, prefixo, erro de digitação).
- Identidade: Nome, Player, Crônica, Clã, Predator Type, Ambição, Facção, Geração, Desejo.
- Disciplinas têm nome editável (6 slots). Especializações são texto livre, sem placeholder.

## Segredos (documentos por jogador)
- Menu "Narrador › Segredos": o que cada personagem sabe, impresso para entregar só ao jogador. Fonte: `Narrador/Relacionamentos/Para o Jogador/README - Nome.md` com `publicar: true` (o Enzo libera um jogador por vez). Ficam de fora: linha de tags, "Sumário", "Mapa de relacionamentos" e qualquer bloco Mermaid. O build avisa se o texto citar "Auld Sanguine" (não pode sair no PDF).
- Senha só de frontend (cortina, não segurança): `SECRETS_PASSWORD` em `vampire-pages/.env.local` (no `.gitignore`); o build guarda só o SHA-256 com sal (`src/features/secrets/password.ts`). Os documentos são um chunk separado, baixado só depois da senha; a liberação dura até fechar a aba.
- PDF em várias folhas A4 (sem zoom; texto ≈ 9,75 pt), rodapé "Nome · p. N de M" via `@page`, título da aba = nome do arquivo salvo.

## Mapa de NY (Narrador)
- Menu "Narrador › Mapa de NY", atrás da **mesma senha** dos Segredos (mostra segredos de mesa); `virtual:ny-map` é um chunk separado, baixado só depois da senha.
- Conteúdo lido no build de `Narrador/Nova York/Mapa de Nova York.md` (`publicar: true`) por `src/catalog/parseNyMap.ts` + `vite/buildNyMap.ts`, validado com zod. Nota fora do formato (facção, camada ou fonte desconhecida, coordenada inválida, `id` repetido, seção faltando) **quebra o build** com o nome da seção. O teste `src/test/nyMapNote.test.ts` roda contra a nota real.
- Contornos, nomes das águas, posição das setas da borda e enquadramentos ficam em `src/features/map/geometry.ts`; funções puras (projeção, camadas, rótulos, escala) em `mapModel.ts`. Cores das facções são tokens `--color-faction-*` e `--color-map-*`.
- Nomes de NPC no mapa seguem `Narrador/Nova York/Elenco de Nova York.md` (fonte de verdade dos NPCs de NY).
- **Tema escuro só no mapa** (decidido em 2026-10-17): controle "Tema: Sistema · Claro · Escuro" (padrão Sistema, lembrado no `localStorage`). A seção do mapa recebe `data-map-theme="dark"` e `tokens.css` redefine ali os tokens semânticos com as primitivas `--palette-night-*`; menu e barra continuam claros. O resto do app segue só com o tema claro.

## Vault (decidido em 2026-10-17)
- Menu "Mesa de jogo › Vault": regras e lore das notas, no tema do app (aberto, sem senha). Entra a nota com `publicar: true` **e** `vault: <grupo do índice>`; `ordem: N` define a ordem de leitura (os grupos seguem a menor ordem de cada um). `ocultos: [Título]` tira seções do app sem tirar do Obsidian (a Camarilla usa isso para o material do Rio).
- Lidas no build só da raiz do vault (notas soltas) e de `Regras/`, `Fome, a Caça e a Besta/`, `O Sangue (Vitae)/` e `Lore/` (`VAULT_SOURCES` em `vite.config.ts`); `Narrador/` nunca entra. `src/catalog/parseVaultNote.ts` limpa a nota (tags, "Sumário", `table-of-contents`, `%%`); `vite/vaultMarkdown.ts` renderiza: `[[Nota#Seção|texto]]` vira link do app se a nota estiver no Vault (senão, só o texto), títulos ganham âncora (`#` da nota vira `h2`), `> 📖 …` vira nota de livro, `<br>` sobrevive em tabelas.
- Imagens e áudio (`![[arquivo]]`, procurados por nome em `Images/` e `Audio/`) entram como assets do Vite; o primeiro embed antes do texto é o banner. **Tabelas que eram imagem do livro foram transcritas em markdown nas notas** (zebra do livro via `--color-surface-tint`); só ilustrações continuam imagem. Página do livro sem conteúdo vira `> 📖 Mais informações … p. N`.
- `virtual:vault` é um chunk separado, baixado ao abrir o Vault. URL no hash (`#/vault/<nota>/<seção>`): links entre notas, voltar do navegador e favoritos funcionam. Busca sem acento por seção (`vaultSearch.ts`).
- Link para seção inexistente ou anexo não encontrado gera aviso; `src/test/vaultNotes.test.ts` roda contra as notas reais e exige zero avisos.

## Vocabulário da UI (pt-BR)
Clã, Nome, Facção, Ambição, Desejo, Crônica, Geração, Fome, Humanidade, Saúde, Willpower, Ocultismo, Compulsão de Clã. Mantém em inglês: Animal Handling, Predator Type, Blood Potency, Blood Surge, Mend Amount, Rouse Re-Roll, Bane Severity, Clan Bane, Player (decidido em 2026-10-15).

## Impressão (A)
- `@media print`, página A4, `print-color-adjust: exact`. Conteúdo alvo ≤ ~1.670 px de altura (A4 sem margens a 96 dpi); com margens de 10 mm, ≤ ~1.720 px. A ficha não pode rolar nem estourar a página; se não couber, avise em vez de comprimir às cegas.
- Moldura com cantos cortados (`clip-path`) e separadores verticais em gradiente; ver `design-spec.md` e o protótipo A.
- Fontes: Cormorant, Bodoni, Cabin. Hospedar localmente ou documentar como carregar.

## Ordem das tarefas
1. Scaffold Vite+React+TS, tokens CSS, fontes.
2. Domínio + store + schema + import/export JSON (zod) + testes dos trackers.
3. Ficha B (painel, olho, lápis/salvar).
4. Ficha A / impressão.
5. Shell C (sidebar, Mesa, sync).
6. Vault (páginas triadas).
Prazo duro: tarefas 1 a 4 funcionando até sexta 2026-10-16.

## Regras de trabalho
- Antes de grandes mudanças, proponha o plano e espere confirmação.
- Rode testes e `tsc --noEmit` antes de dizer que terminou.
- Não commite `workspace.json`, `node_modules`, `dist`, `design-refs/`, nem `.obsidian/plugins/*/data.json` (podem conter chaves de API).
- Não toque nas notas do vault (`*.md` fora de `vampire-pages/`) sem pedir.
