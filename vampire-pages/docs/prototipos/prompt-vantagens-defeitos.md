# Tarefa 2b: catálogo de Vantagens e Desvantagens (Advantages/Flaws)

Objetivo: o app mapeia cada vantagem/desvantagem da ficha (Merits, Backgrounds, Flaws) para uma entrada do catálogo, e a ficha B abre o painel de referência ao clicar, como nas disciplinas. A fonte do catálogo deve ser o vault, no mesmo formato de `O Sangue (Vitae)/Disciplinas.md`.

Ainda **não escreva nada**; quero um relatório e uma proposta.

## 1. Ler o que o Pedro já tem (somente leitura, remote `pedro`)
- `src/app/data/advantages.json`: 37 registros `{name, type: 1 | -1, maxLevel, description}` (16 vantagens, 21 falhas).
- `src/app/ankh/coreAdvantages.ts`: `CORE_ADVANTAGES: Record<string, CoreAdvantage>` (cerca de 84 entradas, com `source` no formato `'CORE · P. nnn'`).
- `src/app/types/character.ts`: `AdvantageEntry`, `AdvantageDef`.
- `src/app/ankh/references.ts` (`advantageReference`, retorna `AdvantageReference {kind, source, body, levels[]}`, com placeholder quando não acha) e `useSheetDialogs.tsx` (`addAdvantage`, o modal que adiciona/mapeia; seleção `{kind: 'advantage', list: 'advantage' | 'flaw', index}`).
- Responda: como ele casa o nome digitado com a entrada do catálogo (chave exata? normalização? alias?), e como lida com nomes sem correspondência.

## 2. Ler o que eu já tenho no vault
- `O Sangue (Vitae)/Disciplinas.md`: um arquivo só; H1 por disciplina; H2 "Regras Gerais de X" e "X - Poderes Nível N"; H3 por poder; dentro, um blockquote com `Custo`, `Duração`, `Dice Pools` e `System (Regras)`; links `[[...]]` para as regras.
- `Advantages.md`: hoje só tem os títulos "Merits" e "Backgrounds" (vazio). Outras notas já apontam para ele: `[[Advantages#Merits|Méritos]]`, `[[Advantages#Backgrounds|Antecedentes]]` e `[[Advantages|Defeito]]` (em `Fome, a Caça e a Besta/Predator Type.md` e `O Sangue (Vitae)/Clãs.md`). Não quebre esses links.

## 3. Propor (sem escrever ainda)
- Estrutura de `Advantages.md` espelhando `Disciplinas.md`: H1 Merits / Backgrounds / Flaws, H3 por item, blockquote com pontos/níveis, tipo, descrição e regras. Proponha também o ajuste dos links `[[Advantages|Defeito]]` para `#Flaws`.
- Nomes canônicos em inglês (como no livro) e aliases em português (Fama, Rebanho, Inimigos, Segredo Sombrio, Exclusão de Presa, Lenda Mítica...), para o app mapear "Contatos" em Contacts.
- Como o app lê isso: parser das notas do vault por heading (a mesma lógica que servirá para Disciplinas), e não um JSON paralelo. Mostre o formato intermediário.
- Ordem de preenchimento: **primeiro** só os itens usados nas fichas da Auld Sanguine e nos Predator Types (cerca de 25), depois o restante.

## 4. Decisão de direito autoral (para eu decidir, não você)
O `INVENTARIO.md` registra que o fork do Pedro traz cerca de 470 KB de texto de regras traduzido, e o README dele declara projeto de fã não licenciado. Diga o que seria copiado do Pedro e o que seria escrito por mim/por você a partir do livro, para eu escolher. O app é de uso privado; não publicar o catálogo.

Quando eu aprovar a proposta, popule `Advantages.md` em lotes pequenos e me mostre o diff de cada lote.
