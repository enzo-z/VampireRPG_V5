# Inventário de `vampire-5e-referencia/src` para reaproveitamento no app do mestre

> Gerado em 2026-10-13 pelo subagente Explore (somente leitura), sobre o worktree `..\vampire-5e-referencia` no commit `40b41bf`.

Convenções: caminhos relativos à raiz do repo. Tudo o que não estiver marcado **[inferência]** foi confirmado lendo o código. Nada foi executado (sem `build`, `tsc`, `lint` ou `dev`) e nenhum arquivo foi alterado. A lista do que foi lido só em parte está no fim.

## Resumo executivo

- **Localização real do código**: o app fica em `src/app/`, não direto em `src/`. `package.json`, `vite.config.ts`, `scripts/`, `tsconfig*.json` e `index.html` ficam em `src/`, não na raiz do repo. A raiz tem só `CLAUDE.md`, `README.md`, `LICENSE`, `.github/`, `.obsidian/`, `vault/` e `src/`.
- **Stack** (`src/package.json`): React `^19.2.8`, react-dom `^19.2.8`, Vite `^8.2.0`, `@vitejs/plugin-react` `^6.0.4`, TypeScript `~6.0.2`, `marked` `^18.0.14` (devDependency, só no build), oxlint `^1.75.0`, `@types/node` `^24.13.3`. Sem router, sem lib de estado, sem lib de UI/CSS, sem testes.
- **TypeScript**: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax` (`src/tsconfig.app.json:16-20`). Não usa `noUncheckedIndexedAccess`. Nenhum `any` explícito em `src/`.
- **Arquitetura**: SPA de página única. `App.tsx` monta `CharacterProvider` > `ConfirmProvider` > `Nav` + 4 abas sempre montadas (ocultas por CSS) + aba Vault lazy + `PrintSheets` fora da tela.
- **Estado**: um `useState` em `CharacterContext` guarda todos os personagens, mas expõe só o ativo. Persistência em `localStorage['vtm5e']`.
- **Vault**: plugin Vite próprio converte `.md` em HTML no build e expõe três módulos virtuais; não há arquivo gerado em disco.
- **Multi-ficha**: o store guarda N personagens, mas toda a UI lê "o personagem ativo" via `useCharacter()`. Não há visão de lista nem operação por id.
- **Khalil**: o acoplamento está concentrado em `data/defaultCharacter.ts` e nos dois pontos que o semeiam (`context/storage.ts:22-27`, `context/characterStore.ts:53-55`). O grep não achou o nome em `ankh/`, `components/`, `print/`, `tabs/` nem `vault/`.
- **Licença**: `LICENSE` na raiz é GPL v3 (só o cabeçalho foi lido). Copiar código para um app distribuído pode implicar obrigações da GPL **[inferência; confirmar com o autor]**.
- **Direito autoral**: cerca de 470 KB de texto de regras traduzido, com citação de página, estão embutidos no bundle inicial e republicados como páginas de catálogo. O deploy é GitHub Pages (`.github/workflows/deploy.yml`).
- **Contexto do diretório**: o arquivo `.git` aponta para `VampireRPG_V5/.git/worktrees/vampire-5e-referencia` e o remote é `enzo-z/VampireRPG_V5`. É um worktree deste mesmo repo, em HEAD destacado no commit `40b41bf` (autor Pedro, 2026-10-12).

## Tabela-síntese

| Módulo | Classificação | Motivo em uma linha |
| --- | --- | --- |
| `app/types` | ADAPTAR | Schema `Character` é boa base, mas não tem versão, mistura tipos mortos e o `Store` persistido é frágil. |
| `app/context` | ADAPTAR | Funções puras do store servem; persistência, import e API "só o ativo" precisam ser refeitos. |
| `app/data` | Heterogêneo | `powerCatalog.ts` reutilizável; JSONs têm boa estrutura mas conteúdo de livro; `defaultCharacter.ts` é o Khalil. |
| `scripts/` + `vite.config.ts` | ADAPTAR | Pipeline enxuto e fail-closed; parser de frontmatter caseiro, HTML sem sanitização, "narrador" não é controle de acesso. |
| `app/ankh` | Heterogêneo | Janelas, referências, trackers e dots servem; palco, geometria e fundos são arte de ficha única. |
| `app/components` | Heterogêneo | `shared/` pequeno e útil; modais e Nav sem acessibilidade; `manual/` é específico do app antigo. |
| `app/print` | ADAPTAR / DESCARTAR | `FitPage` e `printParts` servem; `MechanicsSheet` depende do layout do ankh e imprime só o ativo. |
| `app/tabs` | DESCARTAR | Wrappers finos; `RefTab` é resumo de regras hardcoded em JSX. |
| `app/vault` | REUTILIZAR / ADAPTAR | `route.ts` e `highlight.ts` prontos; `VaultTab` é monolítico e usa `innerHTML`. |
| `App.tsx`, `main.tsx`, `sheet.css`, `index.html` | ADAPTAR / DESCARTAR | Shell específico; `sheet.css` tem cerca de metade das classes sem uso. |

---

## Prioridade 1: janelas de detalhe

Arquivos: `src/app/ankh/references.ts`, `DetailWindows.tsx`, `AnchoredWindow.tsx`, `useSheetDialogs.tsx`, `coreSkills.ts`, `coreAttributes.ts`, `coreAdvantages.ts`, mais `predators.ts`, `DesktopSheet.tsx` e `MobileSheet.tsx`.

### Fluxo de uma referência até virar janela

1. **Gatilho**: itens de `SheetItems.tsx` renderizam `<button aria-pressed>` (`TraitLabel` em `:37-44`, `SkillItem` em `:84`, `PowerItem` em `:231`, `RitualItem` em `:206`) e chamam `onSelect`.
2. **Estado**: `useState<Selection | null>` local em `DesktopSheet.tsx:45` e, duplicado, em `MobileSheet.tsx:143`. `toggle` (`DesktopSheet.tsx:48`) fecha se o item já está selecionado e substitui caso contrário.
3. **Tipo `Selection`** (`useSheetDialogs.tsx:8-15`), união discriminada por `kind`:
   - `skill` → `{ skill: SkillKey }`
   - `power` → `{ discipline: string; power: string }`
   - `ritual` → `{ discipline: string; ritual: string }`
   - `attribute` → `{ attribute: keyof Attributes }`
   - `predator` → sem payload (lê `character.predatorType`)
   - `advantage` → `{ list: 'advantage' | 'flaw'; index: number }`
   - `pool-form` → `{ index?: number }` (é um formulário, não uma referência)
4. **Resolução para componente**: cadeia `if/else` por `selection.kind` em `DesktopSheet.tsx:151-203`, repetida em `MobileSheet.tsx:154-178`. Cada ramo instancia um `*Window` de `DetailWindows.tsx` com props primitivas (chave ou nome, mais valores atuais da ficha).
5. **Resolução para dados**: cada `*Window` chama, durante o render, uma função de `references.ts`:

| Função | Fonte | Retorno | Fallback |
| --- | --- | --- | --- |
| `skillReference` (`:25`) | `CORE_SKILLS[skill]` | `SkillText {source, body, levels[], specialties}` | nenhum (Record total) |
| `attributeReference` (`:82`) | `CORE_ATTRIBUTES[attr]` | `AttributeText {source, body, levels[]}` | nenhum |
| `powerReference` (`:33`) | `findPower` em `data/powerCatalog.ts:77` | `PowerReference {title, subtitle, source, body, facts[{label,value}], system}` | objeto placeholder (`:35`) |
| `ritualReference` (`:53`) | `findRitual` (`powerCatalog.ts:83`) | `PowerReference` | placeholder (`:55`) |
| `predatorReference` (`:86`) | `PREDATOR_TEXTS[name]` | `PredatorText {source, body, details[]}` | placeholder (`:87`) |
| `advantageReference` (`:90`) | `CORE_ADVANTAGES[name]`, depois `advantages.json` | `AdvantageReference {kind, source, body, levels[]}` | placeholder (`:94-100`) |

6. **Moldura**: `WindowFrame` (`DetailWindows.tsx:16-26`) é um `<section aria-label>` com `<h2>` e botão `×` (`aria-label="Fechar"`).

### Contrato de dados e seus pontos fracos

- **Chave por nome de exibição**: poderes, rituais, vantagens e predator types são buscados pela string do nome, não por id estável. `findPower` normaliza com `trim().toLowerCase()` e, se não achar na disciplina, procura em qualquer disciplina (`powerCatalog.ts:79-80`).
- **Quatro formatos de retorno diferentes**, um por tipo de janela. Não existe um tipo "referência" comum.
- **Vantagem por índice de lista**: `{list, index}` aponta para uma posição, não para a entrada.
- **Arquivos `core*.ts`**: `CORE_SKILLS: Record<SkillKey, SkillText>` (27 entradas), `CORE_ATTRIBUTES: Record<keyof Attributes, AttributeText>` (9), `CORE_ADVANTAGES: Record<string, CoreAdvantage>` (cerca de 84, contadas por regex). Todos têm `source` no formato `'CORE · P. nnn'` e texto em PT-BR. `predators.ts` (cerca de 16) e `clanTraits.ts` (cerca de 16, `{bane, compulsion}` com `{name, text}`) seguem o mesmo padrão.
- **Rótulos hardcoded**, misturando PT e EN: `references.ts:43-47` e `:63-69`, `DetailWindows.tsx:49, 51, 75, 159, 160`; `'DADOS DA FICHA'` em `references.ts:97`.
- **Nome enganoso**: `useSheetDialogs.tsx` guarda três coisas distintas: o tipo `Selection`, os predicados `is*Selected` (`:19-37`) e o hook dos modais de "adicionar" (`:39-59`). O hook devolve `{dialogs, addDiscipline, addPower, addRitual, addAdvantage}`; `dialogs` é um `ReactNode` que a ficha precisa renderizar, e os modais gravam direto via `useCharacter().update`.

### Posicionamento e ancoragem

- **Só no desktop**. A âncora não é o elemento DOM do gatilho: é uma coordenada calculada do layout.
- Enquanto monta as colunas com `createColumn` (`layout.ts:42-54`), `DesktopSheet` grava o `top` de cada linha em mapas: `attributeRowTops` (`:51`), `skillRowTops` (`:84`), `powerRowTops`, `ritualRowTops`, `advantageRowTops` (`:95-97`), `predatorRowTop` (`:63`), `poolsTop` (`:139`).
- `left` é uma de duas constantes: `SKILL_WINDOW_LEFT = 32` para perícia e atributo, `SIDE_WINDOW_LEFT = 1116` para o resto (`DesktopSheet.tsx:29-30`).
- `AnchoredWindow` (`AnchoredWindow.tsx`) recebe `{anchorTop, left, stageHeight, scale, children}` e renderiza `div.ankh-window-slot` absoluto dentro do palco:
  - `visibleStageRange` (`:18-25`) usa `slot.parentElement.getBoundingClientRect()`, `document.querySelector('.tabnav')` e `window.innerHeight`, tudo dividido por `scale`.
  - `place` (`:31-44`) limita o topo entre o topo visível (mínimo 80) e o piso visível (máximo `stageHeight - 30`), com `maxHeight` mínimo de 240 e deslocamento de 18 px acima da linha.
  - Recalcula em mount ou mudança de props, em `ResizeObserver` do primeiro filho e em `resize` da janela (`:46-56`). Não recalcula em scroll.
- Largura fixa de 292 px em unidades do palco (`ankh.css:476, 490`). O palco tem 1440 px e é reduzido por `transform: scale()`.
- **Mobile**: sem ancoragem. `div.ankh-drawer` fixo no rodapé, `max-height: 72vh` (`ankh.css:915-924`, `MobileSheet.tsx:320`).

### Empilhamento

- **Uma janela por vez**. O estado é um único `Selection | null`; não há pilha, lista nem gerenciador.
- `key={JSON.stringify(selection)}` remonta o `AnchoredWindow` a cada troca (`DesktopSheet.tsx:233`).
- z-index: janela 5 dentro do palco, que tem `isolation: isolate` (`ankh.css:30-31, 475, 489`); `AppearanceControls` 4 (`:648`); gaveta mobile 60 (`:920`); nav 100; modal 400; confirm e drawer da nav 500 (`sheet.css:47, 57, 100, 1175, 1224`).

### Foco e teclado

- **Não há tratamento nenhum**. O foco não vai para a janela ao abrir, não volta ao gatilho ao fechar, não há trap, não há `role="dialog"` nem `aria-modal`.
- Não há handler de `Escape`. O único `onKeyDown` do código inteiro está em `components/shared/SearchDropdown.tsx:40`, e só fecha a lista de resultados.
- A janela é renderizada depois de todas as linhas e trackers (`DesktopSheet.tsx:232`), então pelo teclado ela fica no fim da ordem de tabulação.
- Pontos positivos: gatilhos são `<button aria-pressed>`, o botão de fechar tem área mínima de 44×44 (`ankh.css:520-522`), há `:focus-visible` em `.ankh-link` (`ankh.css:185`).

### Fechamento

- Botão `×`, clique no mesmo gatilho, ou seleção de outro item. `PoolForm` fecha ao salvar ou cancelar (`pools.tsx:29, 76`).
- Não fecha por clique fora nem por `Escape`. No mobile não há overlay atrás da gaveta.

### Bugs prováveis

- **Seleção sobrevive à troca de personagem**: `DesktopSheet` não é remontado por `character.id`. Uma seleção `{kind:'advantage', index}` passa a mostrar a vantagem de mesmo índice do outro personagem, e uma seleção `power` reancora no fallback `LOWER_START` (`DesktopSheet.tsx:167`). **[inferência por leitura; não executado]**
- **Texto pequeno em telas médias**: o conteúdo da janela é escalado junto com o palco; perto de 821 px de viewport o fator é cerca de 0,57. **[inferência]**
- **Acoplamento global**: `AnchoredWindow` depende da classe `.tabnav` existir no documento e de ser filho direto do palco (`:20, 33`).
- **Keys por texto**: `key={detail}` e `key={entry}` (`DetailWindows.tsx:129, 156`) colidem se houver duas linhas iguais.
- **Modal no mobile sob a nav**: os modais são renderizados dentro de `.ankh-mobile`, que cria contexto de empilhamento com z-index 0; a nav (z-index 100) tende a ficar por cima do overlay. **[inferência por leitura do CSS]**

---

## Prioridade 2: pipeline do Vault

### De ponta a ponta

1. **Raiz**: `vaultDir = path.resolve(projectDir, '../vault')` (`src/vite.config.ts:9-10`).
2. **Plugin `vault-notes`** (`vite.config.ts:30-68`): `resolveId` reconhece `virtual:vault-index`, `virtual:vault-search` e `virtual:vault-note/<id>` e prefixa com `\0`. `load` chama `buildVaultSections(vaultDir)` uma vez e guarda em cache (`:32`).
3. **Descoberta** (`src/scripts/vaultSections.ts:59-81`): percorre recursivamente só as pastas de `PUBLISHED_FOLDERS = ['Mecânicas', 'Lore', 'Narração', 'Aventuras']` (`:34`), aceitando apenas arquivos terminados em `.md` (`:50-57`).
4. **Resolução de links**: `LinkResolver` (`:122-165`) indexa notas pelo nome do arquivo em minúsculas e coleta os slugs dos títulos.
5. **Catálogo gerado**: `buildCatalogPages` (`src/scripts/catalogSections.ts:87-109`) lê `src/app/data/powers` e `rituals` e gera uma página Markdown por disciplina, mais três de rituais, cerimônias e fórmulas.
6. **Conversão** (`:264-281`): `readNote` (normaliza EOL, remove frontmatter) → `stripObsidianOnlySyntax` (remove blocos `table-of-contents`, embeds `![[...]]`, linhas só de tags; converte `==x==` e callouts; `:111-120`) → `renderWikilinks` (`:167-181`) → `marked` com `gfm`, `breaks` e renderer de heading com id `<noteId>-<slug>` (`:183-202`) → `plainTextOf` e `headingsOf`.
7. **Módulos virtuais** (`vite.config.ts:20-28, 43-51`):
   - índice: `entries` (`id, title, group, label, audience, part`), `loadNote(id)`, `loadSearchText()`;
   - uma nota por módulo, via `import()` dinâmico, o que dá um chunk por nota;
   - busca: um módulo único com `{text, headings}` de todas as seções.
8. **Tipos**: `src/app/vault/vault.d.ts` declara `virtual:vault-index`.
9. **Consumo**: `VaultTab.tsx:2` importa o índice; a aba é lazy (`App.tsx:13`); rota por hash em `route.ts` (`#/vault/<id>/<âncora>`); o HTML entra por `element.innerHTML = html` (`VaultTab.tsx:82`).
10. **Dev**: `server.watcher.add(vaultDir)` e, em `change` de `.md`, invalida os módulos virtuais e força reload completo (`vite.config.ts:53-66`).
11. **Deploy**: `npm ci && npm run build` e publicação de `src/dist` no GitHub Pages (`.github/workflows/deploy.yml`).

### Como `publicar: true` filtra

- **Onde**: `if (fields.publicar !== 'true') continue;` em `vaultSections.ts:64`.
- **Parser**: caseiro, não é YAML (`parseFrontmatter`, `:37-48`). Regex `^---\r?\n([\s\S]*?)\r?\n---\r?\n?` (`:35`). Cada linha é cortada no primeiro `:`, com `trim()` na chave e no valor; aspas duplas em volta do valor são removidas.
- **Comparação**: estrita, contra a string `'true'`.
  - Passam: `publicar: true` e `publicar: "true"`.
  - Não passam: `True`, `TRUE`, `yes`, `on`, `'true'` com aspas simples, `true # comentário`.
- **Frontmatter ausente ou malformado**: `parseFrontmatter` devolve `{}` e a nota é ignorada. O filtro é fail-closed. Também são ignorados: arquivo com BOM antes do `---`, frontmatter vazio (`---` seguido direto de `---`) e bloco sem fechamento.
- **Frouxidão que pode publicar por engano**:
  - a chave passa por `trim()`, então uma linha indentada `  publicar: true` (chave aninhada em outro objeto YAML) conta como publicada;
  - chave duplicada: vale a última;
  - uma nota sem frontmatter que comece com régua `---` e tenha uma linha `publicar: true` antes da próxima `---` seria tratada como publicada.
- **Estado atual das notas** (contagem por `grep` de linhas `^publicar:`, sem ler o conteúdo): 211 notas com exatamente `publicar: true` (146 em Mecânicas, 14 em Lore, 51 em Narração, 0 em Aventuras). Nenhum outro valor aparece. Dois arquivos rastreados nas pastas publicáveis não têm a chave (um em Narração, um em Aventuras).

### Uma nota não publicada pode vazar?

- **Conteúdo**: não. Só as notas aprovadas em `discoverVaultNotes` são lidas depois.
- **Transclusão**: não. Embeds `![[...]]` são removidos (`:84, 112`).
- **Nome**: sim, de forma limitada. Um wikilink para nota não publicada vira `<span class="wiki-ref">` com o alias ou o nome da nota (`:175-178`).
- **Comentários do Obsidian**: `%%...%%` não é removido e HTML cru passa pelo `marked` sem sanitização. Um comentário de mestre dentro de uma nota publicada iria para o bundle. Hoje nenhum arquivo das quatro pastas contém `%%` nem `<!--` (contagem por grep: 0).
- **`publico: narrador` não protege nada**: 73 das 211 notas publicadas têm esse valor e vão para o mesmo bundle público. O campo só controla a aba da UI (`VaultTab.tsx:100`), e um link direto troca para a aba Narrador sozinho (`:134-136`). O índice de busca traz o texto das notas de narrador mesmo na aba Jogador.
- **Catálogo**: as páginas geradas de `src/app/data` são sempre publicadas, com `audience: 'jogador'` fixo (`vaultSections.ts:247-262`).

### O pipeline alcança `vault/bibliografia`?

- **Não, pelo código**. `PUBLISHED_FOLDERS` é uma lista fixa de quatro pastas irmãs e `bibliografia` não está nela. Não há glob. `vault/Personagens/` e os `.md` soltos na raiz do vault também ficam de fora.
- **Segunda barreira**: só entram arquivos `.md`.
- **Ressalva 1**: o watcher de dev observa `vault/` inteiro, incluindo `bibliografia` (`vite.config.ts:54`). Isso afeta só o file-watching, não o bundle.
- **Ressalva 2**: `Dirent.isDirectory()` não deveria seguir symlinks ou junctions dentro das pastas publicadas. **[inferência; não testado no Windows]**
- **Transparência sobre o método**: além de ler o código, o subagente rodou `git ls-files vault/bibliografia` para contar extensões no índice do git, sem abrir nenhum arquivo. Isso vai um pouco além de "só olhar caminhos no código". Resultado: 31 `.txt`, 88 `.png`, nenhum `.md`. Um nome de arquivo apareceu na saída por causa do escape de acentos do git. Nenhum conteúdo foi lido.

### Outros riscos do pipeline

- **Ids**: `id: fields.id || slugify(title)` (`:68`). O `id` do frontmatter não é normalizado nem verificado quanto a duplicatas. Dois ids iguais fazem o índice e o `find` de `vite.config.ts:49` divergirem em silêncio. O id entra sem escape em `id="..."` (`:198`), e uma `/` nele quebra a rota (`route.ts:14`).
- **Nomes repetidos**: `notesByName` usa só o nome do arquivo (`:130`); duas notas homônimas em pastas diferentes colidem.
- **XSS**: `marked` sem sanitização mais `innerHTML`. É aceitável com vault próprio e vira risco real se o app novo carregar notas de terceiros.
- **Dev desatualizado**: só o evento `change` invalida. Criar ou apagar nota, ou editar os JSON de `src/app/data`, não regenera as seções até reiniciar o servidor.
- **Wikilinks em blocos de código** são convertidos em HTML antes do `marked` e devem aparecer como tags literais. **[inferência]**
- **Regex com caracteres combinantes literais** (`/[̀-ͯ]/g` em `vaultSections.ts:95, 213`, `catalogSections.ts:46`, `vault/highlight.ts:7`): sensível à codificação do arquivo-fonte.
- **`SPEC.md` desatualizado**: cita `VAULT_NOTES` e "só Mecânicas" (`src/SPEC.md:119-120, 137`), que não correspondem ao código.

---

## Prioridade 3: store e persistência

### Forma do estado

- **Em memória** (`src/app/context/characterStore.ts:5-9`): `CharacterStore { characters: string[]; active: string; charactersById: Record<string, Character> }`.
- **Persistido** (`src/app/types/character.ts:141-145`): `Store { characters: string[]; active: string; [charId: string]: unknown }`. É um objeto plano em que cada id de personagem é uma chave de topo, ao lado de `characters` e `active`.
- **Onde vive**: `useState<CharacterStore>(readStore)` em `CharacterContext.tsx:38`. Não há reducer nem lib. `editMode` é um segundo `useState` no mesmo contexto (`:39`) e é espelhado em `document.body.classList` (`App.tsx:15-20`).
- **API do contexto** (`CharacterContext.tsx:21-33`): `character` (o ativo), `characters` (`{id, name}[]`), `activeId`, `editMode`, `setEditMode`, `switchChar`, `newCharacter`, `deleteActiveCharacter`, `exportActive`, `importCharacter`, `update(change: (draft) => void)`.
- **Mutação**: `update` faz `structuredClone` do personagem ativo, aplica a função e troca no store (`:56-66`).

### `localStorage`

| Chave | Arquivo | Conteúdo |
| --- | --- | --- |
| `vtm5e` | `context/storage.ts:4` | Todo o `Store`, inclusive retratos e imagens em base64 |
| `vault-tab` | `vault/VaultTab.tsx:25` | `'jogador'` ou `'narrador'` |

- `storageGet` engole erro de parse e devolve `{}` (`storage.ts:6-12`). Um JSON corrompido faz `loadStore` recriar o store com o Khalil e sobrescrever o que havia (`:18-28`).
- `storageSave` não tem `try/catch` (`:14-16`). Um estouro de quota lança exceção dentro do updater de `setStore`.

### Versionamento e migração

- **Não existem**. Não há campo de versão, migração nem validação. `readStore` faz `stored as Character` (`characterStore.ts:18`).
- A tolerância a formatos antigos é ad hoc e está espalhada: `character.pools || []`, `discipline.rituals ?? []`, `character.skills[skill] || {...}` (por exemplo `SheetItems.tsx:66`, `DesktopSheet.tsx:113, 141`).

### Import e export

- **Export** (`characterFiles.ts:4-12`): só o personagem ativo, como `JSON.stringify(character, null, 2)`, sem envelope nem versão. O nome do arquivo vem de `character.name`. Inclui as imagens em base64.
- **Import** (`characterFiles.ts:14-30`): `FileReader` + `JSON.parse` + cast para `Character`. A única validação é `imported.name` ser truthy (`:20`). Se faltar `id`, gera um.
- **Erro**: mostrado por `alert()` (`components/Nav.tsx:76`).
- **Id repetido substitui sem aviso**: `withCharacterAdded` grava por cima (`characterStore.ts:35-42`). Como o personagem padrão tem `id: 'khalil'`, duas fichas exportadas a partir do padrão por jogadores diferentes colidem e uma apaga a outra no import. Isso afeta diretamente o uso pelo mestre.
- **Import inválido pode travar o app**: um JSON com `name` mas sem `trackers`, `attributes` ou `skills` é persistido e ativado antes de renderizar. Componentes como `BloodBlock.tsx:24` leem `character.trackers.bp` sem guarda, e não há error boundary. O app quebraria a cada carga até o `localStorage` ser limpo. **[inferência por leitura; não reproduzido]**

### Mais de um personagem?

- **Armazenamento: sim**. Lista de ids, ativo, criar, importar, excluir, trocar (`Nav.tsx:21-60`).
- **UI e API: não**. `update` só age no ativo, não há `update(id, ...)`, não há visão de lista, ordenação, duplicação nem agrupamento. Todos os consumidores (`ankh/`, `print/`, `components/narrative/`, modais) usam `useCharacter().character`.
- **Caminho de adaptação**: como tudo consome o mesmo hook, um provider com escopo por ficha, que entregue `character` e `update` de um id específico, permitiria reaproveitar os componentes sem reescrevê-los. **[sugestão, não verificada]**

### Bugs e riscos confirmados por leitura

- **Personagem excluído continua no `localStorage`**: `writeStore` relê o objeto salvo e só atribui os ids ainda listados; nunca apaga a chave do removido (`characterStore.ts:23-29`).
- **Efeito colateral dentro do updater**: `writeStore` é chamado dentro de `setStore((current) => ...)` (`CharacterContext.tsx:49-53`). Em `StrictMode` (`main.tsx:7`) o updater roda duas vezes em dev.
- **Custo por clique**: cada mudança clona o personagem ativo, faz `JSON.parse` do store inteiro e `JSON.stringify` de todos os personagens com imagens, de forma síncrona.
- **Quota**: retratos são JPEG de até 640×790 em data URL (`ankh/portrait.ts:1-3, 30`), e cada touchstone pode ter imagem. Com várias fichas, o limite de cerca de 5 MB é alcançável. **[inferência]**
- **Ids**: `'char_' + Date.now()` (`characterStore.ts:11`). Um id chamado `characters` ou `active` colidiria com as chaves do `Store`.
- **Contexto não memoizado**: o objeto `value` é recriado a cada render (`CharacterContext.tsx:95-107`), então todo consumidor re-renderiza a cada mudança.
- **Semente Khalil**: primeira execução (`storage.ts:22-27`) e exclusão do último personagem (`characterStore.ts:53-55`).

---

## Prioridade 4: CSS

### Abordagem e localização

- **CSS puro global**, importado de arquivos TS. Sem CSS Modules, sem pré-processador, sem CSS-in-JS, sem Tailwind.
- Arquivos e pontos de import:

| Arquivo | Linhas | Importado em |
| --- | --- | --- |
| `src/app/sheet.css` | 1394 | `app/main.tsx:3` |
| `src/app/ankh/ankh.css` | 962 | `app/ankh/AnkhSheet.tsx:5` |
| `src/app/vault/vault.css` | 262 | `app/vault/VaultTab.tsx:6` |
| `src/app/print/print.css` | 141 | `app/print/PrintSheets.tsx:4` |
| `src/app/components/narrative/newspaper.css` | 121 | `app/components/narrative/NewspaperPage.tsx:7` |

- **Nomenclatura**: BEM aproximado em `ankh.css` (`ankh-window__title`, `is-selected`); nomes curtos herdados em `sheet.css` (`.sh`, `.pg`, `.box`, `.btn-pm`).
- **Fontes**: Google Fonts por `<link>` em `src/index.html:8` (Barlow Condensed, Cinzel, Cinzel Decorative, Cormorant Garamond, EB Garamond). Depende de rede.

### Tokens existentes

- **Globais** em `:root` (`sheet.css:15-32`): 12 cores (`--bg`, `--bg-col`, `--bg-dsc`, `--txt`, `--txt-s`, `--txt-m`, `--txt-e`, `--acc`, `--gold`, `--brd`, `--brd-s`, `--stain`) e 3 fontes (`--font-body`, `--font-ui`, `--font-deco`).
- **Locais do ankh** em `.ankh-scaler, .ankh-mobile` (`ankh.css:1-18`): 13 cores `--ankh-*` e 2 fontes. Mais 4 medidas de moldura em `.ankh-stage` (`:40-43`).
- **Locais do vault** em `.vault` (`vault.css:2-6`): 4 medidas e `--vault-link`.
- **Impressão**: `--pstage-condensed` (`print.css:44`).

### Proporção tokens versus valores soltos (contagem por regex)

| Arquivo | Usos de `var()` | Hex + rgba soltos | Literais em `px` |
| --- | --- | --- | --- |
| `sheet.css` | 251 | 24 | 446 |
| `ankh.css` | 132 | 11 | 217 |
| `vault.css` | 85 | 2 | 114 |
| `print.css` | 5 | 23 | 32 |
| `newspaper.css` | 16 | 0 | 48 |

- **Cores**: 489 usos de `var()` contra cerca de 60 literais, ou seja, perto de 90% tokenizadas (os `var()` incluem fontes e medidas). Tirando `print.css`, que é preto e branco por natureza, sobram cerca de 37 literais.
- **Fontes**: 70 de 80 declarações `font-family` usam `var()`.
- **Espaçamento, tipografia, raio, sombra, z-index e breakpoints**: nenhum token. Cerca de 860 literais em `px`, 21 tamanhos de fonte distintos e z-index mágicos (4, 5, 50, 60, 100, 150, 200, 240, 250, 300, 400, 490, 500).

### Exemplos de valores soltos

- `sheet.css:7` (`#b02a2a`, o mesmo valor de `--vault-link` em `vault.css:6`), `:94, 140, 161, 803` (`#e05`), `:1217` (`#a02020`), `:46, 1174, 1223` (overlays em rgba).
- `ankh.css:336` (`#1d1515`), `:68, 465, 653` (rgba de `12, 10, 10`, que repete `--ankh-ground`).
- Em TSX: `components/modals/DeleteCharacterModal.tsx:17, 23` (`#e05`, `#a00`, `#c00`), `ankh/AnkhArt.tsx:13` (`#0c0a0a`), `print/printParts.tsx:15-17`.
- `style={...}` aparece 39 vezes em TSX. A maioria é posicionamento calculado em `ankh/` e `print/`. Estáticos: `tabs/RefTab.tsx:8, 43, 90`, `components/narrative/Touchstones.tsx:9-16`, `components/manual/CreationPrompt.tsx:5, 27, 29`, `components/manual/UsageGuide.tsx:3-4`.

### Problemas estruturais

- **Duas paletas paralelas** para os mesmos papéis: acento `--acc: #8b1a1a` (`sheet.css:23`) contra `--ankh-accent: #d0343c` (`ankh.css:6`); `#c87020` definido duas vezes (`sheet.css:27`, `ankh.css:9`).
- **CSS morto**: 89 das 174 classes de `sheet.css` não aparecem no código (por exemplo `.char-header`, `.attr-row`, `.skill-row`, `.trk-grid`, `.bp-panel`). São restos da ficha antiga. **[heurística por busca de substring]**
- **Medidas duplicadas entre JS e CSS**:
  - largura do palco: `STAGE_WIDTH = 1440` (`ankh/stage.ts:3`) e `width: 1440px` (`ankh.css:44`, `print.css:43`);
  - altura da nav: `height: 44px` (`sheet.css:106`) e `--vault-nav-height: 44px` (`vault.css:3`);
  - breakpoint: `MOBILE_BREAKPOINT = 820` (`ankh/AnkhSheet.tsx:7`) contra `@media (max-width: 768px)` (`sheet.css:1251`, `vault.css:242`, `newspaper.css:113`);
  - janela: 292 px no CSS contra `SIDE_WINDOW_LEFT = 1116` no TS.
- **Dependência de estado global**: seletores `body.edit-mode` (11 ocorrências em `sheet.css`), `[contenteditable="true"]` e `:empty`.
- **`vault.css` e `newspaper.css` dependem dos tokens de `sheet.css`** e não funcionam isolados.
- **Sem** `prefers-reduced-motion`, `prefers-color-scheme` ou container queries. `print.css` tem 4 `!important` e usa `:has()` (`:38`).

---

## Blocos por módulo

### 1. `src/app/types/`

Um arquivo: `character.ts` (145 linhas).

- **O que faz**: define `Attributes`, `SkillKey` (27 chaves), `SkillEntry`, `Skills`, `AdvantageEntry`, `Trackers`, `DisciplineEntry`, `Pool`, `Touchstone`, `Character`, mais `SKILL_GROUPS`, `ATTRIBUTE_LABELS`, `SKILL_LABELS`, `AdvantageDef`, `BPLevel`, `Store`. **Dependências**: nenhuma.
- **Acoplamento**: nenhum ao Khalil. Rótulos em inglês hardcoded (`:96-110`).
- **Classificação: ADAPTAR**. O schema é sólido para V5, mas precisa de versão, de separar tipos de constantes e de limpar tipos mortos.
- **Riscos**:
  - `xpTotal` e `xpSpent` são `string | number` (`:71-72`);
  - `generation` é string livre, interpretada por regex em `ankh/BloodBlock.tsx:11-14`;
  - `Pool.attr`, `Pool.skill` e `Pool.disc` são `string` e exigem cast (`ankh/poolText.ts:18, 21`);
  - `hunger` é `number[]` de 0 e 1, não um número;
  - `Touchstone.linkedConviction` vincula pelo texto da convicção;
  - `PredatorType` e `ItemDef` (`:129-139`) não têm uso; `BPLevel.disciplineBonus`, `bane` e `penalty` não são lidos;
  - `Store` com índice `unknown` força casts.

### 2. `src/app/context/`

- **O que faz**:
  - `CharacterContext.tsx`: provider e hook `useCharacter`;
  - `characterStore.ts`: `readStore`, `writeStore` e três funções puras `with*`;
  - `characterFiles.ts`: download e leitura de JSON;
  - `storage.ts`: acesso ao `localStorage`;
  - `ConfirmContext.tsx`: confirmação de exclusão.
- **Dependências**: React; `types/`; `data/defaultCharacter`; APIs `localStorage`, `structuredClone`, `Blob`, `URL.createObjectURL`, `FileReader`.
- **Acoplamento**: `storage.ts:2, 22-27` e `characterStore.ts:2, 53-55` importam e semeiam `DEFAULT_CHARACTER`. Strings em inglês em `ConfirmContext.tsx:30, 39` e `characterFiles.ts:20, 24, 27`. Chave fixa `'vtm5e'`.
- **Classificação por arquivo**:
  - `characterStore.ts`, funções `with*`: **REUTILIZAR**. São puras e pequenas.
  - `characterStore.ts` (`readStore`, `writeStore`) e `storage.ts`: **DESCARTAR**. Formato plano, sem versão, com o bug dos órfãos.
  - `CharacterContext.tsx`: **ADAPTAR**. O padrão `update(draft)` é bom; falta operar por id e memoizar.
  - `characterFiles.ts`: **ADAPTAR**. Falta validação de schema, envelope com versão e tratamento de id duplicado.
  - `ConfirmContext.tsx`: **ADAPTAR**. Simples e desacoplado, mas sem acessibilidade e com rótulos fixos.
- **Riscos**: ver Prioridade 3. Casts: `storage.ts:8, 20`, `characterStore.ts:17-18`, `characterFiles.ts:19`.

### 3. `src/app/data/`

- **O que faz e formato**:

| Arquivo | Conteúdo |
| --- | --- |
| `powerCatalog.ts` | Tipos `PowerEntry`, `RitualEntry`, `RitualKind`, `RITUAL_DISCIPLINES`; carrega os JSON com `import.meta.glob(..., { eager: true })` (`:46-47`); mescla duplicatas por `discipline/nome` mantendo a de texto mais longo (`:53-63`); exporta `POWERS`, `RITUALS`, `DISCIPLINE_NAMES`, `powersOf`, `ritualsOf`, `findPower`, `findRitual` |
| `powers/*.json` | 17 arquivos, 183 registros. Array de objetos planos, todas as chaves sempre presentes: `name`, `discipline`, `level` (número), `source`, `cost`, `pool`, `duration`, `prerequisite`, `amalgam`, `body`, `system` (strings; vazio significa ausente) |
| `rituals/*.json` | 16 arquivos, 123 registros (68 `ritual`, 41 `formula`, 14 `ceremony`). Mesmas chaves, sem `amalgam`, mais `kind`, `castingTime`, `ingredients`, `process` |
| `advantages.json` | 37 registros `{name, type: 1 \| -1, maxLevel, description}` (16 vantagens, 21 falhas) |
| `bp.json` | 11 registros (níveis 0 a 10) `{level, bloodSurge, damageHealed, disciplineBonus, rouseRoll, bane, penalty}` |
| `defaultCharacter.ts` | `DEFAULT_CHARACTER` e `blankCharacter(id)` |
| `creationPrompt.ts` | Uma string longa com prompt de criação e o schema JSON de saída |

- **Disciplinas cobertas** (12): Animalism, Auspex, Blood Sorcery, Celerity, Dominate, Fortitude, Obfuscate, Oblivion, Potence, Presence, Protean, Thin-blood Alchemy.
- **Dependências**: `types/`; `import.meta.glob` do Vite. `scripts/catalogSections.ts` lê os mesmos JSON pelo sistema de arquivos.
- **Acoplamento ao Khalil**:
  - `defaultCharacter.ts:3-116`: a ficha inteira (id `:4`, nome `:5`, apelidos `:6`, clã `:7`, valores `:16-84`, convicções `:85-89`, touchstones `:90-112`, histórico `:113-114`);
  - `defaultCharacter.ts:122`: `blankCharacter` tira as chaves de perícia de `DEFAULT_CHARACTER.skills`; o nome `'Novo Personagem'` está em `:127`;
  - `advantages.json:42`: a descrição do registro "Linguistics" cita o Khalil;
  - `creationPrompt.ts:3-13`: lista fixa de livros aprovados "para esta crônica".
- **Classificação por arquivo**:
  - `powerCatalog.ts`: **REUTILIZAR**. Tipos e buscas independem de personagem; convém trocar o glob `eager` por carga sob demanda.
  - `powers/`, `rituals/`: **ADAPTAR**. Estrutura uniforme e pronta; o conteúdo é texto de livro, o que pede uma decisão sobre direito autoral.
  - `advantages.json`: **ADAPTAR**. Catálogo pequeno, com texto específico de personagem e sobreposto a `ankh/coreAdvantages.ts`.
  - `bp.json`: **REUTILIZAR**. Tabela curta de valores.
  - `defaultCharacter.ts`: **DESCARTAR** o `DEFAULT_CHARACTER`; **ADAPTAR** `blankCharacter` para não depender dele.
  - `creationPrompt.ts`: **DESCARTAR**. É fluxo de jogador do app antigo.
- **Riscos**:
  - cerca de 350 KB de JSON (194 KB de poderes, 156 KB de rituais) entram no chunk inicial por causa do `eager`;
  - a lógica de mescla está duplicada em `scripts/catalogSections.ts:31-43`;
  - a ordem de mescla depende do nome do arquivo e é silenciosa;
  - o fallback de `findPower` entre disciplinas pode casar um homônimo errado;
  - `SPEC.md:30` cita um `disciplines.json` que não existe.

### 4. `src/scripts/` e `src/vite.config.ts`

Estão em `src/`, não na raiz do repo. Além de `vaultSections.ts` existe `catalogSections.ts`, fora da lista pedida.

- **O que faz**: ver Prioridade 2. **Dependências**: `node:fs`, `node:path`, `node:url`, `marked`, `@vitejs/plugin-react`, API de plugin do Vite (`resolveId`, `load`, `configureServer`, `moduleGraph`, `ws`).
- **Acoplamento**: nenhum ao Khalil. Hardcoded:
  - caminho `../vault` (`vite.config.ts:10`) e `../src/app/data` (`vaultSections.ts:244`);
  - nomes das pastas (`:34`);
  - nome da nota `'Glossário'` (`:129`);
  - rótulos de callout (`:88`);
  - prefixo de rota `#/vault/` (`:142, 158`, `catalogSections.ts:79`);
  - chaves de frontmatter em português (`publicar`, `titulo`, `publico`, `livro`, `grupo`, `rotulo`, `tipo`, `nivel`, `parte`; `:64-76`);
  - defaults `'Core'` e `'regra'` (`:71, 74`);
  - títulos das páginas de catálogo (`catalogSections.ts:85, 95, 98-102`).
- **Classificação**:
  - `vite.config.ts` (plugin): **ADAPTAR**. O desenho de módulos virtuais com um chunk por nota serve direto; mudar raízes e a invalidação em dev.
  - `vaultSections.ts`: **ADAPTAR**. Trocar o parser de frontmatter por um YAML de verdade, sanitizar o HTML, validar ids, tratar `%%`, e separar o material do mestre do material dos jogadores.
  - `catalogSections.ts`: **ADAPTAR**, opcional. Só faz sentido se o catálogo de poderes for mantido como páginas.
- **Riscos**: ver "Outros riscos do pipeline". Além disso, `VaultSection.book`, `kind` e `level` são calculados mas não vão para o índice (`vite.config.ts:21`); `{ id } as VaultNote` é um cast parcial (`vaultSections.ts:146, 248`); cada nota é lida do disco três vezes por build.

### 5. `src/app/ankh/`

- **O que faz**: é a aba "Mecânica" inteira, uma ficha desenhada em volta de um ankh em SVG.
- **Dependências**: React; `context/` (quase todo componente chama `useCharacter`); `types/`; `data/`; `components/shared/` e `components/modals/`; APIs `ResizeObserver`, `getBoundingClientRect`, `canvas`, `Image`, `URL.createObjectURL`, `useId`.
- **Acoplamento ao Khalil**: nenhuma string. Hardcoded:
  - `'Novo item'` (`DesktopSheet.tsx:49`, `MobileSheet.tsx:151`);
  - títulos de seção em português (`DesktopSheet.tsx:53, 65, 83, 98, 128-140`);
  - `faction: ['Camarilla', 'Sabbat', 'Anarquistas', 'Independente']` (`profileOptions.ts:7`);
  - apelidos de clã (`clanNames.ts:1`);
  - lista de ressonâncias (`BloodBlock.tsx:8`) e tabela de máximo por geração (`:9`);
  - 5 fundos com rótulo e dimensões (`backdrops.ts:15-21`).
- **Classificação por arquivo**:

| Arquivo | Classificação | Motivo |
| --- | --- | --- |
| `references.ts` | ADAPTAR | Bom ponto único de resolução; unificar o retorno e usar ids estáveis. |
| `DetailWindows.tsx` | ADAPTAR | Componentes de apresentação limpos, sem acesso ao store; faltam papel ARIA e teclado. |
| `AnchoredWindow.tsx` | ADAPTAR | O cálculo de encaixe serve, mas está preso ao palco escalado e a `.tabnav`. |
| `useSheetDialogs.tsx` | ADAPTAR | `Selection` e predicados servem; separar do hook de modais. |
| `coreSkills.ts`, `coreAttributes.ts`, `coreAdvantages.ts`, `predators.ts`, `clanTraits.ts` | ADAPTAR | Estrutura tipada pronta; conteúdo é tradução de livro. |
| `TraitDots.tsx` | REUTILIZAR | Puro, sem contexto, com `aria-label`. |
| `poolText.ts` | REUTILIZAR | Função pura `describePool(character, pool)`. |
| `portrait.ts`, `clanNames.ts` | REUTILIZAR | Utilitários isolados. |
| `Trackers.tsx`, `BloodBlock.tsx`, `SheetItems.tsx`, `pools.tsx`, `SectionTitle.tsx` | ADAPTAR | Boa lógica de ficha, mas todos leem `useCharacter()`. |
| `profileOptions.ts` | ADAPTAR | Deriva opções das tabelas de texto. |
| `geometry.ts`, `stage.ts`, `layout.ts`, `AnkhArt.tsx`, `AnkhSheet.tsx`, `DesktopSheet.tsx`, `MobileSheet.tsx`, `Frame.tsx`, `AppearanceControls.tsx`, `backdrops.ts`, `backdrops/*.jpg` | DESCARTAR | Arte e layout de ficha única em palco de 1440 px; não escala para painel multi-ficha. |

- **Riscos**:
  - cerca de 112 KB de texto de regras em módulos TS importados estaticamente, portanto no chunk inicial;
  - a cadeia de resolução de janelas e as constantes `ATTRIBUTE_GROUPS` e `PROFILE_FIELDS` estão duplicadas entre `layout.ts:26-40` e `MobileSheet.tsx:36-48`;
  - listas editadas por índice (`SheetItems.tsx:167, 199, 224, 242`), com keys por índice ou por texto;
  - `PoolItem` remove sem confirmação (`SheetItems.tsx:278`);
  - `XpItem` usa `defaultValue` com `key` por `character.id` (`:147, 151`) e não reflete mudanças externas;
  - `AnkhSheet` decide desktop ou mobile por largura em JS (`AnkhSheet.tsx:7-22`);
  - 914 KB de JPEG em `backdrops/`, sem crédito nem licença no repo; larguras de 735 e 736 px sugerem origem em agregador de imagens **[inferência]**.

### 6. `src/app/components/`

- **O que faz**:
  - `Nav.tsx`: abas, seletor de personagem, ações (novo, editar, exportar, importar, imprimir, excluir) e gaveta mobile;
  - `shared/`: `Editable` (contentEditable com commit no blur), `Modal`, `SearchDropdown`, `PlusMinus`, `clamp`, `range`, `selectAll`;
  - `modals/`: quatro modais de adicionar mais `DeleteCharacterModal`;
  - `narrative/`: página estilo jornal com `Convictions`, `Touchstones`, `ImageSlot`, `ClanNotes`, e `newspaper.css`;
  - `manual/`: `UsageGuide` e `CreationPrompt`.
- **Dependências**: React; `context/`; `data/`; `types/`; `ankh/clanTraits`, `ankh/references`, `ankh/portrait` (dependência invertida de `components` para `ankh`); APIs `navigator.clipboard`, `window.print`, `window.history`, `Selection` e `Range`.
- **Acoplamento**: nenhum ao Khalil. Strings fixas: rótulos de abas e ações (`Nav.tsx:8-14, 116-123`), `'Nova Conviction.'` e limite 5 (`Convictions.tsx:7-8`), `'Novo Touchstone'` (`Touchstones.tsx:7`), `'A Narrativa'` (`NewspaperPage.tsx:14`), `'Background'` (`:33`), link para claude.ai (`CreationPrompt.tsx:29`), ids DOM fixos (`#ambition-text`, `#background-text`, `#convictions-list`, `#btn-menu`).
- **Classificação**:
  - `shared/clamp.ts`, `range.ts`, `selectAll.ts`: **REUTILIZAR**. Triviais e puros.
  - `shared/Editable.tsx`: **ADAPTAR**. Útil, mas com perda provável de quebras de linha e `ref as never` (`:42`).
  - `shared/Modal.tsx`, `SearchDropdown.tsx`: **ADAPTAR**. Sem foco, `Escape`, papéis ARIA nem navegação por setas.
  - `shared/PlusMinus.tsx`: **DESCARTAR**. Sem uso no código.
  - `modals/Add*.tsx`: **ADAPTAR**. Lógica correta de filtro por nível; presos ao personagem ativo.
  - `modals/DeleteCharacterModal.tsx`: **ADAPTAR**. Cores inline e sem acessibilidade.
  - `narrative/*`: **ADAPTAR**. Convicções, touchstones e `ClanNotes` servem para a visão do mestre; o visual de jornal é opcional.
  - `manual/*`: **DESCARTAR**. Descreve a UI antiga.
  - `Nav.tsx`: **DESCARTAR** como está. `ImportButton` e `CharacterSwitcher` servem de referência.
- **Riscos**:
  - `Editable` grava `textContent` (`:35`); Enter em campo multilinha tende a perder parágrafos **[inferência]**, e não trata colar texto com formatação;
  - itens do seletor de personagem são `<div onClick>` (`Nav.tsx:49-56`), inacessíveis por teclado;
  - `alert()` para erro de import;
  - `Convictions` e `Touchstones` usam `key={index}` (`:45`, `:89`);
  - `SearchDropdown` usa `key={item.label}`;
  - `SPEC.md:86-88` diz que os cartões de clã são texto fixo do Khalil, mas `ClanNotes.tsx:24-25` já deriva do clã e do predator type.

### 7. `src/app/print/`

- **O que faz**: `PrintSheets` monta três páginas A4 fora da tela (`print.css:1-8`) e as revela em `@media print`. `MechanicsSheet` reconstrói a ficha do ankh em preto e branco reutilizando `createColumn`. `FitPage` reduz o conteúdo com `zoom` até caber. `printParts` tem `Dots`, `Box` e `DamageBoxes`.
- **Dependências**: `context/`; `ankh/geometry`, `layout`, `stage`, `poolText`; `tabs/RefTab` (`RefContent`); `components/narrative/NewspaperPage`; APIs `document.fonts.ready`, evento `beforeprint`, propriedade CSS `zoom`.
- **Acoplamento**: nenhum ao Khalil. Constantes repetidas de `BloodBlock` e `Trackers` (`MechanicsSheet.tsx:19-22`); títulos fixos (`:47, 56, 63, 77, 87, 97-107`); grupos de perícia impressos em inglês via `group.toUpperCase()` (`:79`), diferente da tela.
- **Classificação**:
  - `printParts.tsx`: **REUTILIZAR**. Puro, sem contexto.
  - `FitPage.tsx`: **ADAPTAR**. A ideia serve; depende de `useCharacter` só para refazer o ajuste.
  - `MechanicsSheet.tsx`: **DESCARTAR**. Preso ao layout do ankh.
  - `NarrativeSheet.tsx`, `RefSheet.tsx`, `PrintSheets.tsx`: **DESCARTAR**. Wrappers de três linhas.
- **Riscos**:
  - as três folhas ficam sempre montadas e re-renderizam a cada clique, e `FitPage` força até 8 reflows em `useLayoutEffect` a cada mudança (`FitPage.tsx:20-33`);
  - imprime só o personagem ativo, sem impressão em lote;
  - alturas de página divergentes: 1120 (`FitPage.tsx:6`) e 1123 (`MechanicsSheet.tsx:16`);
  - `zoom` não é propriedade padronizada em todos os navegadores.

### 8. `src/app/tabs/`

- **O que faz**: `MechanicsTab` (5 linhas, só renderiza `AnkhSheet`), `NarrativeTab` (jornal mais campos Idiomas e Anotações), `ManualTab` (layout de duas colunas), `RefTab` (referência rápida estática).
- **Dependências**: `ankh/`, `components/`, `context/`.
- **Acoplamento**: nenhum ao Khalil. `RefTab.tsx:1-95` é um resumo de regras escrito direto em JSX (tabelas e parágrafos), sem dados estruturados.
- **Classificação**: **DESCARTAR** os quatro. O conteúdo de `RefTab` caberia melhor como nota do vault ou como dado.
- **Riscos**: conteúdo de regras duplicado em relação ao vault, com chance de divergir; ids DOM fixos (`#ref-items-table`, `#languages-text`, `#notes-text`).

### 9. `src/app/vault/`

- **O que faz**:
  - `VaultTab.tsx` (300 linhas): barra lateral agrupada por `part` e `group`, abas Jogador e Narrador, busca com debounce de 180 ms e ranqueamento (título 1000, heading 500, mais ocorrências), carga da nota, rolagem até a âncora, botão de voltar ao topo;
  - `route.ts`: `isVaultHash`, `parseVaultHash`, `noteHash`, `useVaultRoute`;
  - `highlight.ts`: `searchPattern` (insensível a acento), `containsMatch`, `highlightMatches`, `removeHighlights`;
  - `vault.d.ts`: tipos do módulo virtual;
  - `vault.css`.
- **Dependências**: React; `virtual:vault-index` (depende do build); APIs `localStorage`, evento `hashchange`, `scrollIntoView`, DOM `Range`.
- **Acoplamento**: nenhum ao Khalil. Rótulos fixos em `VaultTab.tsx:26-27, 264, 269`; prefixo `#/vault` (`route.ts:3`); dependência da altura da nav (`vault.css:3`).
- **Classificação**:
  - `route.ts`: **REUTILIZAR**. Pequeno e sem dependências; vale decodificar com tolerância a erro.
  - `highlight.ts`: **REUTILIZAR**. Autocontido; conferir a codificação da regex de acentos.
  - `vault.d.ts`: **REUTILIZAR** junto com o plugin.
  - `VaultTab.tsx`: **ADAPTAR**. A funcionalidade é a desejada, mas está em um componente só e trata "narrador" como aba.
  - `vault.css`: **ADAPTAR**. Bem tokenizado, dependente dos tokens globais.
- **Riscos**:
  - `innerHTML` sem sanitização (`VaultTab.tsx:82`);
  - a busca navega sozinha para o primeiro resultado alterando `location.hash` (`:138-143`), o que polui o histórico **[inferência]**;
  - `decodeURIComponent` sem `try` (`route.ts:14`) lança em hash malformado;
  - `loadNote` sem tratamento de falha (`:148`);
  - `document.querySelector` global (`:159, 171`);
  - `role="tablist"` sem `tabpanel` nem navegação por setas (`:221-226`);
  - `removeHighlights` não tem uso;
  - busca por regex sobre todo o texto a cada digitação, limitada a 200 ocorrências por nota (`:23`).

### Itens de `src/` fora da lista

- `src/app/App.tsx`, `src/app/main.tsx`: shell. Todas as abas ficam montadas e ocultas por `.pg` (`App.tsx:34-45`, `sheet.css:195-196`). **DESCARTAR**.
- `src/app/sheet.css`: ver Prioridade 4. **ADAPTAR** só os tokens de `:root`.
- `src/index.html`: `lang="en"` com UI em português (`:2`); título fixo (`:6`); Google Fonts por CDN (`:8`).
- `src/public/favicon.svg`.
- `src/.oxlintrc.json`: duas regras de React.
- `src/README.md` e `src/SPEC.md`: úteis como mapa. O `SPEC.md` está desatualizado nos pontos já citados.
- `vault/khalil_impressao_v5(2).html`: arquivo específico do Khalil na raiz do vault, fora de `src/`. Não foi aberto.

---

## Riscos transversais

1. **Direito autoral**: cerca de 470 KB de texto de regras traduzido, com página citada, em `ankh/core*.ts`, `ankh/predators.ts`, `ankh/clanTraits.ts`, `data/powers`, `data/rituals`, `data/advantages.json` e `tabs/RefTab.tsx`. As páginas de catálogo e o índice de busca republicam o mesmo conteúdo. O `README.md:103-105` da raiz declara projeto de fã não licenciado.
2. **Licença do código**: GPL v3 na raiz. **[implicação é inferência]**
3. **Sem controle de acesso**: tudo vai para um bundle estático público. Para um app do mestre, material de narrador precisa de separação no build ou de app local, não de filtro na UI.
4. **Sem testes** de nenhum tipo e sem error boundary.
5. **Acessibilidade**: nenhum modal, gaveta ou janela tem gestão de foco, `Escape` ou papéis ARIA; vários controles são `<div onClick>`; `lang` errado.
6. **Performance**: bundle inicial pesado por dados `eager`; todas as abas e as três folhas de impressão montadas ao mesmo tempo; contexto não memoizado; persistência síncrona do store inteiro a cada clique.
7. **Persistência frágil**: sem versão, sem validação, sem tratamento de quota, com dados órfãos e colisão de id no import.
8. **Estado e DOM globais**: `body.edit-mode`, `document.querySelector('.tabnav')`, listeners em `document`, ids DOM fixos.
9. **Compatibilidade com TS mais estrito**: sem `noUncheckedIndexedAccess`, vários acessos por índice hoje passam sem verificação (`ankh/stage.ts:15`, `ankh/Trackers.tsx:57, 60`, `components/narrative/Convictions.tsx:11`, `ankh/SheetItems.tsx:167, 224`).
10. **Dependência de rede**: fontes por CDN; sem uso offline garantido.
11. **Strings**: sem i18n; UI mistura português e inglês.

## O que não foi verificado

- **Nada foi executado**: sem build, `tsc`, lint nem o app. Tamanhos de chunk, erros de tipo e todos os itens marcados **[inferência]** não foram reproduzidos.
- **Lidos só em parte**:
  - `ankh/coreAdvantages.ts`, `coreSkills.ts`, `coreAttributes.ts`, `predators.ts`, `clanTraits.ts`: primeiras 14 linhas e linhas de `export`; contagem de entradas por regex;
  - JSON de `data/`: um script contou registros e chaves em todos os arquivos, mas só foram impressos o formato e os campos curtos do primeiro registro de um arquivo de poderes e de um de rituais;
  - `sheet.css` (linhas 1-90 e 1166-1244, mais greps), `ankh.css` (1-110, mais greps), `vault.css` (1-70), `print.css` (1-60), `newspaper.css` (só greps);
  - `components/manual/UsageGuide.tsx` (40 linhas e títulos), `data/creationPrompt.ts` (12 linhas e títulos), `ankh/geometry.ts` (linhas truncadas);
  - `LICENSE` (cabeçalho), `README.md` da raiz (só grep).
- **Não lidos**: `src/package-lock.json`; o conteúdo das notas em `vault/` (só contagem de linhas de frontmatter por grep); `vault/Personagens/`; `.obsidian/`.
- **`vault/bibliografia`**: nenhum arquivo foi aberto; só a contagem de extensões pelo índice do git, como descrito na Prioridade 2.
- **Origem e licença** das imagens em `ankh/backdrops/`.
- **Comportamento de symlinks e junctions** no percurso de pastas no Windows.
- **Contagem de CSS morto e de literais**: feita por regex e busca de substring, sujeita a falsos positivos (classes montadas dinamicamente, como `ankh-row--${kind}`).
