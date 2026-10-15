import catalog from 'virtual:predator-types';
import { indexPredatorTypes, type PredatorTypeIndex } from './predatorTypes.ts';

/** Predator type catalog built from Predator Type.md at build time. */
export const PREDATOR_TYPE_INDEX: PredatorTypeIndex = indexPredatorTypes(catalog);
