import {
  ATTRIBUTE_RANGE,
  BLOOD_POTENCY_RANGE,
  DISCIPLINE_RANGE,
  POWERS_PER_DISCIPLINE,
  SKILL_RANGE,
  type Blood,
  type Discipline,
  type DisciplinePower,
  type Ficha,
  type Identity,
} from '../domain/character.ts';
import { pickDots } from '../domain/dots.ts';
import { cycleDamageBox, cycleHumanityBox, pickHunger, withMax } from '../domain/trackers.ts';
import type { AttributeKey, SkillKey } from '../domain/traits.ts';

export interface SheetsState {
  fichas: Ficha[];
  activeId: string | null;
}

export type DamageTrackKey = 'health' | 'willpower';
export type BloodTextField = Exclude<keyof Blood, 'potency'>;

export type SheetsAction =
  | { type: 'ficha/created'; ficha: Ficha }
  | { type: 'ficha/deleted'; id: string }
  | { type: 'ficha/activated'; id: string }
  | { type: 'ficha/renamed'; id: string; name: string }
  | { type: 'fichas/imported'; fichas: readonly Ficha[] }
  | { type: 'identity/changed'; id: string; field: keyof Identity; value: string }
  | { type: 'attribute/picked'; id: string; key: AttributeKey; index: number }
  | { type: 'skill/picked'; id: string; key: SkillKey; index: number }
  | { type: 'spec/changed'; id: string; key: SkillKey; value: string }
  | { type: 'discipline/renamed'; id: string; slot: number; name: string }
  | { type: 'discipline/picked'; id: string; slot: number; index: number }
  | { type: 'power/changed'; id: string; slot: number; powerIndex: number; field: keyof DisciplinePower; value: string }
  | { type: 'tracker/maxSet'; id: string; track: DamageTrackKey; max: number }
  | { type: 'tracker/boxCycled'; id: string; track: DamageTrackKey; index: number }
  | { type: 'hunger/picked'; id: string; index: number }
  | { type: 'humanity/cycled'; id: string; index: number }
  | { type: 'blood/potencyPicked'; id: string; index: number }
  | { type: 'blood/changed'; id: string; field: BloodTextField; value: string }
  | { type: 'notes/changed'; id: string; value: string };

export const EMPTY_SHEETS_STATE: SheetsState = { fichas: [], activeId: null };

function updateFicha(state: SheetsState, id: string, change: (ficha: Ficha) => Ficha): SheetsState {
  const index = state.fichas.findIndex((ficha) => ficha.id === id);
  const current = state.fichas[index];
  if (current === undefined) return state;
  return { ...state, fichas: state.fichas.with(index, change(current)) };
}

function updateDiscipline(ficha: Ficha, slot: number, change: (discipline: Discipline) => Discipline): Ficha {
  const current = ficha.disciplines[slot];
  if (current === undefined) return ficha;
  return { ...ficha, disciplines: ficha.disciplines.with(slot, change(current)) };
}

/** Edits one power row; rows past the end are created on demand and empty trailing rows are dropped. */
function changePower(powers: readonly DisciplinePower[], index: number, field: keyof DisciplinePower, value: string): DisciplinePower[] {
  if (!Number.isInteger(index) || index < 0 || index >= POWERS_PER_DISCIPLINE) return [...powers];
  const length = Math.max(powers.length, index + 1);
  const edited = Array.from({ length }, (_, i): DisciplinePower => {
    const power = powers[i] ?? { name: '', note: '' };
    return i === index ? { ...power, [field]: value } : power;
  });
  const lastFilled = edited.findLastIndex((power) => power.name !== '' || power.note !== '');
  return edited.slice(0, lastFilled + 1);
}

function withoutFicha(state: SheetsState, id: string): SheetsState {
  const index = state.fichas.findIndex((ficha) => ficha.id === id);
  if (index === -1) return state;
  const fichas = state.fichas.toSpliced(index, 1);
  if (state.activeId !== id) return { ...state, fichas };
  const neighbor = fichas[index] ?? fichas[index - 1];
  return { fichas, activeId: neighbor?.id ?? null };
}

function withImported(state: SheetsState, imported: readonly Ficha[]): SheetsState {
  const byId = new Map(imported.map((ficha) => [ficha.id, ficha]));
  const replaced = state.fichas.map((ficha) => byId.get(ficha.id) ?? ficha);
  const existing = new Set(state.fichas.map((ficha) => ficha.id));
  const added = imported.filter((ficha) => !existing.has(ficha.id));
  return { fichas: [...replaced, ...added], activeId: imported[0]?.id ?? state.activeId };
}

export function sheetsReducer(state: SheetsState, action: SheetsAction): SheetsState {
  switch (action.type) {
    case 'ficha/created':
      return { fichas: [...state.fichas, action.ficha], activeId: action.ficha.id };
    case 'ficha/deleted':
      return withoutFicha(state, action.id);
    case 'ficha/activated':
      return state.fichas.some((ficha) => ficha.id === action.id) ? { ...state, activeId: action.id } : state;
    case 'ficha/renamed': {
      const name = action.name.trim();
      return name === '' ? state : updateFicha(state, action.id, (ficha) => ({ ...ficha, name }));
    }
    case 'fichas/imported':
      return withImported(state, action.fichas);
    case 'identity/changed':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        identity: { ...ficha.identity, [action.field]: action.value },
      }));
    case 'attribute/picked':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        attributes: { ...ficha.attributes, [action.key]: pickDots(ficha.attributes[action.key], action.index, ATTRIBUTE_RANGE) },
      }));
    case 'skill/picked':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        skills: { ...ficha.skills, [action.key]: pickDots(ficha.skills[action.key], action.index, SKILL_RANGE) },
      }));
    case 'spec/changed':
      return updateFicha(state, action.id, (ficha) => {
        const specs = { ...ficha.specs };
        if (action.value === '') delete specs[action.key];
        else specs[action.key] = action.value;
        return { ...ficha, specs };
      });
    case 'discipline/renamed':
      return updateFicha(state, action.id, (ficha) =>
        updateDiscipline(ficha, action.slot, (discipline) => ({ ...discipline, name: action.name })),
      );
    case 'discipline/picked':
      return updateFicha(state, action.id, (ficha) =>
        updateDiscipline(ficha, action.slot, (discipline) => ({
          ...discipline,
          value: pickDots(discipline.value, action.index, DISCIPLINE_RANGE),
        })),
      );
    case 'power/changed':
      return updateFicha(state, action.id, (ficha) =>
        updateDiscipline(ficha, action.slot, (discipline) => ({
          ...discipline,
          powers: changePower(discipline.powers, action.powerIndex, action.field, action.value),
        })),
      );
    case 'tracker/maxSet':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        trackers: { ...ficha.trackers, [action.track]: withMax(ficha.trackers[action.track], action.max) },
      }));
    case 'tracker/boxCycled':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        trackers: { ...ficha.trackers, [action.track]: cycleDamageBox(ficha.trackers[action.track], action.index) },
      }));
    case 'hunger/picked':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        trackers: { ...ficha.trackers, hunger: pickHunger(ficha.trackers.hunger, action.index) },
      }));
    case 'humanity/cycled':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        trackers: { ...ficha.trackers, humanity: cycleHumanityBox(ficha.trackers.humanity, action.index) },
      }));
    case 'blood/potencyPicked':
      return updateFicha(state, action.id, (ficha) => ({
        ...ficha,
        blood: { ...ficha.blood, potency: pickDots(ficha.blood.potency, action.index, BLOOD_POTENCY_RANGE) },
      }));
    case 'blood/changed':
      return updateFicha(state, action.id, (ficha) => ({ ...ficha, blood: { ...ficha.blood, [action.field]: action.value } }));
    case 'notes/changed':
      return updateFicha(state, action.id, (ficha) => ({ ...ficha, notes: action.value }));
  }
}
