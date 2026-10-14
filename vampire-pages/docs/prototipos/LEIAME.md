# Protótipos da ficha (Vampire Pages) — snapshot de 2026-10-14 (noite)

Estado das pranchas do canvas "Vampire Pages: protótipos da ficha" (artefato Design). Tema claro, tokens do `design-spec.md`.

## Arquivos
- `ficha-A-Main.dc.html` — **A · Ficha fiel (página 1)**. Layout de **impressão** (um A4, sem scroll): todos os círculos e caixas visíveis (Saúde 12, Willpower 12, Fome 5, Humanidade 10), campos de texto editáveis (especialização das perícias, nomes das disciplinas, campos do The Blood). Seção "Trackers & The Blood" com 4 colunas e separadores verticais.
- `ficha-B-FichaPainel.dc.html` — **B · Ficha de mesa com painel de referência**. Clique em atributo, perícia, disciplina, poder, identidade ou tracker abre o texto de referência. Modo leitura (olho carmesim) e exportação JSON/PDF ao lado do nome.
- `ficha-C-FichaApp.dc.html` — **C · Aplicação completa**: menu lateral (Fichas > Mesa/personagem, Vault, Backlog, **Raw PDF**), Mesa com 8 personagens de exemplo, ficha em 2 páginas (Capacidades / Sangue e Crença), importar/exportar, modais, toast. "Raw PDF" mostra uma cópia da ficha A (estado próprio).
- `canvas.json` — índice do canvas (A, B, C).

## Decisões vigentes
- Trackers: círculos definem o máximo, caixas só até o máximo (B e C); caixa: 0 vazia, 1 superficial (barra), 2 agravada (cheia). Fome 5, Humanidade 10 em dois grupos de 5. Na B/C, Saúde cap 20 e Willpower cap 15 (A usa 12/12); lápis carmesim edita o máximo, ícone de salvar confirma e preserva o dano.
- Rótulos: Saúde, Willpower, Fome, Humanidade; identidade: Nome, Clã, Facção, Predator Type, Geração, Crônica, Ambição, Desejo; perícias Animal Handling e Ocultismo; "Compulsão de Clã" na A. Mistura pt/en é intencional.
- JSON de import/export: `{ "schemaVersion": 1, "fichas": [...] }` (ficha única = array de 1; formato legado do fork do Pedro é embrulhado automaticamente).
- A sincronização entre Mesa e ficha existe só dentro da C (estado por personagem). A, B e C são protótipos independentes.
- "Narrativa" fica reservada para uma futura área de história/notas.

## Pendências conhecidas
- Padronizar caps (12/12) na B e na C se desejado; "Clan Bane" e "Player" ainda em inglês.
- A página 2 da ficha A não existe ainda (Raw PDF deve mostrar as duas quando existir).
- B: exportar PDF apenas chama `window.print()`; no app o PDF deve usar o layout da A.
- Próximo passo: transformar a C em tarefas para o Claude Code (shell React, store/schema, validação de import/export, Mesa, página 2).

## Restaurar
Republicar cada arquivo no artefato (`project/<nome>.dc.html`) e o `canvas.json`.
