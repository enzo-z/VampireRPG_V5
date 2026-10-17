#narrador #nova-york #mapa #auld-sanguine

> Descrição do **mapa interativo de Nova York** (Réveillon de 2021) e **fonte de verdade** para mudanças nele. O mapa fica em `vampire-pages/docs/notes/one-shot/mapa-nova-york.html` (abrir no navegador) e publicado em [claude.ai/artifact/DtCnJH6cWK1bUnwWmQsV6G](https://claude.ai/artifact/DtCnJH6cWK1bUnwWmQsV6G).
> Montado em **16/10/2026** a partir de [[Camarilla em Nova York]], [[Personagens da Camarilla de NY]], [[Auld Sanguine - Roteiro da Sessão]], `vampire-pages/docs/notes/one-shot/nova-york.md`, [[Clãs]], [[Sabbat]], [[Semana de Pesadelos]], [[Sangue Ralo]], as notas dos jogadores e [[Auld Sanguine - Laços entre Jogadores]].
> ⚠️ **O mapa precisa ser atualizado** (registrado em 17/10/2026). O Narrador vai liberar a atualização depois de resolver as pendências ou confirmar. Até lá, as seções abaixo descrevem o mapa **como ele está**, não como deveria estar. Ver [[#⚠️ Atualização pendente do mapa]]. Para nomes, cargos e status dos NPCs, a fonte de verdade é [[Elenco de Nova York]].
> Etiquetas de fonte (as mesmas do mapa): **[jogos V5]** *Coteries/Shadows/Reckoning of New York*; **[livro V5]** livros de V5 transcritos; **[notas]** notas do Narrador; **[SUG]** sugestão para a campanha; **[ed. anterior]** livros anteriores a V5.

### Sumário
- [[#Como mudar o mapa|Como mudar o mapa]]
- [[#O que o mapa mostra|O que o mapa mostra]]
- [[#Facções e legenda|Facções e legenda]]
- [[#Visão geral da cidade|Visão geral da cidade]]
- [[#Distritos|Distritos]]
    - [[#Manhattan|Manhattan]]
    - [[#Brooklyn|Brooklyn]]
    - [[#Queens|Queens]]
    - [[#Bronx|Bronx]]
    - [[#Staten Island|Staten Island]]
    - [[#Nova Jersey|Nova Jersey]]
- [[#Pontos do mapa|Pontos do mapa]]
- [[#Fora do mapa|Fora do mapa]]
- [[#Clãs por distrito|Clãs por distrito]]
- [[#Divergências e decisões em aberto|Divergências e decisões em aberto]]
- [[#⚠️ Atualização pendente do mapa|⚠️ Atualização pendente do mapa]]

---
# Como mudar o mapa

1. Edite **esta nota**: troque a facção de um distrito, acrescente um clã, mova ou crie um ponto, resolva uma divergência.
2. Peça ao Claude: *"leia `Narrador/Nova York/Mapa de Nova York.md` e atualize o mapa para corresponder"*. Ele compara a nota com o HTML, edita os dados do mapa e republica o artifact no mesmo link.
3. Em conflito, **vale esta nota**. O HTML só guarda além disso os **contornos** dos distritos (polígonos simplificados) e o estilo; mude esses só se pedir explicitamente.

Correspondência entre as seções e os dados do HTML:

| Seção desta nota | Dado no HTML |
|---|---|
| [[#Facções e legenda]] | `FACTIONS` e as cores `--f-*` |
| [[#Visão geral da cidade]] | painel sem seleção e `COURT` |
| [[#Distritos]] | `BOROS` |
| [[#Pontos do mapa]] | `MARKERS` e `LAYERS` |
| [[#Fora do mapa]] | `EDGES` |
| [[#Clãs por distrito]] | `LEDGER` |
| [[#Divergências e decisões em aberto]] | `NOTES` |

**Regras dos pontos:** coordenadas em graus decimais, **longitude, latitude** (como `-73.9744, 40.7645`; dá para copiar do Google Maps invertendo a ordem). *Aproximado* = as fontes não dão endereço, e o mapa desenha um anel tracejado. *Rótulo à esquerda* serve para evitar sobreposição. Pontos de Manhattan só mostram o rótulo na vista "Manhattan".

---
# O que o mapa mostra

- **Época:** botão **2021** (padrão) ou **Antes de 1999** (Manhattan da Camarilla, o resto do Sabbat). Ao escolher "Antes de 1999", a camada *Batalha de 1999* liga sozinha.
- **Vista:** **Cidade** (cinco distritos, Nova Jersey, Westchester e Nassau) ou **Manhattan** (aproximada).
- **Camadas de pontos** (ligadas por padrão: as três primeiras):

| Camada | Símbolo | Para quê |
|---|---|---|
| Lugares de 2021 | círculo cheio | Lugares Kindred que existem na noite da crônica |
| Coterie | quadrado carmesim | Lugares ligados aos PCs |
| Auld Sanguine | anel carmesim com ponto | Locais da one-shot (sugestões) |
| Batalha de 1999 | losango carmesim vazado | Pontos da Batalha de Nova York |
| História | círculo vazado | Eventos antigos (1830–2008) |

- **Painel lateral:** clicar num distrito mostra facção, área e população (Censo 2020), resumo, clãs com fonte, o "antes de 1999" e os pontos do distrito. Clicar num ponto mostra o texto e a fonte.
- **Abaixo do mapa:** a matriz de clãs por distrito e as divergências.
- Escala em km (5 km na cidade, 2 km em Manhattan) e seta do norte. Projeção simples a partir de lat/lon; norte para cima.

---
# Facções e legenda

| Chave | Nome na legenda | Aparência | Onde em 2021 |
|---|---|---|---|
| `cam` | Camarilla: domínio da corte | carmesim chapado | Manhattan |
| `camSoft` | Camarilla sem senhor único | hachura carmesim | Brooklyn, Queens |
| `anarch` | Anarquistas | ocre chapado | Bronx |
| `anarchSoft` | Anarquistas (base do pós-guerra) | hachura ocre | Staten Island |
| `indep` | Periferia: micro-domínios | listras verde-azuladas | Nova Jersey |
| `sabbat` | Sabbat | hachura escura | só "Antes de 1999" |
| `unk` | Sem dados | pontilhado cinza | Nova Jersey "Antes de 1999" |

---
# Visão geral da cidade

Texto do painel quando nada está selecionado.

**2021, "A cidade de Panhard":** domínio grande, com cerca de 50 Kindred, corte completa e mais de um Xerife. Por fora, estável; por dentro, Callihan morreu em março de 2020, Torque disputa os Anarchs, e o Xerife e a Scourge pressionam a Príncipe por mais dureza. [livro V5] [jogos V5]

**A corte** (lista do painel):

| Nome | Cargo · Clã |
|---|---|
| Hellene Panhard | Príncipe · Ventrue |
| Qadir al-Asmai | Xerife · Toreador |
| Thomas Arturo | Herald · Toreador |
| Valerie Duval | Scourge · Ventrue |
| Aisling Sturbridge | Regente · Tremere |
| Addison Payne | Primogen · Ventrue |
| Julia Sowinski | Primogen · Lasombra |
| Samira | Primogen · Banu Haqim |
| Katherine Weiss | Primogen · Brujah (leal da Camarilla) |
| Ivan Kutkha | Primogen · Caitiff |
| Calebros | ex-Príncipe · Nosferatu |

**Antes de 1999, "Uma ilha cercada":** por quase 300 anos Nova York foi domínio do Sabbat, com um arcebispo e uma linha de bispos; Lasombra mandavam e os Tzimisce eram a ala mística. Depois do crash de 1929 a Camarilla se firmou em Manhattan pelo dinheiro e ficou confinada à ilha por décadas. [notas] [livro V5] Em 1999 a Batalha de Nova York durou cerca de uma semana: incêndios à luz do dia, caça nas ruas e nos esgotos, o cerco do Bronx. Polonia escapou; a seita perdeu a cidade. Três PCs estavam lá: Vincent deu o plano, Gideon a espionagem, Daniel foi usado pela Segunda Guarda. [notas]

---
# Distritos

## Manhattan
- **Facção:** 2021 `cam` (Coração da corte) · antes de 1999 `cam`
- **Área / população:** 58,7 km² · 1.694.251
- **Resumo:** onde a Camarilla governa de fato desde 1929: dinheiro Ventrue em Wall Street, a cultura Toreador da Broadway e do Village, a chantry Tremere e os Nosferatu, que mandam em tudo abaixo do nível da rua. Sede da corte de Hellene Panhard.

| Clã | Quem / o quê | Fonte |
|---|---|---|
| Ventrue | Hellene Panhard (Príncipe), Addison Payne (Primogen) e o childe Leo, Valerie Duval (Scourge). Wall Street e o distrito financeiro, cheios de ghouls. | jogos V5 · livro V5 |
| Toreador | Qadir al-Asmai (Xerife), Thomas Arturo (Herald), Gideon Nicols na Broadway. O clã não tem Primogen em 2021. | jogos V5 · notas |
| Tremere | Aisling Sturbridge, Regente da Chantry of the Five Boroughs; ❔ Juno (a confirmar). | livro V5 · jogos V5 |
| Nosferatu | Donos do subsolo. Calebros, ex-Príncipe, ainda ativo; Gianni D'Angelo. | livro V5 · jogos V5 |
| Malkavian | Elias Voss, "o Cartógrafo" (envelopes num teatro do West Village); um Malkaviano que diz viver "embaixo de Manhattan"; ❔ Cara Montgomery (a confirmar). | notas · livro V5 · jogos V5 |
| Hecata | Donatello Giovanni recebe coteries nos seus clubes do Village. A corte lhe deve um favor maior pela guerra contra o Sabbat. | livro V5 |
| Tzimisce | Vincent Marchetti, dono do Hotel Plaza, herói de guerra de 1999. | notas |
| Banu Haqim | Khalid Hassan Yusuf, residente do Plaza desde ~2011. Samira, a Primogen, é a ponte com o sire dele. | notas · jogos V5 |
| Gangrel | Os "Wolves of Wall Street", Gangrel financistas que deixaram a Camarilla e bancavam os Anarchs. | livro V5 |

- **Antes de 1999:** único bastião da Camarilla por 70 anos. Depois do crash de 1929, a Ventrue Michaela montou um domínio comprando ações baratas; a seita ficou confinada à ilha, cercada por bairros do Sabbat, até a Batalha de Nova York.

## Brooklyn
- **Facção:** 2021 `camSoft` (Camarilla sem senhor único) · antes de 1999 `sabbat`
- **Área / população:** 179,7 km² · 2.736.074
- **Resumo:** tolerado pela corte, sem governante exclusivo. Aqui estão os Brujah motociclistas da Chama, a principal toca Nosferatu, o templo mais antigo do Ministry no Ocidente e a máfia russa de um Primogen Caitiff.

| Clã | Quem / o quê | Fonte |
|---|---|---|
| Brujah | A Chama do Brooklyn (Iron Lanterns MC), liderada por Deacon Brandt: presta serviços à corte sem fazer parte dela. Daniel Mercer é irmão nômade; Red Harlan preside o clube de dia. | notas |
| Nosferatu | Atlantic Avenue Tunnel, túnel de 1845 lacrado em 1861: a principal toca do clã. Quem entra para investigar não volta. | livro V5 |
| Ministry | Templo de Set de Red Hook, fundado em 1893. | livro V5 |
| Caitiff | Ivan Kutkha, Primogen, em Little Odessa (Brighton Beach). A máfia russa limpa brechas da Máscara para ele. | livro V5 |
| Hecata | Interesses Giovanni no porto de Red Hook. | notas |

- **Antes de 1999:** bairro do Sabbat. A Chama de Doc Keane era um bolsão Brujah discreto que vendia serviços à rede clandestina da Camarilla. Em 1999, Doc tentou tomar a orla com a "Segunda Guarda" e foi destruído em Red Hook pela força de Marian Price.

## Queens
- **Facção:** 2021 `camSoft` (Camarilla: Elysium e domínio Lasombra) · antes de 1999 `sabbat`
- **Área / população:** 281,6 km² · 2.405.464 (o contorno inclui a península de Rockaway)
- **Resumo:** também sem governante exclusivo, mas é onde fica o Elysium, o Art Hole, e o domínio da Primogen Lasombra Julia Sowinski, o rosto da deserção do clã para a Camarilla.

| Clã | Quem / o quê | Fonte |
|---|---|---|
| Lasombra | Julia Sowinski, Primogen (Abraçada em jun/2019), com escritório e refúgio no Queens. | jogos V5 |
| Todos os clãs | Art Hole, Elysium da Camarilla, de pé em 2021 (destruído em dez/2024, em *Reckoning*). | jogos V5 |

- **Observação do painel:** Nathan Ward, filho e Touchstone de Daniel, mora no Queens. Isso não dá a ninguém autoridade sobre o distrito.
- **Antes de 1999:** bairro do Sabbat, como todo o anel em volta de Manhattan.

## Bronx
- **Facção:** 2021 `anarch` (Anarquistas) · antes de 1999 `sabbat`
- **Área / população:** 109,3 km² · 1.472.654
- **Resumo:** reduto Anarch da continuidade moderna, com Port Morris, no South Bronx. Desde que Callihan foi achado morto (mar/2020), Torque disputa a liderança, acusado de trair as raízes do movimento. Foi também o último refúgio do Sabbat em 1999.

| Clã | Quem / o quê | Fonte |
|---|---|---|
| Brujah | Torque, barão presumido; Mia Morgan, do coterie Midnighters. | jogos V5 |
| Gangrel | Tamika, que caça agentes do governo que perseguem vampiros; ex de Torque. | jogos V5 |
| Toreador | Duke, líder de gangue de *Auld Sanguine*, que não se dá bem com o barão local. Pôr Duke aqui é escolha da campanha. | SUG |

- **Antes de 1999:** Sabbat. Na Batalha de 1999, o arcebispo Polonia recuou para um complexo de armazéns comprado por uma fachada Lasombra. Na quarta noite o cerco afinou e ele escapou com um templar. Paradeiro desconhecido.

## Staten Island
- **Facção:** 2021 `anarchSoft` (Anarquistas do pós-guerra) · antes de 1999 `sabbat`
- **Área / população:** 148,9 km² · 495.747
- **Resumo:** base dos Anarchs de Callihan depois de 1999 e sede do Pavio Negro MC, os dissidentes da Chama do Brooklyn. Em 2021 é a segunda presença Anarch da cidade, significativa, mas atrás do Bronx. Pouco disputado: refúgio de quem quer distância da corte, ou de caçadores.

| Clã | Quem / o quê | Fonte |
|---|---|---|
| Brujah | Teresa "Torch" Malloy e o Pavio Negro (Black Wick MC), patch com o rocker DOC VIVE. Para eles, o Brooklyn são as "Coleiras". Daniel não entra na ilha. | notas |

- **Antes de 1999:** Sabbat. Em 1776, o exército britânico acampou aqui e trouxe de volta Nostoket, Nosferatu de 6ª geração que considerava a cidade seu reino.

## Nova Jersey
- **Facção:** 2021 `indep` (Periferia: micro-domínios) · antes de 1999 `unk`
- **Área / população:** não mostradas (não é distrito de NY)
- **Resumo:** fora dos cinco distritos, mas colada neles. Jersey City, Newark, Paterson e Elizabeth são "micro-domínios incomuns", e corre o boato de que a Segunda Inquisição ganha terreno em Newark e Jersey City.

| Clã | Quem / o quê | Fonte |
|---|---|---|
| Ravnos | Gusman Gutierrez: Status em Nova Jersey (classe trabalhadora); o orfanato proposto para a infância dele fica em Newark. | notas |
| Toreador · Hecata | Em Atlantic City (fora do mapa): Edith Blumenau, Barão Anarch e matriarca Bahari; antes, Ornella Giovanni a mando de Donatello. | livro V5 |

- **Antes de 1999:** o vault não diz quem mandava em Nova Jersey antes de 1999. Atlantic City foi terreno neutro (Elysium) até 1999.

**Contexto sem facção** (só terra cinza com nome): Westchester (ao norte do Bronx), Nassau (a leste do Queens), Governors Island e Roosevelt Island.

---
# Pontos do mapa

Formato: **Nome** (`id`) · camadas · `lon, lat` · rótulo curto · extras · fontes. Na linha de baixo, o texto do painel. A primeira camada listada define o símbolo.

### Manhattan
- **Hotel Plaza** (`plaza`) · Coterie · `-73.9744, 40.7645` · "Plaza" · notas
  Domínio de Vincent Marchetti (Tzimisce): o hotel e as pessoas que o mantêm são a charge dele. Residência de Khalid desde ~2011, por designação da corte. Cenário das festas de Gideon. Em segredo, os olhos de Nizar ibn Tahir, Arconte de Don Cerro: Khalid escolheu o sistema de câmeras por indicação dele.
- **Wall Street** (`wall`) · Lugares de 2021 · `-74.0090, 40.7062` · "Wall Street" · livro V5
  Distrito financeiro cheio de ghouls e de dinheiro antigo; símbolo do poder Ventrue desde o crash de 1929. Os Gangrel financistas, os "Wolves of Wall Street", bancavam os Anarchs.
- **Greenwich Village** (`village`) · Lugares de 2021 · `-74.0005, 40.7336` · "Village" · livro V5
  Clubes de Donatello Giovanni, chefe Hecata da Costa Leste, onde ele recebe coteries. Bairro boêmio que acolhe Toreador excêntricos.
- **Chantry of the Five Boroughs** (`chantry`) · Lugares de 2021 · `-73.9637, 40.8090` · "Chantry Tremere" · aproximado · livro V5, ed. anterior
  Sede Tremere sob a Regente Aisling Sturbridge (10ª geração, Abraço 1911). A localização no campus do Barnard College é de edição anterior; V5 não diz onde fica.
- **Harlem** (`harlem`) · Lugares de 2021, História · `-73.9445, 40.8095` · "Harlem" · livro V5
  Raiz do jazz de Nova York: Renascença do Harlem, cultura de ballroom, Brujah com o "numbers racket" nos anos 1930. Na época, território inimigo para a Camarilla. Hoje, a cena natural da Nina. Também é a alternativa ao Bed-Stuy para o prédio da festa de Isabella.
- **Upper East Side** (`ues`) · Lugares de 2021 · `-73.9566, 40.7736` · "Upper East Side" · livro V5
  Terreno de caça dos ricos.
- **The Harbor Ledger** (`ledger`) · Coterie · `-74.0060, 40.7128` · "Harbor Ledger" · aproximado · notas
  Redação investigativa sem fins lucrativos em Lower Manhattan; cobre habitação, polícia, contratos e o porto. Mary Winchester (chefe, ligada a Gideon) e Leila Yusuf (irmã e Touchstone de Khalid, que o crê morto desde 2010).
- **Refúgio de Cordelia Vane** (`cordelia`) · Coterie, História · `-73.9754, 40.7870` · "Cordelia (2008)" · aproximado · notas
  Sire de Gideon. Levada de madrugada em 2008 por uma operação federal disfarçada de prisão por fraude (Segunda Inquisição). O refúgio no Upper West Side foi achado vazio e lacrado.
- **Teatro do West Village** (`wally`) · Coterie · `-74.0072, 40.7318` · "Teatro (Wally Drake)" · aproximado, rótulo à esquerda · notas
  Walter "Wally" Drake, contrarregra, guarda os envelopes que Elias Voss deixa "para o Cartógrafo". Gideon pagou o telhado do teatro; Wally não abre os envelopes, mas sabe quando foram retirados.
- **Times Square e Broadway** (`times`) · Auld Sanguine, Coterie · `-73.9855, 40.7580` · "Times Square" · rótulo à esquerda · SUG, notas
  A bola cai à meia-noite: o centro lota e a polícia fica toda em Midtown, o que explica os 15 minutos de resposta ao alarme do parque industrial. Os teatros da Broadway são a fachada de Gideon, que mapeou o Sabbat pelos bastidores. Odile Marchand vende programas anotados por Elias num antiquário aqui perto.
- **Grand Central** (`grand`) · Batalha de 1999 · `-73.9772, 40.7527` · "Grand Central" · notas
  Batalha de 1999: os Tremere receberam aqui o cabelo dos ternos de Orozco, desviado pela lavanderia do Plaza que atendia metade da cidade, ideia de Vincent.
- **Little Italy** (`littleitaly`) · História · `-73.9975, 40.7190` · "Little Italy" · notas
  Vincent Marchetti nasce aqui em 1908 e vive no bairro até 1930, antes de virar carniçal do Plaza.
- **Rockland Palace** (`rockland`) · História · `-73.9385, 40.8290` · "Rockland Palace" · livro V5
  1919: Erzulie (Toreador) é Abraçada no baile da Hamilton Lodge, no Harlem. Depois acolheu Caitiff perseguidos; hoje está em Chicago.
- **Empire State (antigo Waldorf)** (`waldorf`) · História · `-73.9857, 40.7484` · "Empire State" · rótulo à esquerda · livro V5
  Até 1929, o Elysium ficava no Waldorf-Astoria original, recém-reformado pelo Keeper. Olga Alexandrova (Ventrue) forçou a demolição para erguer o Empire State, contra um Ventrue com refúgio no Chrysler.
- **Roosevelt Island (Blackwell's)** (`roosevelt`) · História · `-73.9500, 40.7615` · "Blackwell's" · sem distrito · livro V5
  Desde 1830, depósito de presos, órfãos e internos de asilo. Caça fácil no século XIX.
- **Ellis Island** (`ellis`) · Lugares de 2021 · `-74.0396, 40.6995` · "Ellis Island" · rótulo à esquerda, sem distrito · jogos V5
  Confronto final de *Coteries of New York* (fim de 2019). Torque fugiu da briga.

### Brooklyn
- **Atlantic Avenue Tunnel** (`atlantic`) · Lugares de 2021 · `-73.9935, 40.6905` · "Atlantic Ave. Tunnel" · rótulo à esquerda · livro V5
  Túnel ferroviário de 1845, lacrado em 1861, com quase 800 m: a principal toca Nosferatu de Nova York. Quem entra para investigar não volta.
- **Red Hook: templo de Set** (`redhook`) · Lugares de 2021 · `-74.0095, 40.6775` · "Red Hook" · rótulo à esquerda · livro V5, notas
  Templo do Ministry fundado em 1893, o mais antigo do hemisfério ocidental. Também é onde o Iron Lanterns MC nasceu, numa garagem, em 1962, e onde ficam os interesses Giovanni no porto. Candidato a local do galpão de *Auld Sanguine*.
- **Depósito da Segunda Guarda** (`redhook99`) · Batalha de 1999 · `-74.0150, 40.6700` · "Depósito (1999)" · aproximado, rótulo à esquerda · notas
  Noite 3: Daniel é capturado aqui com ordens falsas no bolso. Noite 4: a Camarilla cerca Red Hook com a força de Marian Price e destrói Doc Keane. Para isso tira tropas do cerco do Bronx, e Polonia escapa. O tanque da Maggie, a moto de Daniel, guarda um estilhaço daqui.
- **Little Odessa** (`odessa`) · Lugares de 2021 · `-73.9614, 40.5790` · "Little Odessa" · livro V5
  Brighton Beach, comunidade russa e ucraniana. Base de Ivan Kutkha, Primogen Caitiff, cujos laços com a máfia russa limpam brechas da Máscara "sem perguntas".
- **Bed-Stuy: a festa de Isabella** (`bedstuy`) · Auld Sanguine · `-73.9418, 40.6872` · "Festa (Bed-Stuy)" · SUG
  O prédio da festa tem fachada de arenito: bairro de brownstones. Bed-Stuy ou o Harlem servem. Isabella fica no último apartamento do corredor.

### Queens
- **Art Hole (Elysium)** (`arthole`) · Lugares de 2021 · `-73.9405, 40.7470` · "Art Hole" · aproximado · jogos V5
  Elysium da Camarilla, de pé em 2021. Em dez/2024 (*Reckoning of New York*) o Hunter Offensive o destrói. O vault só diz "Queens"; o ponto é aproximado.
- **Domínio de Julia Sowinski** (`julia`) · Lugares de 2021 · `-73.9120, 40.7620` · "Julia Sowinski" · aproximado · jogos V5
  Primogen Lasombra, ex-jornalista da *New York Lodestar*. Tem escritório e refúgio no Queens. Ponto aproximado.
- **Flushing Meadows** (`flushing`) · História · `-73.8448, 40.7466` · "Feira de 1939" · livro V5
  Feira Mundial de 1939. Boato: a cápsula do tempo da Westinghouse guarda o crânio da matusalém Brujah Altamira.

### Bronx
- **Port Morris** (`portmorris`) · Lugares de 2021, Auld Sanguine · `-73.9115, 40.8020` · "Port Morris" · jogos V5, SUG
  Domínio Anarch no South Bronx. Melhor candidato para o parque industrial e o galpão 17 de *Auld Sanguine*: território de Duke e do barão local, a uma distância considerável do centro sem sair da jurisdição da polícia.
- **Armazéns de Polonia** (`warehouses`) · Batalha de 1999 · `-73.8840, 40.8135` · "Armazéns (1999)" · aproximado · notas
  Haven de emergência do arcebispo Polonia: complexo de armazéns abandonado que uma fachada Lasombra comprara anos antes. Vincent previu o recuo pela papelada que passou pelo Plaza. Cerco na noite 3; na noite 4 Polonia e um templar escapam pela rota que Vincent pedira para fechar. Local exato em aberto.

### Staten Island
- **Sede do Pavio Negro MC** (`pavio`) · Coterie · `-74.1300, 40.6050` · "Pavio Negro" · aproximado · notas
  Fundado no início de 2000 pelos dissidentes da Chama, liderados por Torch Malloy, Adversary de Daniel. Ligado aos Anarchs de Staten Island. Local exato em aberto.

### Nova Jersey
- **Jersey City** (`jc`) · Lugares de 2021 · `-74.0560, 40.7250` · "Jersey City" · rótulo à esquerda · livro V5
  Micro-domínio incomum. Boato: a Segunda Inquisição ganha terreno aqui.
- **Newark** (`newark`) · Lugares de 2021, Coterie · `-74.1724, 40.7357` · "Newark" · livro V5, notas, SUG
  Micro-domínio incomum; boato de avanço da Segunda Inquisição. Proposta para a infância de Gusman: a Casa Santa Rita, orfanato católico de freiras de língua espanhola, fechado em 2016.
- **Paterson** (`paterson`) · Lugares de 2021 · `-74.1718, 40.9168` · "Paterson" · livro V5
  Micro-domínio incomum, sugerido pela Barão de Atlantic City como lugar para coteries se instalarem.
- **Elizabeth** (`elizabeth`) · Lugares de 2021 · `-74.2107, 40.6640` · "Elizabeth" · rótulo à esquerda · livro V5
  Micro-domínio incomum.

---
# Fora do mapa

Setas na borda, só na vista "Cidade". Clicáveis.

- **↑ Catskills** (`catskills`) · topo · livro V5
  Norte do estado: território de lobisomens. O sinal de "cuidado, lobisomens" na cant vampírica é o mesmo lá e em Los Angeles. Aisling Sturbridge nasceu no norte do estado, em 1890.
- **Westhampton →** (`westhampton`) · borda direita · livro V5
  Reuniões dos Sons of Magog, Ventrue que fugiram de Londres antes da queda. Anciões britânicos empurrados para a região.
- **↓ Atlantic City** (`atlanticcity`) · canto inferior esquerdo · livro V5
  Cerca de 200 km ao sul. Elysium neutro até 1999; depois Hecata com fachada de Camarilla; hoje, na prática, Anarch e Bahari sob a Toreador Edith Blumenau (clube Ruby Throat, casino Three Bears). Uns 15 vampiros. A Camarilla de NY nem a considera um domínio separado.

---
# Clãs por distrito

Matriz abaixo do mapa. **●** = sede, domínio ou base do clã; **○** = figura conhecida mora ou age ali. "Cidade" = está em NY, bairro não informado.

| Clã | Manhattan | Brooklyn | Queens | Bronx | Staten Is. | N. Jersey | Cidade |
|---|---|---|---|---|---|---|---|
| Ventrue | ● Panhard, Payne, Leo, Duval; Wall Street | | | | | | |
| Toreador | ● Qadir, Arturo, Gideon | | | ○ Duke (sugestão) | | | |
| Tremere | ● Sturbridge; Chantry of the Five Boroughs; ❔ Juno | | | | | | |
| Nosferatu | ● Subsolo; Calebros | ● Atlantic Avenue Tunnel | | | | | |
| Malkavian | ○ Elias Voss; ❔ Cara Montgomery | | | | | | |
| Brujah | | ● Chama / Iron Lanterns, Deacon | | ● Torque, Mia Morgan | ● Pavio Negro, Torch | | ○ Katherine Weiss (Primogen, leal) |
| Gangrel | ○ Wolves of Wall Street | | | ○ Tamika | | | ○ Ranq; ❔ Declan, Raoul; Jesse (PC) |
| Banu Haqim | ○ Khalid (Plaza) | | | | | | ○ Samira, Primogen |
| Lasombra | | | ● Julia Sowinski, Primogen | | | | |
| Tzimisce | ○ Vincent Marchetti (Plaza) | | | | | | |
| Hecata | ● Donatello Giovanni, Village | ○ Porto de Red Hook | | | | | |
| Ministry | | ● Templo de Red Hook, 1893 | | | | | |
| Ravnos | | | | | | ○ Gusman (Status) | |
| Caitiff | | ● Ivan Kutkha, Little Odessa | | | | | |

**Fora da matriz por falta de lugar:** Nina "Blue" Calloway (Toreador, cena do jazz; o Harlem é o encaixe natural, mas não está decidido) e o 8º jogador.

---
# Divergências e decisões em aberto

Aparecem no mapa como "Divergências e cuidados". Ao decidir uma, atualize a seção correspondente acima e a apague (ou marque ✅) aqui.

- [x] **Bronx ou Staten Island?** ✅ Decidido pelo Narrador (16/10/2026): os Anarquistas ficam **majoritariamente no Bronx** (Port Morris), com **presença significativa em Staten Island**, a base do pós-guerra (por isso o Pavio Negro). Registrado em [[Camarilla em Nova York]] e nos READMEs dos jogadores.
- [ ] **Brooklyn e Queens sem dono.** As notas dizem que esses distritos "não são atribuídos a governante exclusivo". Hoje: Camarilla tracejada; quem age ali são a Chama, Kutkha, os Nosferatu e Julia Sowinski. Se algum ganhar um senhor (um Barão, um Primogen como regente), troque para `cam`.
- [ ] **Locais aproximados.** Art Hole, o domínio de Julia, a Chantry, o Pavio Negro, o Harbor Ledger e os armazéns de 1999 não têm endereço nas fontes. Se fixar algum, troque a coordenada e tire o "aproximado".
- [x] **Michaela: 1998 ou 1999?** ✅ **1999**, num falso parlamento durante a Batalha (decisão do Narrador, 17/10/2026); a nota de [[Vincent Marchetti]] foi corrigida. O mapa já usava 1999.
- [x] **Red Hook "no Harlem".** *Cult of the Blood Gods* escreve "Red Hook in the Harlem borough". É erro do livro: Red Hook fica no Brooklyn. (Só um aviso; nada a decidir.)
- [x] **O mapa clássico é outro.** O *New York by Night* dos anos 1990 punha Anarchs no Brooklyn e Sabbat no Bronx e no Queens. Não serve para V5 nem para esta campanha e não foi usado. (Só um aviso.)
- [ ] **Onde ficam Nina, Jesse e o 8º jogador?** Não têm lugar no mapa. Candidatos: Nina no Harlem (jazz); Jesse fora do centro (Gangrel saíram da Camarilla).
- [x] **Onde mora Gusman?** ✅ Em **Staten Island**, num apartamento em Port Richmond (decisão do Narrador, 16/10/2026, em [[Gusman Gutierrez]]). O mapa ainda o mostra só em Newark: ver [[#⚠️ Atualização pendente do mapa]].
- [ ] ❔ **Nomes a confirmar (Narrador, 16/10/2026):** Juno (Tremere), Cara Montgomery (Malkaviano), Declan e Raoul (Gangrel) aparecem no mapa com a marca ❔ até a decisão; Hope (ex-Double Spiral) só está em [[Camarilla em Nova York#❔ A confirmar|❔ A confirmar]].
- [x] **Addison Payne, Leo e Ivan Kutkha:** ❌ descartados (decisão do Narrador, 17/10/2026). Saem do mapa na próxima atualização.
- [ ] **Nomes ainda sem decisão:** Donatello Giovanni, Ranq, Gianni D'Angelo, Elias Voss e os demais da matriz que não estão na corte confirmada de [[Camarilla em Nova York]] seguem como estavam.
- [x] **Reserva:** Robert Larson saiu do mapa e ficou guardado em [[Camarilla em Nova York#Reserva para o futuro|Reserva para o futuro]].
- [x] **Mortos antes de 2021 (confirmados):** Callihan (mar/2020), Michaela (1999) e Sophie Langley (2019). Estão em [[Camarilla em Nova York#Confirmados já mortos (antes de 2021)|Confirmados já mortos]].

---
# ⚠️ Atualização pendente do mapa

Registrado em **17/10/2026**. **Não aplicar** até o Narrador resolver as pendências acima ou confirmar. Quando for liberado, atualize primeiro as seções desta nota e depois o HTML (ver [[#Como mudar o mapa]]).

Mudanças já decididas que o mapa ainda não mostra:
- [ ] **Tirar Addison Payne, Leo e Ivan Kutkha** (descartados): corte da visão geral, Ventrue de Manhattan, Caitiff do Brooklyn, ponto de Little Odessa e matriz.
- [ ] **Gusman em Staten Island** (Port Richmond; bar do Iggy, The Broken Minute). Newark fica só como o orfanato.
- [ ] **Batalha de cinco dias** no texto de "Antes de 1999" (o Sabbat estava quebrado nas duas ou três primeiras noites).
- [ ] **Panhard em 2021:** firme para a maioria; em queda só para os muito bem informados.
- [ ] **PCs que faltam:** Herta (Plaza, comitiva europeia), Jesse, e Nina (mora em Washington Heights; Abraçada na Lenox Avenue; Mawla é Gideon).
- [ ] **NPCs do [[Elenco de Nova York]]** que ainda não estão no mapa (Deacon Brandt, Torch Malloy, Iggy, Elias Voss, comitiva europeia), se fizer sentido mostrá-los.
- [ ] **Nomes fora da regra de 16/10** que o mapa ainda mostra: Kaiser, Gianni D'Angelo, Agathon, Benoit Segal, Vincent Cerutti e os ❔ (Juno, Cara Montgomery, Declan, Raoul). Decidir caso a caso.

---
*Fontes web usadas só para contraste:* [NYBN Overview](https://shipwrecklibrary.com/?p=2224) · [White Wolf Wiki: New York by Night](https://whitewolf.fandom.com/wiki/New_York_by_Night) · [Wikipedia: NY by Night](https://www.wikipedia.org/wiki/NY_by_Night). *Área e população:* Censo dos EUA de 2020.
