import catalog from 'virtual:advantages';
import { indexAdvantages, type AdvantageIndex } from './advantages.ts';

/** Advantage catalog built from Advantages.md at build time. */
export const ADVANTAGE_INDEX: AdvantageIndex = indexAdvantages(catalog);
