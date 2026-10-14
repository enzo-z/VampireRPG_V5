// Reference text ported from Pedro's app (vampire-5e-referencia @ 40b41bf,
// src/app/ankh/coreAttributes.ts). Personal, local-only use (decision of 2026-10-14).
import type { AttributeKey } from '../domain/traits.ts';

export interface AttributeText {
  source: string;
  body: string;
  levels: string[];
}

export const CORE_ATTRIBUTES: Readonly<Record<AttributeKey, AttributeText>> = {
  strength: {
    source: 'CORE · P. 155',
    body: 'Strength governa o tamanho do mortal que você consegue levantar, a força com que consegue acertá-lo e o quanto você consegue forçar seu corpo morto a exercer. (A quantidade aproximada que você consegue levantar do chão sem um teste de Atributo aparece entre parênteses abaixo.)',
    levels: [
      'Você esmaga uma lata de cerveja com facilidade. (20 kg: uma árvore de Natal, uma placa de pare)',
      'Você é fisicamente mediano. (45 kg: um vaso sanitário)',
      'Você talvez consiga arrombar uma porta de madeira. (115 kg: uma pessoa grande, um caixão vazio, uma geladeira)',
      'Você é um exemplar físico de primeira, provavelmente com musculatura bem visível. (180 kg: um caixão cheio, uma caçamba vazia)',
      'Você é uma verdadeira potência e provavelmente consegue arrombar uma porta corta-fogo de metal, rasgar uma cerca de arame ou abrir um portão acorrentado. (250 kg: uma motocicleta, um piano)',
    ],
  },
  dexterity: {
    source: 'CORE · P. 155',
    body: 'Dexterity governa sua agilidade e graça, a rapidez com que você desvia da estaca apontada ao seu coração e o controle motor fino que você tem quando está contra o relógio.',
    levels: [
      'Você consegue correr, mas equilíbrio e esquiva são um desafio.',
      'Seu sprint é sólido, e às vezes você parece gracioso.',
      'Sua agilidade é impressionante, e sua coordenação é tão boa quanto a de qualquer amador treinado.',
      'Você poderia se destacar em acrobacias e se mover de um jeito que poucos humanos conseguem.',
      'Seus movimentos são fluidos e hipnóticos – quase sobre-humanos.',
    ],
  },
  stamina: {
    source: 'CORE · P. 155',
    body: 'Sua resistência física: Stamina absorve danos físicos, como uma bala em alta velocidade ou a lâmina de um caçador, e permite que você persevere diante de perigos e esforços árduos. Sua Stamina + 3 é igual à sua Health.',
    levels: [
      'Até esforços menores o deixam sem fôlego.',
      'Você aguenta uma surra, mas considere pedir a paz.',
      'Vários dias de caminhada pesada com uma mochila não são problema para você.',
      'Você poderia vencer uma maratona ou suportar enormes quantidades de dor, pelo menos fisicamente.',
      'Mesmo se fosse mortal, você nunca suaria.',
    ],
  },
  charisma: {
    source: 'CORE · P. 156',
    body: 'Charisma mede seu charme natural, sua graça e seu apelo sexual. Se você o tem, ele atrai as pessoas para você, tornando o alimentar-se muito mais fácil. Charisma não depende de boa aparência, que é um Mérito à parte (veja Looks, p. 179).',
    levels: [
      'Você consegue falar com clareza, embora poucas pessoas costumem ouvir.',
      'Em geral agradável apesar de sua natureza morta-viva, você pode até ter amigos.',
      'As pessoas confiam em você sem reservas, e você faz amigos com facilidade.',
      'Você possui um magnetismo pessoal considerável e atrai seguidores como moscas.',
      'Você poderia liderar uma cidade em rebelião, se quisesse.',
    ],
  },
  manipulation: {
    source: 'CORE · P. 156',
    body: 'Manipulation é sua capacidade de torcer os outros para o seu ponto de vista, mentir de forma convincente e ir embora depois de enganar uma vítima sem que ninguém perceba.',
    levels: [
      'Desde que se mantenha honesto, você consegue convencer as pessoas a fazer o que você quer.',
      'Sua capacidade de enganar supera a vontade dos fracos de vontade e dos simplórios.',
      'Você nunca precisa pagar o preço cheio por nada.',
      'Você poderia ser o líder de um culto – ou um político.',
      'Você poderia convencer o Príncipe a investir em terrenos no deserto, ou talvez até a cancelar a Blood Hunt contra você.',
    ],
  },
  composure: {
    source: 'CORE · P. 156',
    body: 'Composure permite que você permaneça calmo, controle suas emoções e tranquilize os outros apesar da ansiedade. Também representa sua capacidade de manter a cabeça fria em tudo, de tiroteios a encontros íntimos. Sua Composure + Resolve é igual à sua Willpower (p. 157).',
    levels: [
      'O menor insulto ou confronto poderia levá-lo ao Frenzy.',
      'Você consegue conter seus instintos predatórios na maioria das situações não hostis.',
      'Os outros recorrem a você em busca de orientação quando o sangue respinga no ventilador.',
      'Você blefa nas cartas sem esforço e consegue controlar sua Besta até certo ponto.',
      'A Besta é seu bichinho de estimação.',
    ],
  },
  intelligence: {
    source: 'CORE · P. 156',
    body: 'Intelligence mede sua capacidade de raciocinar, pesquisar e aplicar lógica. Você consegue recordar e analisar informações de livros ou de seus sentidos. Nenhum enigma ou mistério escapa a quem é realmente inteligente.',
    levels: [
      'Você lê e escreve com competência, embora alguns termos o confundam.',
      'Você é esperto o bastante para perceber suas limitações.',
      'Você é esclarecido, capaz de juntar pistas sem dificuldade.',
      'Provavelmente membros do Clã Tremere o consultam por sua sabedoria.',
      'Gênio não dá conta da profundidade e da amplitude do seu intelecto.',
    ],
  },
  wits: {
    source: 'CORE · P. 156',
    body: 'Wits serve para pensar rápido e reagir corretamente com pouca informação. “Você ouve um som” é Wits; “Você ouve dois guardas se aproximando” é Intelligence. Wits permite farejar uma emboscada ou rebater a Harpy na corte na hora, em vez de pensar na melhor resposta só na noite seguinte.',
    levels: [
      'Você pega a ideia no fim, mas é preciso explicar.',
      'Você consegue apostar nas probabilidades no pôquer ou puxar o freio de emergência a tempo. Normalmente.',
      'Você consegue analisar uma situação e traçar rapidamente a melhor rota de fuga.',
      'Você nunca é pego desprevenido e sempre encontra uma réplica inteligente.',
      'Você pensa e responde mais rápido do que a maioria das pessoas consegue compreender.',
    ],
  },
  resolve: {
    source: 'CORE · P. 157',
    body: 'Resolve fornece foco e determinação, e mede concentração e fortaleza mental. Resolve sustenta vigílias a noite inteira e bloqueia distrações. Sua Composure + Resolve é igual à sua Willpower.',
    levels: [
      'Você dá pouca atenção a tudo, exceto às coisas mais urgentes.',
      'Você consegue se preparar para o longo prazo, contanto que não seja longo demais.',
      'Distrair você dá mais trabalho do que a maioria das pessoas quer ter.',
      'Você consegue chegar a uma dedução na marra, passando por qualquer obstáculo.',
      'Você consegue pensar em um tiroteio ou vigiar a porta numa orgia de sangue e depois limpar cada cápsula de bala ou gota derramada.',
    ],
  },
};
