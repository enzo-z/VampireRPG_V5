// Turns a chosen photo into a small JPEG data URL (3 × 4 portrait) so it fits
// comfortably in localStorage and in exported JSON files.

const ACCEPTED_TYPES: ReadonlySet<string> = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Value for the `accept` attribute of photo file inputs. */
export const PHOTO_ACCEPT = [...ACCEPTED_TYPES].join(',');
/** Largest source file accepted; the stored photo is always much smaller. */
export const PHOTO_MAX_BYTES = 8 * 1024 * 1024;

const MAX_WIDTH = 360;
const MAX_HEIGHT = 480;
const QUALITY = 0.85;

/** Why a file cannot be used as a photo, or null when it can. */
export function photoProblem(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) return 'Escolha uma foto JPEG (PNG e WebP também servem).';
  if (file.size > PHOTO_MAX_BYTES) {
    const megabytes = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');
    return `Foto grande demais (${megabytes} MB); o limite é ${PHOTO_MAX_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    image.src = url;
  });
}

/** Validates, center-crops to 3:4 and scales down to at most 360 × 480 JPEG. */
export async function readPhoto(file: File): Promise<string> {
  const problem = photoProblem(file);
  if (problem !== null) throw new Error(problem);

  const image = await loadImage(file);
  const targetRatio = 3 / 4;
  const sourceRatio = image.width / image.height;
  const cropWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
  const cropHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
  const scale = Math.min(1, MAX_WIDTH / cropWidth, MAX_HEIGHT / cropHeight);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropWidth * scale);
  canvas.height = Math.round(cropHeight * scale);
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas indisponível.');
  context.drawImage(image, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}
