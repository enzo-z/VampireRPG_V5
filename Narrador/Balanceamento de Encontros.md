#rules #combat #important #concept #narrador

> Guia do Narrador para dosar combate, perseguições e cenas de pressão em V5. Reúne regras que já estão neste vault, matemática de dados calculada para esta nota e conselhos de fontes externas.
> Etiquetas de origem: **[VAULT]** = regra de outra nota deste vault; **[WEB]** = fonte externa citada no fim; **[CALC]** = cálculo meu (assunções declaradas); **[SUG]** = sugestão minha, não é regra do livro.

### Sumário
- [[#Princípios de V5 que mudam o balanceamento|Princípios de V5 que mudam o balanceamento]]
- [[#Matemática dos dados|Matemática dos dados]]
    - [[#Chance de sucesso por pool e Dificuldade|Chance de sucesso por pool e Dificuldade]]
    - [[#Fome nas rolagens|Fome nas rolagens]]
- [[#Calibrando Dificuldade e pools|Calibrando Dificuldade e pools]]
- [[#Dano e sobrevivência|Dano e sobrevivência]]
- [[#Idade, geração e "childers"|Idade, geração e "childers"]]
- [[#Montando o encontro|Montando o encontro]]
    - [[#Economia de ações (grupos grandes)|Economia de ações (grupos grandes)]]
    - [[#Alavancas de ajuste|Alavancas de ajuste]]
    - [[#Checklist rápido|Checklist rápido]]
- [[#Pacing para mesas grandes|Pacing para mesas grandes]]
- [[#Limites desta nota|Limites desta nota]]
- [[#Fontes|Fontes]]

---
# Princípios de V5 que mudam o balanceamento

1. **O inimigo mais perigoso costuma ser a própria Fome, a Máscara ou o relógio, não os pontos de vida.** Um combate bem balanceado em V5 pressiona recursos (Fome, Força de Vontade, Humanidade, Máscara), não só Saúde. **[WEB]** (By Night Studios, "This Mortal Coil": mortais e caçadores são a maior ameaça aos vampiros, e a Besta transforma encontros comuns em risco.)
2. **Vencer ou perder o contest decide quase tudo.** Em um conflito, quem tem mais sucessos vence o turno e aplica a **margem** (mais o dano da arma) ao adversário. Perder o contest significa que o seu ataque não causa nada. **[VAULT]** [[Dificuldade, Contests e Conflitos#Resolvendo as Pools e Dano|Resolvendo as Pools e Dano]]
3. **Poucos turnos.** O livro recomenda encerrar a maioria dos conflitos em cerca de **três turnos**, com saídas narrativas para quando ninguém caiu. **[VAULT]** [[Dificuldade, Contests e Conflitos#Três Turnos e Fora|Três Turnos e Fora]]
4. **Armas comuns só causam dano Superficial em vampiros** (que é dividido pela metade, arredondando para cima). Perigo real vem de fogo, luz solar, garras e presas de criaturas e de estacas. **[VAULT]** [[Dano]]
5. **Disciplinas raramente ajudam a ganhar o contest, e sim a causar mais dano depois ou a evitar o combate.** Potence soma dano só depois de vencer; Fortitude reduz dano; Dominate e Presence resolvem sem lutar. **[WEB]** (Strange Assembly sobre V5; thread de V20 no mesmo sentido, de outra edição.)

> ⚠️ Combate em V5 é um **evento de risco**, não o prato principal. Na dúvida, prefira poucos inimigos bem posicionados a muitos inimigos genéricos, e dê aos jogadores uma saída antes de o grupo todo ficar Incapacitado. **[SUG]**

---
# Matemática dos dados

Cada dado é um d10: **6 ou mais** é sucesso. Cada **par de 10s** vale **+2 sucessos** além dos 10s (então um par rende 4 no total). Dados de Fome contam como sucesso normalmente. **[CALC]** com a regra básica de V5 (ver [[Entendendo Dados e Ficha]]).

## Chance de sucesso por pool e Dificuldade

Probabilidade de **alcançar ao menos** a Dificuldade (arredondada). **[CALC]** (cálculo exato, sem Willpower).

| Pool | Dif. 1 | Dif. 2 | Dif. 3 | Dif. 4 | Dif. 5 | Dif. 6 |
|---|---|---|---|---|---|---|
| 3 | 88% | 50% | 14% | 3% | 1% | 0% |
| 4 | 94% | 69% | 33% | 10% | 4% | 1% |
| 5 | 97% | 81% | 51% | 23% | 9% | 4% |
| 6 | 98% | 89% | 67% | 39% | 18% | 8% |
| 7 | 99% | 94% | 78% | 54% | 30% | 16% |
| 8 | 100% | 96% | 86% | 66% | 44% | 25% |
| 9 | 100% | 98% | 91% | 77% | 56% | 36% |
| 10 | 100% | 99% | 95% | 84% | 67% | 48% |
| 11 | 100% | 99% | 97% | 90% | 76% | 59% |
| 12 | 100% | 100% | 98% | 93% | 83% | 69% |

**Sucessos esperados** por rolagem: pool 4 ≈ 2,1; pool 6 ≈ 3,2; pool 8 ≈ 4,4; pool 10 ≈ 5,5.

> 🧩 **Dica para o Narrador:**
> - **+2 dados ≈ −1 de Dificuldade**, em média (o próprio livro diz isso). Use um ou outro, nunca os dois ao mesmo tempo. **[VAULT]** [[Dificuldade, Contests e Conflitos#Modificador de Dificuldade|Modificador de Dificuldade]]
> - Limite recomendado para ajustes improvisados: **±2 de Dificuldade** ou **±3 dados**. **[VAULT]**
> - Dificuldade 5 é quase impossível para quem não é especialista; a faixa "normal" é **2 a 4**. **[WEB]**

## Fome nas rolagens

A Fome troca dados normais por dados de Fome (mesma chance de sucesso). O que muda é o **risco**: um 10 num dado de Fome em um crítico vira **Messy Critical**; um 1 num dado de Fome numa falha vira **Bestial Failure**. **[CALC]**, Fome 2, contra Dificuldade 3:

| Pool | Messy Critical | Bestial Failure |
|---|---|---|
| 4 | 4% | 16% |
| 5 | 6% | 13% |
| 6 | 7% | 9% |
| 8 | 9% | 4% |

Pools pequenas com Fome alta são as mais perigosas (com Fome 3 e uma pool de 3, **todos** os dados são de Fome). **[WEB]** Isso é uma ferramenta de narrativa, não só de pressão numérica.

---
# Calibrando Dificuldade e pools

Escala para pools de **NPCs** usada como régua neste vault. **[CALC]/[SUG]**, derivada das fichas de *Auld Sanguine* (ver [[Auld Sanguine - Balanceamento]]) e de análises de V5.

| Perfil do oponente | Pool típica | Observação |
|---|---|---|
| Mortal comum, sem treino | 2 a 3 | Quase nunca ganha de um vampiro em contest direto |
| Capanga, segurança, brigão | 3 a 4 | Perigoso em grupo ou com arma de fogo |
| Mortal treinado/equipado (caçador amador) | 4 a 5 (perícia principal 5 a 7) | Vira ameaça real em número, de surpresa ou com estaca |
| Profissional/elite mortal | 6 a 8 | Equivale a um neonato competente |
| Neonato/Anarch bem construído | 6 a 9 | Disciplinas e Fortitude fazem a diferença |
| Ancillae ou líder local | 8 a 10+ | Só como chefe, sempre com algo que justifique (Disciplina, aliados, terreno) |

> 🧩 **Dica para o Narrador:** pools de **3 dados** são fracas em V5 (um 3-dado contra Dificuldade 3 é cerca de 14%). Um personagem de 3 dados é, na prática, um brigão de bar. **[WEB]/[CALC]**

---
# Dano e sobrevivência

Resumo para dimensionar ameaça, tirado das regras do vault. **[VAULT]** [[Dano]] e [[Dificuldade, Contests e Conflitos#Múltiplos Oponentes|Múltiplos Oponentes]]

- **Dano = margem + dano da arma.** Em vampiros, o dano Superficial é dividido pela metade (arredondado para cima). Exemplo: pistola grande (+3) com margem 2 → 5 → **3** caixas Superficiais num vampiro.
- **Incapacitado (Impaired):** quando o tracker enche, o personagem perde **2 dados** em pools físicos (Saúde) ou sociais/mentais (Força de Vontade). Dano extra depois disso aciona **Crippling Injuries**.
- **Armadura:** cada ponto converte 1 de dano Agravado de armas cortantes/perfurantes em Superficial, útil sobretudo para mortais.
- **Múltiplos oponentes:** o defensor perde **1 dado por atacante adicional**; o atacante precisa **dividir** a pool entre alvos. Em V5, ser cercado dói muito mais do que cercar.
- **Cobertura:** sem cobertura −2 dados na defesa; cobertura melhorada +1; superior +2.
- **Crítico contra mortal sem nome:** o mortal é incapacitado direto; Messy Critical costuma matar. Use para acelerar.
- **Vampiros e dano Agravado:** fogo, sol e criaturas sobrenaturais. Reserve para o clímax, porque é o que realmente ameaça o vampiro.

> ⚠️ Assumi nos cálculos que a divisão pela metade vale para o dano recebido por **vampiros** e não por mortais. Confira essa regra no livro básico antes de depender dela. **[CALC]**

---
# Idade, geração e "childers"

Definições do livro, conforme [[Gerações e Potência#Idade e Geração|Gerações e Potência]]: **[VAULT]**

| Faixa | Abraçados | Geração típica |
|---|---|---|
| **Childer / Fledgling** | nos últimos **15 anos** (ou até "noite passada", em crônicas focadas em childers) | 12ª ou 13ª (14ª–16ª se Sangue-Ralo) |
| **Neonate** | dentro de uma vida humana (da Segunda Guerra ao presente) | 12ª ou 13ª |
| **Ancilla** | entre a Revolução Americana e a Segunda Guerra | 10ª ou 11ª |
| **Elder** | mais de 250 anos | 9ª ou inferior |

**O que isso significa para balanceamento:**
- **Childer e neonato podem ter exatamente o mesmo poder bruto.** Ambos são 12ª ou 13ª geração e normalmente **Blood Potency 1**. A diferença é de **experiência e status**, não de dados. **[VAULT]**
- "Childe" também descreve a **relação com o sire**: um childe recém-Abraçado fica sob o cuidado e a responsabilidade do sire (o "Accounting") até ser reconhecido. **[WEB]** (White Wolf wiki, de edições anteriores.)
- Se as fichas dos "childers" forem **mais fracas por XP**, compense com **recursos narrativos** (Aliados, Pilares, apoio de um sire, informação), não com Saúde ou pools de NPC mais fracas, que viram vitória fácil para uns e frustração para outros. **[SUG]**
- Se forem **mais fortes ou iguais**, diferencie pelo **papel social**: childers dependem de proteção, favores e podem ser "emprestados" pelo sire; neonatos já têm obrigações e reputação. **[SUG]**

> ⚠️ Se a ideia for usar a regra dos 15 anos de forma estrita, o ano da crônica é o que define quem é childer: o mesmo personagem pode ser childer em um ano e neonato em outro.

---
# Montando o encontro

## Economia de ações (grupos grandes)

- Mais jogadores = **mais ações por turno**. Em V5, cada PC age uma vez e, ao dividir ataques, perde dados; o grupo grande sofre menos disso porque **cada PC pode focar um alvo diferente**. **[VAULT]/[SUG]**
- Por isso, **aumente o número de corpos** e não as pools dos NPCs. Dobrar o número de inimigos aumenta a pressão mais do que aumentar uma pool de 5 para 7. **[SUG]**
- Referência rápida: em uma simulação simples, 8 PCs contra "4 caçadores + chefe + atirador" (pools de 5, 8 e 5) terminam em cerca de **4–5 turnos** com poucos PCs Incapacitados; 6 caçadores é um ponto mais tenso, e 8 é puxado. Ver [[Auld Sanguine - Balanceamento]] para a tabela e as assunções. **[CALC]**
- Prefira **um grupo grande dividido em frentes** (dois ou três locais) a uma única arena com todos juntos: cada PC tem algo para fazer e o Narrador não precisa de 8 turnos por rodada. **[SUG]**

## Alavancas de ajuste

Do mais suave ao mais forte (use uma por vez): **[SUG]**

1. **Posição e cobertura** (±1 a ±2 dados de defesa/ataque).
2. **Número de inimigos** (+1 a +3 corpos, ou reforços em ondas).
3. **Pressão de tempo** (relógio, polícia, amanhecer, ultimato).
4. **Tipo de dano** (uma fonte de dano Agravado como fogo ou prata no clímax).
5. **Objetivo diferente de "matar"** (proteger, escapar, desativar, impedir testemunhas).
6. **Aliados de última hora ou retirada** (para salvar uma cena que desandou).

Evite empilhar vários ajustes: o limite do livro para improvisos é **±2 de Dificuldade** ou **±3 dados**.

## Checklist rápido

- [ ] Qual é o **objetivo** da cena, além de derrotar o inimigo?
- [ ] O que pode **dar errado além de dano** (Máscara, Fome, testemunha, Segunda Inquisição)?
- [ ] Qual é a **saída** se o grupo estiver perdendo? E se estiver ganhando fácil?
- [ ] Quantos turnos eu quero? (alvo: **3**, no máximo 4 ou 5)
- [ ] Cada PC tem **algo útil** para fazer neste encontro?

---
# Pacing para mesas grandes

Dicas para 6 ou mais jogadores. **[VAULT]** onde indicado; o resto é **[SUG]**.

- **Declaração simultânea:** no início de cada turno, todos declaram a intenção; o Narrador decide as ações dos NPCs e depois pede as pools. **[VAULT]** [[Dificuldade, Contests e Conflitos#Início de Cada Turno|Início de Cada Turno]]
- **Ordem simplificada:** corpo a corpo em andamento, depois à distância, depois combate iniciado neste turno, depois outras ações. **[VAULT]** [[Dificuldade, Contests e Conflitos#Quem Vai Primeiro?|Quem Vai Primeiro?]]
- **NPCs em bando:** resolva capangas como **grupo** (uma rolagem representa vários), e reserve rolagens individuais para chefes.
- **Ajuda e ações menores:** incentive jogadores a combinar esforços em uma rolagem, em vez de oito ataques separados.
- **Cortes de cena:** use as quatro saídas de "Três Turnos e Fora" (recuo, inimigos recuam, vitória por resultados, mudar a situação). **[VAULT]**
- **Spotlight:** em cenas sociais, dê a cada PC um papel; evite que um único jogador role por todos.
- **Fome:** lembre Rouse Checks em voz alta, porque com muitos jogadores é fácil esquecer.

---
# Limites desta nota

- Não consegui acessar o texto do **Storyteller's Toolkit** nem o capítulo de Narrador do livro básico de V5; as regras de combate aqui vêm das notas deste vault, e os conselhos externos são de blogs, wikis e fóruns, parte deles de **outras edições** (indicado onde aplicável).
- Os números de **[CALC]** são meus, em condições simplificadas, e servem como régua, não como regra oficial.
- Valores específicos (pools de NPCs, números de inimigos) podem precisar de ajuste na mesa.

---
# Fontes

- Notas do próprio vault: [[Dano]], [[Dificuldade, Contests e Conflitos]], [[Regras Avançadas]], [[Gerações e Potência]], [[Entendendo Dados e Ficha]].
- Strange Assembly, "Mechanics and Character Creation in Vampire: the Masquerade (V5)": https://www.strangeassembly.com/2019/character-optimization-in-vampire-the-masquerade-v5
- By Night Studios, "This Mortal Coil" (conselhos de Narrador; origem MET): https://bynightstudios.com/resources/storyteller-advice/this-mortal-coil
- Roll20, regras básicas de V5 (tipos de dano): https://roll20.net/compendium/vtm/Types%20of%20damage
- White Wolf wiki, "Childe": https://whitewolf.fandom.com/wiki/Childe
- Discussões de fóruns (edições antigas, usadas só para dicas gerais): https://lr.sudovanilla.org/r/WhiteWolfRPG/comments/1ets3j1/20th_vs_v5_for_combat/ e https://lr.sudovanilla.org/r/WhiteWolfRPG/comments/18nl0om/potence_is_op_as_hell
