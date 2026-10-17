# Handoff: montar a página 2 da Cola para outro jogador

Branch `ficha-app` (a página 2 entrou no merge `1e0671e`). Hoje ela existe só para o **Gideon Nicols**. Este guia é para fazer a do próximo personagem.

## O que é a página 2
Uma folha A4 **impressa e entregue ao jogador**, específica do personagem dele. A página 1 da Cola é igual para todos.
- **Esquerda:** Disciplinas com os poderes da ficha (Custo, Duração, Dice Pool e a linha `Cola`), **Reservas fortes** (calculadas da ficha) e o bloco de lore **Facções e organizações**.
- **Direita:** os outros blocos de lore, como **A corte de Nova York**, **NPCs que você conhece** e **Jogadores (a coterie)**.
- **Faixa de baixo:** **Nova York por distrito**, em três colunas.
- Abre pelo menu **⋯** da ficha ou do card da Mesa, em "Cola do jogador (página 2)".

## Regras de ouro
1. **Uma folha só.** A página do Gideon está justa (sobram uns 100 px na esquerda e 57 px na direita). Se aparecer o aviso de transbordo, **encurte o texto**; não diminua a fonte (mínimo de 7 pt impresso).
2. **Só o que o personagem sabe e pode ficar à vista na mesa.** A folha fica em cima da mesa, e outros jogadores podem ler. Os segredos do personagem e os dos outros ficam de fora.
3. **Sem spoiler da one-shot.** A sessão acontece na virada de 2021 para 2022. **Não cite Réveillon, 31/12, "noite de 31", virada nem meia-noite de Ano Novo**. A exceção é a frase da Nina, "antes do Réveillon de **2020**". **Nunca escreva "Auld Sanguine".**
4. **Notas do vault só com o ok do Enzo.** Proponha os textos (linhas `Cola` e nota de lore), espere a revisão e só então commite. Commits separados para vault e app, com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, e só quando o Enzo pedir.
5. Responda em português. Código em inglês. Não leia `External Documents/`, `vault/bibliografia/` nem PDFs de livro. `..\vampire-5e-referencia` (o app do Pedro) é só leitura.

## Onde ler (em ordem)
| Arquivo | Para quê |
|---|---|
| `Narrador/Relacionamentos/Para o Jogador/README - <Personagem>.md` | **Fonte principal.** É o "o que você sabe" do personagem, já revisado contra spoilers. Traz corte, NPCs, coterie (com o nome dos jogadores) e o que ele sabe de cada um. Os itens marcados com 🔒 são segredos: não vão para a cola. |
| `Narrador/Jogadores/<Personagem>.md` | Nota completa do Narrador. **Tem segredos**: use só para entender o contexto, nunca para copiar. Marcas: 📄 está na ficha · ✅ decidido pelo Narrador · 💡 sugestão a validar · ❓ lacuna. |
| `Regras/Colas dos Jogadores/Gideon Nicols.md` | **Modelo** da nota de lore: formato, tamanho dos verbetes e tom. |
| `Narrador/Nova York/Camarilla em Nova York.md` | A corte em 2021: cargos, nomes e Anarquistas. |
| `Narrador/Nova York/Personagens da Camarilla de NY.md` | Perfis dos NPCs da corte. |
| `Narrador/Nova York/Mapa de Nova York.md` | Distritos e facções, para "Nova York por distrito". |
| `Narrador/Relacionamentos/Auld Sanguine - Laços entre Jogadores.md` | Quem conhece quem na coterie. |
| `Lore/` (Camarilla, Anarquistas, Sabbat, Semana de Pesadelos…) | Texto das facções. |
| `O Sangue (Vitae)/Disciplinas/<Disciplina>.md` | Poderes; é aqui que vão as linhas `Cola`. |
| `Narrador/Nova York/Auld Sanguine - Roteiro da Sessão.md` | **Não use como fonte.** É o roteiro da noite. Se ler, é só para saber o que **não** pode aparecer. |

## Passo a passo

### 1. A ficha precisa estar no app
Sem ficha não há página 2: ela lê os poderes, a identidade e as perícias da ficha.
- Já convertidas, em `vampire-pages/docs/players/fichas/`: **gideon.json** e **vincent.json**.
- Originais, em `vampire-pages/docs/players/fichas-originais/`:
  - `.json`, exportados do app do Pedro, que o app importa direto pela barra (Importar): **Khalid** (Klaus), **Daniel** (Luiz Miguel), **Nina** (Marcelle) e **Jesse** (Rafael).
  - `.pdf`, que precisam ser passados à mão para o JSON do app (schema v3, ver `src/schema/`): **Gusman** (Oliveira) e **Herta** (Rebeca). O PDF é a ficha do jogador, não um livro, então pode ser lido.
- Depois de importar, revise a ficha no app (Disciplinas e poderes com o nome certo) e salve o JSON em `docs/players/fichas/<nome>.json` para os testes.
- O **Jesse é 13ª geração** (decisão do Narrador; a ficha original diz 14ª).

### 2. Linhas `Cola` nos poderes do personagem
Em `O Sangue (Vitae)/Disciplinas/<Disciplina>.md`, dentro do bloco `>` de cada poder da ficha, acrescente depois do Dice Pool e antes do Sistema:
```
> - **Cola**: Passivo, sem rolagem. Salta 3 × Potence metros na vertical e 5 × Potence na horizontal, sem precisar de impulso.
```
- É o resumo para a mesa: o que o poder faz, o que se rola e o custo que importa.
- Com linha `Cola`, Custo, Duração e Dice Pool só aparecem se forem curtos (até 60 caracteres). **Se um desses campos for longo, a linha `Cola` precisa cobrir o que ele dizia** (ex.: Heightened Senses: sensação extrema, −3 dados, Willpower).
- Sem linha `Cola`, os campos saem inteiros e a tela mostra um aviso.
- Poderes que o Gideon já usa (Auspex, Celerity e Potence) já têm `Cola`; reaproveite se o personagem tiver o mesmo poder.

### 3. A nota de lore
Crie `Regras/Colas dos Jogadores/<Nome do Personagem>.md`. O app casa pelo nome da ficha, com tolerância a acento, maiúscula e pequenos erros.
```
---
publicar: true
tipo: cola-jogador
jogador: <Nome do Personagem>
tags: [cola, jogador]
---
```
- Cada `##` é um bloco; cada `###` é um verbete, impresso como "◆ Termo: texto".
- **A posição do bloco depende do título** (`src/features/cola/PlayerColaPage.tsx`):
  - "Facções e organizações" vai na **esquerda**, abaixo das Disciplinas;
  - "Nova York por distrito" vai na **faixa de baixo**;
  - qualquer outro título vai na **direita**.
- Use os mesmos títulos do Gideon: **A corte de Nova York**, **NPCs que você conhece**, **Jogadores (a coterie)**, **Facções e organizações** e **Nova York por distrito**. Adapte o conteúdo ao que **este** personagem sabe. A Herta, por exemplo, conhece a corte pelo que Heinrich lhe ensinou e não conhece quase ninguém da coterie.
- Na coterie, use o formato do Gideon: "Vincent Marchetti (Pedro)". Os jogadores são: Klaus = Khalid, Pedro = Vincent, Polck = Gideon, Rebeca = Herta, Luiz = Daniel, Rafael = Jesse, Marcelle = Nina, Oliveira = Gusman.
- Se a folha estiver curta de espaço, os distritos e as facções são os primeiros a encolher.

### 4. Teste de segredos
Em `src/features/cola/playerCola.test.ts` há um teste que barra os segredos do Gideon no texto impresso (`Julian`, `Jiménez`, `Mary Winchester`, `Ravnos`…). Faça um igual para o novo personagem, com os termos que **ele** não pode ver. Use o 🔒 do README e a nota do Narrador. Acrescente também `Auld Sanguine` e `Réveillon`.

### 5. Verificar
- `cd vampire-pages && npm run check` (tsc + vitest) e `npm run build`.
- **No navegador:** os scripts e2e ficam fora do repo, em `%TEMP%\vp-e2e` (podem ter sumido).
  - Copie `check-cola-player.mjs` e troque o caminho da ficha (`FILE`, hoje `docs/players/fichas/gideon.json`) e o nome do personagem.
  - Rode `& "$env:TEMP\vp-e2e\run.ps1" -Script <script>.mjs`, que sobe o vite da `ficha-app` na porta 5197. O `run-wt.ps1` era da worktree, que foi apagada.
  - O script confere que não há transbordo nem aviso e gera `shots\cola-<nome>.pdf`. Veja o PDF com `pdftoppm` (versão xpdf: `pdftoppm -r 90 arq.pdf prefixo`, gera `.ppm`; converta para PNG com Pillow).
- Mostre o PDF ao Enzo. **A impressão sempre passa pela revisão dele.**

## O que cada personagem sabe (decisões de 16/10/2026)
- **Jesse:** ninguém sabe nada sobre ele, exceto o **Daniel**. A ordem do Xerife chegou ao Daniel no fim de novembro de 2021; ele achou o Jesse perdido na I-80, perto de Youngstown, e o trouxe a Nova York, em duas noites de estrada. **O Jesse não contou nada sobre si ao Daniel.** Não ligue o sobrenome Calloway ao da Nina (é uma pendência em aberto).
- **Gusman:** o clã **Ravnos** e o nome **Julian Jiménez** são segredo. Ele mesmo acha que é Caitiff, e só Gideon, Khalid e Vincent sabem a verdade. **Daniel, Nina, Herta e Jesse não sabem que ele existe.** Não revele que o **Iggy** é Kindred.
- **Nina:** conhece Gideon (Mawla dela desde antes do Réveillon de 2020), Khalid e Vincent. Não conhece Daniel, Gusman, Herta nem Jesse.
- **Herta:** chegou ao Plaza em 28/12 com a comitiva de Heinrich e está sozinha desde 30/12. Só cruzou com Vincent e Khalid.
- **Daniel:** o filho **Nathan** é segredo dele. O **Khalid sabe**, e o Daniel não sabe que o Khalid sabe.
- **Vincent:** o sire é **Dragomir Vlădescu**, nome definido pelo Narrador.
- **Anarquistas:** ficam majoritariamente no **Bronx**, com presença significativa em **Staten Island**.
- **Khalid:** a identidade do sire (Nizar, Arconte) é segredo dele perante a coterie.

## Onde fica o código (se precisar mexer)
- `src/features/cola/playerCola.ts`: `buildPlayerCola(ficha, catálogos)`, função pura que monta o modelo da página (poderes, reservas, lore e avisos).
- `src/features/cola/PlayerColaPage.tsx` e `.module.css`: a A4 e a posição dos blocos pelo título.
- `src/features/cola/ColaView.tsx`: tela cheia; com `ficha` mostra a página 2, sem ela a página 1.
- `src/catalog/playerColas.ts`: busca a nota pelo nome. `vite/buildPlayerColas.ts` gera o módulo `virtual:player-colas` a partir de `Regras/Colas dos Jogadores/`.
- Histórico da primeira versão: `docs/HANDOFF-cola-pagina-2.md`.
