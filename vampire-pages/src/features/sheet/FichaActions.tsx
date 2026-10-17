import type { Ficha } from '../../domain/character.ts';
import { serializeSheetFile } from '../../schema/importExport.ts';
import { useSheets } from '../../store/SheetsProvider.tsx';
import { MoreIcon } from '../../ui/icons.tsx';
import { Menu, type MenuItem } from '../../ui/Menu.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { downloadText, jsonFileName } from './fileTransfer.ts';

interface FichaActionsProps {
  ficha: Ficha;
  /** Duplicate and delete are edits: hidden in read-only mode. */
  readOnly: boolean;
  onPrint: (id: string) => void;
  /** Opens the player's cheat sheet, page 2 (this character). */
  onCola: (id: string) => void;
  onDuplicated: (copyId: string) => void;
  onDeleted: () => void;
  /** After "Desfazer" put the ficha back. */
  onRestored: (id: string) => void;
  align?: 'start' | 'end';
}

/** "⋯" menu of one ficha, the same on the sheet and on its Mesa card. */
export function FichaActions({ ficha, readOnly, onPrint, onCola, onDuplicated, onDeleted, onRestored, align = 'start' }: FichaActionsProps) {
  const { state, dispatch } = useSheets();
  const { notify } = useToast();

  const exportJson = () => {
    downloadText(jsonFileName(ficha.name), serializeSheetFile([ficha]));
    notify(`Ficha de ${ficha.name} exportada.`);
  };

  const duplicate = () => {
    const copyId = crypto.randomUUID();
    dispatch({ type: 'ficha/duplicated', id: ficha.id, newId: copyId });
    onDuplicated(copyId);
    notify(`Cópia de "${ficha.name}" criada.`);
  };

  // No confirm: the toast offers to undo, putting the ficha back where it was.
  const remove = () => {
    const index = state.fichas.findIndex((other) => other.id === ficha.id);
    dispatch({ type: 'ficha/deleted', id: ficha.id });
    onDeleted();
    notify(`Ficha "${ficha.name}" excluída.`, {
      label: 'Desfazer',
      onSelect: () => {
        dispatch({ type: 'ficha/restored', ficha, index });
        onRestored(ficha.id);
      },
    });
  };

  const items: MenuItem[] = [
    { label: 'Exportar JSON', onSelect: exportJson },
    { label: 'Exportar PDF (impressão)', onSelect: () => onPrint(ficha.id) },
    { label: 'Cola do jogador (página 2)', onSelect: () => onCola(ficha.id) },
    ...(readOnly
      ? []
      : [
          { label: 'Duplicar ficha', onSelect: duplicate },
          { label: 'Excluir ficha', onSelect: remove, danger: true },
        ]),
  ];

  return <Menu label={`Ações da ficha ${ficha.name}`} trigger={<MoreIcon />} items={items} align={align} />;
}
