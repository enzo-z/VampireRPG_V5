import catalog from 'virtual:disciplines';
import { indexCatalog, type CatalogIndex } from './lookup.ts';

/** Discipline catalog built from the vault notes at build time. */
export const DISCIPLINE_INDEX: CatalogIndex = indexCatalog(catalog);
