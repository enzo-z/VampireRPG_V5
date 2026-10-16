import { useEffect } from 'react';
import printStyles from '../print/PrintView.module.css';
import { SecretDocumentPage } from './SecretDocumentPage.tsx';
import { useSecretsCatalog } from './useSecretsCatalog.ts';

/** CSS string literal for a page footer. */
const cssString = (text: string) => `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** Footer on every printed page: "Khalid Hassan Yusuf · p. 2 de 5". */
function pageFooter(character: string): string {
  return `@page { @bottom-right { content: ${cssString(`${character} · p. `)} counter(page) " de " counter(pages);
    font-family: var(--font-sans); font-size: var(--font-size-2xs); color: var(--color-text-subtle); } }`;
}

/** One player's secret document, full screen like the print view: back, print. */
export function SecretDocView({ slug, onBack }: { slug: string; onBack: () => void }) {
  const catalog = useSecretsCatalog();
  const document = catalog?.documents.find((candidate) => candidate.slug === slug) ?? null;

  // The browser names the saved PDF after the page title.
  useEffect(() => {
    if (document === null) return;
    const previous = window.document.title;
    window.document.title = document.title;
    return () => {
      window.document.title = previous;
    };
  }, [document]);

  return (
    <div className={printStyles.view}>
      <div className={printStyles.toolbar} data-print="hide">
        <button type="button" className={printStyles.action} onClick={onBack}>
          ← Voltar
        </button>
        {document !== null && (
          <>
            <button type="button" className={printStyles.primary} onClick={() => void window.document.fonts.ready.then(() => window.print())}>
              Imprimir / salvar PDF
            </button>
            <span className={printStyles.hint}>Só para o jogador de {document.character}. No diálogo: papel A4, margens padrão.</span>
          </>
        )}
      </div>
      <div className={printStyles.stage}>
        {catalog === null ? (
          <p className={printStyles.hint}>Carregando…</p>
        ) : document === null ? (
          <p className={printStyles.hint}>Documento não encontrado. Ele ainda tem publicar: true?</p>
        ) : (
          <>
            <style>{pageFooter(document.character)}</style>
            <SecretDocumentPage document={document} />
          </>
        )}
      </div>
    </div>
  );
}
