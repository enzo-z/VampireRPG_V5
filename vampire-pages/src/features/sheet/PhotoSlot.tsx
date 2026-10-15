import { useState, type DragEvent } from 'react';
import { useToast } from '../../ui/Toast.tsx';
import { PHOTO_ACCEPT, readPhoto } from '../photo/photo.ts';
import { useSheet } from './SheetContext.tsx';
import styles from './PhotoSlot.module.css';

/** 3 × 4 portrait: click to choose a file or drop an image on it. */
export function PhotoSlot() {
  const { ficha, readOnly, edit } = useSheet();
  const { notify } = useToast();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const photo = ficha.profile.photo;

  const setPhoto = (value: string) => edit({ type: 'profile/changed', id: ficha.id, field: 'photo', value });

  const applyPhoto = async (file: File | undefined) => {
    if (file === undefined || readOnly) return;
    setBusy(true);
    try {
      setPhoto(await readPhoto(file));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não foi possível usar a imagem.');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    void applyPhoto(event.dataTransfer.files[0]);
  };

  const image = photo ? <img className={styles.image} src={photo} alt={`Foto de ${ficha.name}`} /> : null;

  if (readOnly) {
    return (
      <figure className={styles.slot}>
        {image ?? <span className={styles.placeholder}>Sem foto</span>}
      </figure>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label
        className={`${styles.slot} ${styles.editable} ${dragging ? styles.dragging : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {image ?? (
          <span className={styles.placeholder}>
            <span className={styles.placeholderTitle}>Foto 3 × 4</span>
            <span>Clique ou arraste uma imagem</span>
          </span>
        )}
        <span className={styles.overlay} aria-hidden="true">
          {busy ? 'Processando…' : photo ? 'Trocar foto' : 'Escolher foto'}
        </span>
        <input
          type="file"
          accept={PHOTO_ACCEPT}
          className={styles.input}
          aria-label={photo ? 'Trocar a foto do personagem' : 'Escolher a foto do personagem'}
          onChange={(event) => {
            void applyPhoto(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      <p className={styles.hint}>JPEG até 8 MB · recortada em 3 × 4</p>
      {photo !== '' && (
        <button type="button" className={styles.remove} onClick={() => setPhoto('')}>
          Remover foto
        </button>
      )}
    </div>
  );
}
