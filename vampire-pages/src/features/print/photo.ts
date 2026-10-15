// Downscales a chosen photo to a small JPEG data URL (3 × 4 portrait) so it
// fits comfortably in localStorage and in exported JSON files.

const MAX_WIDTH = 360;
const MAX_HEIGHT = 480;
const QUALITY = 0.85;

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

/** Center-crops to 3:4 and scales down to at most 360 × 480. */
export async function photoDataUrl(file: File): Promise<string> {
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
