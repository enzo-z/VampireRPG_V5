# Handoff: Cola do Jogador, página 2 (Gideon)

Branch `worktree-cola-player-page` (parte de `ficha-app` em `58f774b`). Dois commits: `vault:` (notas) e `feat:` (app). Nada enviado ao remoto.

## O que é
A **página 2 da Cola** é específica de **um personagem**: o que ele rola (poderes, reservas) e o **lore de Nova York que ele sabe**. É uma A4 separada da página 1 (que é igual para todos). Hoje existe só para o **Gideon Nicols**.

## Como usar no app
1. Abra o menu **⋯** da ficha (na ficha ou no card da Mesa) e escolha **"Cola do jogador (página 2)"**.
2. A tela cheia mostra a página, com **Voltar** e **Imprimir / salvar PDF** (A4, margens padrão), igual à página 1.
3. Se algo não couber, aparece o aviso de transbordo (coluna ou faixa). Avisos do vault (poder sem linha `Cola`, personagem sem nota, nome não encontrado) aparecem só na tela, nunca no papel.
4. O item "Cola do jogador" do menu lateral continua abrindo a **página 1**.

## O que a página mostra
- **Cabeçalho:** nome, Clã · Predator Type · Geração · Blood Potency; Ambição e Desejo (como estão na ficha).
- **Esquerda:** Disciplinas com os poderes da ficha (nome em carmesim e negrito, nível, Custo/Duração/Dice Pool e a linha **Cola**), **Reservas fortes** e o bloco **Facções e organizações**.
- **Direita:** **A corte de Nova York**, **NPCs que você conhece** e **Jogadores (a coterie)**.
- **Faixa de baixo:** **Nova York por distrito**, em três colunas.
- Os itens dos blocos laterais levam um **◆ carmesim** como marcador ("◆ Camarilla: texto").
- Saíram: Clã, Predator Type, Blood Potency e Vantagens/Defeitos.

## De onde vem cada coisa
| Parte da página | Fonte |
|---|---|
| Poderes, Custo, Duração, Dice Pool | `O Sangue (Vitae)/Disciplinas/*.md` (campos do bloco `>`) |
| Resumo curto do poder | linha `- **Cola**: …` no bloco do poder (Auspex, Celerity, Potence: 5 poderes do Gideon) |
| Lore (corte, NPCs, jogadores, facções, distritos) | `Regras/Colas dos Jogadores/Gideon Nicols.md` |
| Reservas fortes | ficha: maior atributo + perícia com 3 ou mais pontos |

### Regras do campo `Cola` nos poderes
- Com linha `Cola`: Custo, Duração e Dice Pool só aparecem se forem curtos (até 60 caracteres). Os longos (sub-parágrafos de regra) ficam de fora, e **a linha `Cola` precisa cobrir essas regras**.
- Sem linha `Cola`: os campos saem inteiros e a tela mostra um aviso.
- Ao escrever uma `Cola`, confira o que o campo longo dizia (ex.: Heightened Senses: sensação extrema, −3 dados, Willpower).

### Nota de lore por personagem
- Pasta `Regras/Colas dos Jogadores/`, **um arquivo por personagem**, com o nome do personagem. A ficha casa pelo nome com tolerância (acento, maiúscula, "Nichols"/"Nicols").
- Frontmatter com `publicar: true`. Cada `##` é um bloco; cada `###`, um verbete ("◆ Termo: texto").
- **Posição dos blocos fixa por título** (`PlayerColaPage.tsx`): "Facções e organizações" na esquerda; "Nova York por distrito" na faixa de baixo; **qualquer outro título vai para a direita**.
- **Só entra o que o personagem sabe e pode ficar à vista na mesa.** No Gideon ficam de fora: clã e nome verdadeiro de Gusman, Mary Winchester, a suspeita sobre Vincent, a suspeita sobre o sire de Khalid. Um teste barra esses termos.

## Código
- `src/features/cola/playerCola.ts`: função pura `buildPlayerCola(ficha, catálogos)` → modelo da página (disciplinas, reservas, lore, avisos).
- `src/features/cola/PlayerColaPage.tsx` + `.module.css`: a A4 (reaproveita o quadro da página 1 por `composes`).
- `src/features/cola/ColaView.tsx`: ganhou a prop opcional `ficha`; sem ela é a página 1.
- `src/catalog/playerColas.ts` (busca por nome), `playerColasCatalog.ts` e `virtual-player-colas.d.ts`; `vite/buildPlayerColas.ts` lê a pasta com o parser da Cola (`buildCola`); módulo `virtual:player-colas` em `vite.config.ts`.
- `App.tsx`: view `{ name: 'cola'; fichaId? }`. `FichaActions`, `MesaCard`, `MesaView`, `SheetHeader` e `SheetPage` ganharam `onCola`.
- Testes: `playerCola.test.ts` (contra as notas reais: poderes achados, Cola presente, lore com os blocos esperados, corte com os nomes, **segredos fora**, nome com tolerância).

## Como criar a página 2 de outro jogador
1. Converta a ficha para o app (já existe a do Gideon em `docs/players/fichas/`; as outras ainda não).
2. Escreva as linhas `Cola` dos poderes dele nas notas de Disciplinas (revise no Obsidian).
3. Crie `Regras/Colas dos Jogadores/<Personagem>.md` seguindo a do Gideon, só com o que o personagem sabe.
4. Abra a Cola pelo menu ⋯ e revise o PDF. Aperte o texto se o aviso de transbordo aparecer.

## Verificação
- `cd vampire-pages && npm run check` (tsc + vitest, 263 testes) e `npm run build`.
- E2E (fora do repo, pode sumir): `%TEMP%\vp-e2e\run-wt.ps1 -Script check-cola-player.mjs` sobe o vite do worktree na porta 5197, importa `docs/players/fichas/gideon.json`, abre o menu ⋯ → Cola, confere que não há transbordo nem aviso e gera `shots\cola-gideon.pdf`. Renderizar com `pdftoppm`.
- A folha está **justa** (direita com ~57 px de folga, esquerda ~100 px). Uma frase a mais pode acionar o aviso.

## Decisões a lembrar
- "Reservas fortes" usa o maior atributo da ficha; é ponto de partida, o Narrador define o par.
- Vantagens e Defeitos saíram da página; as linhas `Cola` para elas (Resources, Herd, Status…) ficaram como ideia futura.
- Gusman aparece só como "seu protegido (Mawla)"; Jesse e Herta aparecem como "você ainda não os conhece".
- Calebros foi citado só no Príncipe; Ivo Rask ficou de fora, por espaço.

## Pendências
- Outras fichas (Nina, Khalid, Daniel, Jesse, Gusman, Herta) ainda não foram convertidas; sem ficha não há página 2.
- Confirmar com Victor Polck os textos de Elias e dos intermediários (já marcados como "a validar" nas notas do Narrador).
- Gideon: Streetwise 1 e Occult 0 confirmados pelo Enzo; nada pendente na ficha.
