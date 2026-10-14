# Design spec: Vampire Pages

Análise visual de duas referências em `vampire-pages/design-refs/`, feita em 2026-10-14:

- `VTM-Ficha-2pages.pdf`: ficha padrão V5, 2 páginas (Letter). É a fonte da **paleta-base**: fundo, texto e réguas.
- `Vampire the Masquerade-StyleApproach.pdf`: 3 páginas do livro básico (texto corrido, tabela, cabeçalhos). É a fonte dos **acentos** e do estilo editorial.

## Método

- **Cores**: as páginas foram rasterizadas com `pdftoppm` (200 dpi) e amostradas por script Python/Pillow. O script agrupa os pixels em faixas de 8 níveis por canal e depois resolve cada faixa para o pixel exato mais frequente.
- **Fontes**: só os nomes, via `pdffonts`. Nenhuma fonte ou imagem embutida foi extraída.
- **Julgamento visual**: páginas lidas como imagem, sem extrair texto.
- **O que não reproduzir**: logotipo, moldura dupla de cantos chanfrados, marcadores em triângulo, selos e ícones do rodapé. Esses ornamentos e a arte não devem ser reproduzidos. Este documento descreve o caráter visual, não coordenadas.

---

## 1. Paleta amostrada

As porcentagens são da área de pixels de cada documento, excluindo o logotipo de topo e o rodapé.

### Ficha padrão (paleta-base)

| Hex | Área | Papel na ficha |
| --- | --- | --- |
| `#ffffff` | ~95% | Fundo do papel. |
| `#231f20` | ~1,0% | Tinta: rótulos, valores, contorno das bolinhas e quadrados, réguas verticais entre colunas. É um preto quente, levemente avermelhado, e não `#000`. |
| `#730e1e` | ~0,45% | Crimson: moldura, réguas sob os títulos de seção, borda da caixa de trackers e o rótulo "Sire". |
| `#dcc3c7` | ~0,15% | Rosa acinzentado claro na borda da moldura dupla. Pode ser traço fino ou antialias do crimson. |
| `#b9868e`, `#c2959c`, `#964a56` | ~0,1% cada | Meios-tons do crimson (antialias). Não são cores de projeto. |
| `#9d9d9d` | ~0,17% | Cinza das linhas pontilhadas de preenchimento e do texto do rodapé. |
| `#c8c7c7`, `#d6d5d5` | ~0,1% cada | Cinza claro das caixas pontilhadas de texto livre (Beliefs, Notes, Profile). |

### Páginas do livro (acentos)

| Hex | Área | Papel no livro |
| --- | --- | --- |
| `#ffffff` | ~86% | Fundo da página. |
| `#f0e2df` | ~9,3% | Tinta rosada das linhas alternadas da tabela (zebra). Um rosado muito claro e quente. |
| `#000000` | ~1% | Texto corrido, títulos de capítulo e réguas de coluna e de tabela. |
| `#790914` | ~0,2% | Crimson editorial: títulos de seção, cabeçalho corrente ("VAMPIRES", "COREBOOK") e parágrafos de destaque. |
| `#a7a7a7` | ~0,17% | Cinza do número de página. |
| `#232323`, `#e3e3e3` | <0,15% | Antialias de texto e de réguas. |

### Leitura

- Os dois documentos usam o mesmo vermelho: `#730e1e` (ficha) e `#790914` (livro) diferem só no brilho. O app adota o do livro, `#790914`, como acento único.
- Fora o crimson e a tinta rosada, tudo é neutro. Não há segunda cor de destaque. A identidade vem do contraste entre papel branco, tinta quente e um único vermelho escuro.
- O livro usa preto puro; a ficha, preto quente. Para o tema claro, a ficha manda: `#231f20`.

### Contraste (WCAG 2.x, sobre `#ffffff` salvo indicação)

| Par | Razão | Uso permitido |
| --- | --- | --- |
| `#231f20` | 16,3 | Texto de qualquer tamanho. |
| `#231f20` sobre `#f0e2df` | 12,9 | Texto sobre linhas com tinta rosada. |
| `#790914` | 11,3 | Texto, títulos, links, anel de foco. |
| `#790914` sobre `#f0e2df` | 8,9 | Texto em destaque sobre tinta. |
| `#ffffff` sobre `#790914` | 11,3 | Texto sobre botão crimson. |
| `#5e5a5b` (derivado) | 6,8 | Texto secundário. |
| `#757172` (derivado) | 4,8 | Texto auxiliar e placeholder (limite AA). |
| `#9d9d9d` | 2,7 | **Só decoração** (linhas pontilhadas). Não serve para texto. |
| `#c8c7c7` | 1,7 | **Só decoração** (caixas pontilhadas). Não serve como borda de controle. |
| `#dcc3c7` | 1,7 | **Só decoração**. |

O cinza do rodapé da ficha (`#9d9d9d`) reprova como texto. Por isso os dois tons de texto secundário são **derivados**, no mesmo matiz quente da tinta, e não amostrados.

---

## 2. Estrutura da ficha

A hierarquia visual tem quatro níveis, iguais nas duas páginas:

1. **Título de seção**: caixa alta, espaçado, centralizado, sobre uma régua crimson de largura total.
2. **Subtítulo de grupo**: serifa itálica, pequeno (Physical, Social, Mental; Chronicle Tenets, Convictions etc.).
3. **Rótulo de campo**: serifa regular, caixa mista.
4. **Valor**: linha pontilhada para escrever, bolinhas (traços de 0 a 5), quadrados (trackers) ou caixa pontilhada (texto livre).

### Página 1: mecânica

1. **Identidade**: grade de 3 colunas por 3 linhas, só com rótulos, sem linha visível. A leitura em colunas forma três grupos coerentes:
   - personagem: Name, Clan, Sect;
   - mesa e sangue: Player, Predator type, Generation;
   - crônica e motivação: Chronicle, Ambition, Desire.
2. **Attributes**: 3 colunas (Physical, Social, Mental) com 3 atributos cada, separadas por réguas verticais finas. Cada atributo tem rótulo à esquerda e 5 bolinhas à direita.
3. **Skills**: 3 colunas de 9 perícias, na mesma ordem físico, social e mental, mas sem subtítulo. Cada linha tem rótulo, linha pontilhada (espaço para especialização) e 5 bolinhas.
4. **Disciplines**: 6 blocos em grade de 2 linhas por 3 colunas. Cada bloco tem:
   - uma linha de nome da disciplina com 5 bolinhas;
   - 5 linhas de poder, cada uma com um marcador, um campo longo e um campo curto.
5. **Trackers**, numa caixa própria com borda crimson, ao pé da página:
   - Health e Willpower: 15 posições cada, em 3 grupos de 5. Uma fileira de bolinhas marca o máximo e uma fileira de quadrados marca o dano;
   - Humanity: 10 quadrados em 2 grupos de 5;
   - Hunger: 5 quadrados, mais uma linha de texto.

### Página 2: narrativa

1. **Cabeçalho reduzido**: Name, Player, Chronicle e número da página. Repete a identidade mínima.
2. **Beliefs**: 3 caixas pontilhadas lado a lado: Chronicle Tenets, Convictions, Touchstones.
3. **Corpo em 2 colunas assimétricas** (estreita à esquerda, larga à direita):
   - **Coluna estreita**:
     - **Merits**: cerca de 20 linhas, cada uma com nome e 5 bolinhas;
     - **Experience**: linha "Rank" e uma caixa dividida em duas por um pontilhado vertical (total e gasto).
   - **Coluna larga**:
     - **The Blood**:
       - Blood Potency centralizado, com 10 bolinhas;
       - campos em 2 subcolunas: Blood Surge, Power Bonus, Mend Amount e Rouse Re-Roll de um lado; Bane Severity e Feeding Penalty (caixa) do outro;
       - Clan Bane (caixa, com campo de referência de página) e Clan Compulsion (caixa).
     - **Profile**:
       - Description & Features (caixa);
       - lista à direita com Sire, Birthday, Age, Embraced e Apparent Age. "Sire" é o único rótulo em crimson da ficha;
       - Notes e Concept (caixas altas).

### Implicações para o app

- O agrupamento em 3 colunas (físico, social, mental) é a espinha da ficha. O app deve preservar essa ordem mesmo quando empilhar as colunas no celular.
- Os grupos de 5 com respiro entre grupos tornam os trackers legíveis à primeira vista. Vale reproduzir esse agrupamento, não as formas exatas.
- A página 1 é mecânica e a página 2 é narrativa: é a divisão natural entre dois painéis ou abas.

---

## 3. Tipografia

### O que os PDFs usam (só os nomes, via `pdffonts`)

| Documento | Família | Onde aparece (julgamento visual) |
| --- | --- | --- |
| Ficha | Cormorant Garamond Medium, Bold, SemiBold Italic | Rótulos de campo, subtítulos de grupo em itálico |
| Ficha | Arno Pro Semibold | Títulos de seção em caixa alta espaçada |
| Ficha | Gill Sans SemiBold | Rótulos da caixa de trackers (Health, Willpower, Humanity, Hunger) |
| Ficha | Myriad Pro, PT Sans | Rodapé e texto miúdo |
| Livro | Cormorant Light, Light Italic, Bold | Texto corrido (Light) e títulos de seção crimson (Bold) |
| Livro | Bodoni Seventy-Two ITC Book | Títulos de capítulo grandes |
| Livro | Gill Sans Light, SemiBold, Bold SC | Corpo da tabela (Light), cabeçalho corrente (SemiBold), cabeçalho de tabela em versalete (Bold SC) |

### Caráter

- **Serifa de texto (Cormorant)**: Garamond de alto contraste e ar caligráfico, com olho pequeno, ascendentes longas e itálico estreito.
  - No livro aparece em peso Light, alinhado à esquerda com margem direita irregular, com recuo de primeira linha em vez de espaço entre parágrafos.
  - Títulos de seção em Bold, crimson, caixa mista, em 2 linhas com entrelinha apertada.
- **Títulos de seção da ficha (Arno)**: serifa humanista semibold, sempre em CAIXA ALTA com espaçamento largo, de 0,1 a 0,15 em.
- **Display (Bodoni)**: didone de contraste extremo e eixo vertical. Usado em tamanho grande, peso Book, preto, caixa mista. É o único lugar com essa voz.
- **Sans humanista (Gill Sans)**: proporções clássicas. Aparece em três papéis:
  - informação densa (tabela, Light);
  - rótulos utilitários (trackers, SemiBold);
  - microtipografia em CAIXA ALTA com espaçamento muito largo, de 0,25 a 0,3 em (cabeçalho corrente em crimson, número de página em cinza).

### Equivalentes OFL hospedáveis

Todas as famílias abaixo são OFL, estão no Google Fonts e podem ser servidas pelo próprio app com pacotes `@fontsource` (nomes de pacote a confirmar na instalação). A recomendação é **auto-hospedar**: o app anterior dependia do CDN do Google e não funcionava offline.

| Papel | Original | Equivalente OFL | Pesos sugeridos |
| --- | --- | --- | --- |
| Texto, rótulos, títulos de seção | Cormorant, Cormorant Garamond, Arno Pro | **Cormorant Garamond**, que é a própria fonte da ficha e já é OFL | 400, 500, 600, 700, itálico 500 |
| Display (H1 de nota, nome do personagem) | Bodoni Seventy-Two ITC Book | **Bodoni Moda** (variável, com eixo de tamanho óptico) | 400 |
| UI, tabelas, números, microtipografia | Gill Sans | **Cabin**, sans humanista desenhada com inspiração em Johnston e Gill | 400, 500, 600 |

Ressalvas:

- **Cormorant em tela**: o olho é pequeno e o peso Light some em tamanhos de UI. Por isso o texto do app usa peso 500, corpo mínimo de 18 px e nunca Light abaixo de 24 px. Se a leitura longa no vault cansar, a troca recomendada para o corpo é **EB Garamond** (OFL), mantendo Cormorant nos títulos.
- **Versalete**: Cabin não tem versalete verdadeiro. Os cabeçalhos de tabela usam caixa alta, corpo menor e espaçamento de 0,08 em.
- **Números**: em trackers e tabelas, usar `font-variant-numeric: tabular-nums` na fonte sans.
- **Fontes da ficha não adotadas**: Arno Pro, Gill Sans, Bodoni 72 e Myriad Pro são comerciais e não entram no app.

---

## 4. Estilo

### Ficha

- **Papel limpo e margens generosas**. A densidade é alta só dentro das seções, nunca entre elas.
- **Réguas com função**:
  - crimson de 1 px, largura total, sob cada título de seção: separa blocos;
  - tinta fina, vertical: separa as colunas de um mesmo bloco;
  - cinza pontilhado: "escreva aqui".
  - Há três pesos visuais e nunca mais que isso numa mesma área.
- **Caixas**: texto livre fica em caixas de borda pontilhada cinza-clara, cantos retos, sem fundo. A única caixa com borda sólida crimson é a dos trackers, o que a destaca como "estado de jogo".
- **Bolinhas e quadrados**: contorno fino na cor da tinta, mais ou menos do tamanho da altura de maiúscula do rótulo, em grupos de 5 com respiro entre grupos. Bolinha indica traço permanente; quadrado indica estado que muda na sessão.
- **Ritmo**: as linhas de atributos, perícias e méritos seguem um passo vertical constante, de cerca de 1,5 vez a altura do rótulo. Os títulos de seção levam mais ou menos uma linha de respiro acima e meia linha abaixo da régua.
- **Ornamentos (não reproduzir)**: moldura dupla com cantos chanfrados, logotipo, marcador em triângulo, selos do rodapé.

### Livro

- **Colunas** (3 por página) separadas por régua vertical preta fina. Não há caixas em volta do texto.
- **Hierarquia por cor e tamanho**, não por fundo:
  - display Bodoni preto e grande;
  - título de seção Cormorant Bold crimson;
  - corpo Cormorant Light preto;
  - parágrafo de destaque inteiro em crimson regular.
- **Espaçamento vertical assimétrico**: título com muito ar acima (cerca de 2 linhas) e quase nenhum abaixo, colado ao texto que encabeça.
- **Listas**: marcador quadrado sólido preto, com recuo pendente.
- **Tabelas**: sem réguas verticais, com régua horizontal fina preta entre linhas e zebra `#f0e2df` em linhas alternadas. Cabeçalho em sans bold, versalete, alinhado ao topo. Corpo em sans Light, um ponto menor que o texto corrido.
- **Microtipografia**: cabeçalho corrente em sans, caixa alta, espaçamento muito largo e crimson; número de página centralizado, cinza e espaçado.

### Tradução para o app

| Elemento | Regra |
| --- | --- |
| Fundo | Papel branco em toda a superfície. Painéis se distinguem por régua, não por fundo cinza. |
| Seção | Título em caixa alta espaçada com régua crimson embaixo, como na ficha. |
| Divisão interna | Régua fina na cor da tinta, vertical ou horizontal. |
| Campo editável vazio | Linha pontilhada cinza (decorativa). Controles de entrada usam `--color-border-strong` para cumprir 3:1. |
| Seleção, linha ativa, hover | Tinta rosada `#f0e2df`, como a zebra do livro. |
| Destaque | Crimson em texto ou régua. Fundo crimson só em botão primário. |
| Cantos | Retos. Raio só onde a forma é a informação (bolinhas). Exceção decidida depois (`vampire-pages/CLAUDE.md`, protótipo A): a moldura "Trackers & The Blood" da ficha de impressão usa cantos cortados com `clip-path`, um desenho próprio e não a moldura do livro. |
| Sombra | Nenhuma no fluxo. No máximo uma sombra discreta em janelas flutuantes, a definir com o tema escuro. |

---

## 5. Rascunho de tokens CSS

### Regras

1. **Hex só existe em `--palette-*`**. Componentes nunca leem `--palette-*`: leem apenas os tokens semânticos (`--color-*`, `--space-*`, `--font-*`, `--radius-*`, `--border-*`).
2. **Tema claro é o padrão** e vive em `:root`.
3. **Tema escuro (futuro)**: um bloco `:root[data-theme="dark"]` sobrescreve **os mesmos nomes semânticos**, sem renomear nada e sem tocar nos componentes. Ele poderá acrescentar primitivas próprias (`--palette-*`) se precisar.
4. **Escalas em `rem`**: o usuário pode aumentar a fonte do navegador.

```css
/* tokens.css: primitives, then semantic tokens (light theme is the default) */

:root {
  color-scheme: light;

  /* ---------- Palette primitives: the ONLY place with raw hex ---------- */
  --palette-paper: #ffffff;        /* sheet + book background */
  --palette-paper-tint: #f0e2df;   /* book table zebra */
  --palette-ink: #231f20;          /* sheet ink, warm black */
  --palette-ink-muted: #5e5a5b;    /* derived from ink hue, 6.8:1 on paper */
  --palette-ink-subtle: #757172;   /* derived from ink hue, 4.8:1 on paper */
  --palette-graphite: #9d9d9d;     /* sheet dotted leaders, decorative only */
  --palette-mist: #c8c7c7;         /* sheet dotted boxes, decorative only */
  --palette-rose: #dcc3c7;         /* sheet frame edge, decorative only */
  --palette-crimson: #790914;      /* book accent (sheet: #730e1e) */
  --palette-crimson-deep: #5c0610; /* derived, hover/pressed, 14.1:1 on paper */

  /* ---------- Semantic colors: components read only these ---------- */
  --color-surface: var(--palette-paper);
  --color-surface-raised: var(--palette-paper);
  --color-surface-tint: var(--palette-paper-tint);

  --color-text: var(--palette-ink);
  --color-text-muted: var(--palette-ink-muted);
  --color-text-subtle: var(--palette-ink-subtle);
  --color-text-accent: var(--palette-crimson);
  --color-text-on-accent: var(--palette-paper);

  --color-border: var(--palette-mist);          /* decorative boxes */
  --color-border-strong: var(--palette-ink);    /* inputs, controls, dots */
  --color-border-accent: var(--palette-rose);   /* edge of tinted/selected areas */
  --color-rule: var(--palette-crimson);         /* section rules */
  --color-divider: var(--palette-ink);          /* thin column/row rules */
  --color-leader: var(--palette-graphite);      /* dotted write-in lines */

  --color-accent: var(--palette-crimson);
  --color-accent-hover: var(--palette-crimson-deep);
  --color-accent-subtle: var(--palette-paper-tint);
  --color-focus-ring: var(--palette-crimson);

  --color-trait-border: var(--palette-ink);
  --color-trait-empty: var(--palette-paper);
  --color-trait-filled: var(--palette-ink);
  --color-trait-marked: var(--palette-crimson); /* hunger, damage */

  /* ---------- Space: 4px base ---------- */
  --space-0: 0;
  --space-1: 0.25rem;  /*  4px */
  --space-2: 0.5rem;   /*  8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */

  /* ---------- Typography ---------- */
  --font-serif: "Cormorant Garamond", "EB Garamond", Garamond, Georgia, serif;
  --font-display: "Bodoni Moda", "Bodoni 72", Didot, Georgia, serif;
  --font-sans: "Cabin", "Gill Sans", "Gill Sans MT", Calibri, system-ui, sans-serif;

  --font-size-2xs: 0.6875rem; /* 11px running heads, tracked caps */
  --font-size-xs: 0.8125rem;  /* 13px sans table cells, captions */
  --font-size-sm: 1rem;       /* 16px sans UI, serif labels */
  --font-size-md: 1.125rem;   /* 18px serif body (Cormorant needs it) */
  --font-size-lg: 1.375rem;   /* 22px section titles in caps */
  --font-size-xl: 1.75rem;    /* 28px crimson section headings */
  --font-size-2xl: 2.5rem;    /* 40px display */
  --font-size-3xl: 3.25rem;   /* 52px display, large screens */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.1;
  --line-height-snug: 1.25;
  --line-height-normal: 1.5;

  --letter-spacing-normal: 0;
  --letter-spacing-caps: 0.12em;     /* section titles */
  --letter-spacing-smallcaps: 0.08em;/* table headers */
  --letter-spacing-wide: 0.28em;     /* running heads, page numbers */

  /* ---------- Radius ---------- */
  --radius-none: 0;
  --radius-sm: 2px;     /* inputs, buttons: barely softened */
  --radius-md: 4px;     /* floating windows, if ever needed */
  --radius-full: 9999px;/* trait dots */

  /* ---------- Borders ---------- */
  --border-width-hairline: 1px;
  --border-width-thick: 2px;
  --border-width-focus: 2px;
}

/* Future dark theme: override the SAME semantic names here (and add
   dark --palette-* primitives if needed). Components stay untouched.
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-surface: ...;
  --color-text: ...;
  ...
}
*/
```

### Exemplo de uso (ilustrativo)

```css
.section-title {
  font: var(--font-weight-semibold) var(--font-size-lg) / var(--line-height-tight) var(--font-serif);
  letter-spacing: var(--letter-spacing-caps);
  text-transform: uppercase;
  text-align: center;
  color: var(--color-text);
  padding-block-end: var(--space-1);
  border-block-end: var(--border-width-hairline) solid var(--color-rule);
  margin-block: var(--space-6) var(--space-3);
}

.trait-dot {
  inline-size: 0.75em;
  block-size: 0.75em;
  border: var(--border-width-hairline) solid var(--color-trait-border);
  border-radius: var(--radius-full);
  background: var(--color-trait-empty);
}
.trait-dot[data-filled="true"] { background: var(--color-trait-filled); }
```

---

## 6. Decisões em aberto

- **Cor de "perigo"** (excluir ficha, erro de import): o crimson é a cor da marca e não deve dobrar como alerta. Falta definir se o app terá uma cor de erro própria ou se usará ícone e texto sobre o acento.
- **Fonte do corpo**: Cormorant Garamond 500 a 18 px ou EB Garamond no texto longo do vault. Decidir depois de um teste de leitura em tela.
- **Tema escuro**: a estrutura está pronta. Os valores não foram propostos, porque as referências são todas em papel claro.
- **Tokens ainda não definidos**: z-index, sombra, breakpoints e duração de animação. O inventário do app anterior (`docs/INVENTARIO.md`) mostrou que a falta deles gerou valores mágicos; definir antes do primeiro componente flutuante.
