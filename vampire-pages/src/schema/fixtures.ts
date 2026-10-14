// Hand-written test fixtures. The legacy one follows the `Character` shape of
// Pedro's app (types/character.ts there) with made-up values.

export function legacyCharacter(): Record<string, unknown> {
  return {
    id: 'khalil',
    name: 'Teste Legado',
    aliases: 'O Viajante',
    clan: 'Toreador',
    generation: '13th',
    predatorType: 'Siren',
    faction: 'Camarilla',
    embrace: '1998',
    sire: '',
    languages: 'Português, Inglês',
    xpTotal: '12',
    xpSpent: 7,
    attributes: {
      strength: 2, dexterity: 3, stamina: 2,
      charisma: 4, manipulation: 3, composure: 2,
      intelligence: 2, wits: 3, resolve: 9,
    },
    skills: {
      athletics: { value: 1, specialty: '' },
      performance: { value: 3, specialty: 'Canto' },
      occult: { value: 2, specialty: '  Rituais  ' },
    },
    advantages: [{ name: 'Beautiful', level: 2, note: '' }],
    flaws: [{ name: 'Prey Exclusion', level: 1, note: 'crianças' }],
    trackers: {
      healthMax: 15,
      health: [1, null, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      willpowerMax: 5,
      willpower: [1],
      hunger: [1, 1, 0, 1, 0],
      humanity: 7,
      humanityStains: 2,
      bp: 1,
      resonance: 'Sanguine',
    },
    disciplines: [
      { name: 'Presence', level: 3, powers: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] },
      { name: 'Auspex', level: 1, powers: ['A1'], rituals: [] },
      { name: 'Celerity', level: 7, powers: [] },
      { name: 'D4', level: 1, powers: [] },
      { name: 'D5', level: 1, powers: [] },
      { name: 'D6', level: 1, powers: [] },
      { name: 'D7', level: 1, powers: [] },
    ],
    inventory: [],
    pools: [],
    convictions: ['Nunca trair a família'],
    touchstones: [{ name: 'Irmã', summary: 'mora em Recife', linkedConviction: '', description: '' }],
    background: 'Uma história curta.',
    notes: '',
    portrait: 'data:image/jpeg;base64,AAAA',
    backdrop: 'ankh-1',
  };
}
