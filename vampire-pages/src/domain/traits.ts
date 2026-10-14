// Attribute and skill identifiers. Keys match the V5 sheet and the legacy
// export of Pedro's app (e.g. `animalKen`, `occult`); labels follow the
// table vocabulary in vampire-pages/CLAUDE.md.

export const TRAIT_GROUPS = ['physical', 'social', 'mental'] as const;
export type TraitGroup = (typeof TRAIT_GROUPS)[number];

export const ATTRIBUTE_KEYS = [
  'strength', 'dexterity', 'stamina',
  'charisma', 'manipulation', 'composure',
  'intelligence', 'wits', 'resolve',
] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const SKILL_KEYS = [
  'athletics', 'brawl', 'craft', 'drive', 'firearms', 'larceny', 'melee', 'stealth', 'survival',
  'animalKen', 'etiquette', 'insight', 'intimidation', 'leadership', 'performance', 'persuasion', 'streetwise', 'subterfuge',
  'academics', 'awareness', 'finance', 'investigation', 'medicine', 'occult', 'politics', 'science', 'technology',
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

export const TRAIT_GROUP_LABELS: Readonly<Record<TraitGroup, string>> = {
  physical: 'Physical',
  social: 'Social',
  mental: 'Mental',
};

export const ATTRIBUTE_GROUPS: Readonly<Record<TraitGroup, readonly AttributeKey[]>> = {
  physical: ['strength', 'dexterity', 'stamina'],
  social: ['charisma', 'manipulation', 'composure'],
  mental: ['intelligence', 'wits', 'resolve'],
};

export const SKILL_GROUPS: Readonly<Record<TraitGroup, readonly SkillKey[]>> = {
  physical: ['athletics', 'brawl', 'craft', 'drive', 'firearms', 'larceny', 'melee', 'stealth', 'survival'],
  social: ['animalKen', 'etiquette', 'insight', 'intimidation', 'leadership', 'performance', 'persuasion', 'streetwise', 'subterfuge'],
  mental: ['academics', 'awareness', 'finance', 'investigation', 'medicine', 'occult', 'politics', 'science', 'technology'],
};

export const ATTRIBUTE_LABELS: Readonly<Record<AttributeKey, string>> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  stamina: 'Stamina',
  charisma: 'Charisma',
  manipulation: 'Manipulation',
  composure: 'Composure',
  intelligence: 'Intelligence',
  wits: 'Wits',
  resolve: 'Resolve',
};

export const SKILL_LABELS: Readonly<Record<SkillKey, string>> = {
  athletics: 'Athletics',
  brawl: 'Brawl',
  craft: 'Craft',
  drive: 'Drive',
  firearms: 'Firearms',
  larceny: 'Larceny',
  melee: 'Melee',
  stealth: 'Stealth',
  survival: 'Survival',
  animalKen: 'Animal Handling',
  etiquette: 'Etiquette',
  insight: 'Insight',
  intimidation: 'Intimidation',
  leadership: 'Leadership',
  performance: 'Performance',
  persuasion: 'Persuasion',
  streetwise: 'Streetwise',
  subterfuge: 'Subterfuge',
  academics: 'Academics',
  awareness: 'Awareness',
  finance: 'Finance',
  investigation: 'Investigation',
  medicine: 'Medicine',
  occult: 'Ocultismo',
  politics: 'Politics',
  science: 'Science',
  technology: 'Technology',
};
