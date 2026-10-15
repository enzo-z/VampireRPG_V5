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
- **C, shell do app**: sidebar (Fichas, Mesa, Vault, Backlog, Raw PDF), Mesa com cards por personagem, sincronização Mesa↔ficha. Vault e Backlog ficam desabilitados no começo.
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
- Catálogos lidos do vault no build: `O Sangue (Vitae)/Disciplinas/*.md`, `Advantages.md`, `Fome, a Caça e a Besta/Predator Type.md` (uma entrada por seção `# Nome`) e `O Sangue (Vitae)/Gerações e Potência.md` (seções de "Lista de Gerações" pelas ordinais do título, a tabela de Blood Potency em markdown e as seções "Blood Potency N"); só com `publicar: true`. Itens listados em `ocultos: [...]` no frontmatter ficam na nota mas saem do app (busca, painel, sugestões e avisos). A ficha casa nomes com tolerância (acento, maiúscula, plural, apelido pt-BR, prefixo, erro de digitação).
- Identidade: Nome, Player, Crônica, Clã, Predator Type, Ambição, Facção, Geração, Desejo.
- Disciplinas têm nome editável (6 slots). Especializações são texto livre, sem placeholder.

## Vocabulário da UI (pt-BR)
Clã, Nome, Facção, Ambição, Desejo, Crônica, Geração, Fome, Humanidade, Saúde, Willpower, Ocultismo, Compulsão de Clã. Mantém em inglês: Animal Handling, Predator Type, Blood Potency, Blood Surge, Mend Amount, Rouse Re-Roll, Bane Severity. Pendente: decidir "Clan Bane" e "Player".

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
