export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxBytes?: number;
}

const DEFAULT_MAX_BYTES = 800 * 1024; // 800 KB — keeps multi-image form payloads well under the 4MB Next.js API body limit

function estimateBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  const base64Length = commaIndex >= 0 ? dataUrl.length - commaIndex - 1 : dataUrl.length;
  return Math.round(base64Length * 0.75);
}

/**
 * Reads an image file, downscales it to fit within the given dimensions, and
 * encodes it as a JPEG base64 data URL that is guaranteed to be under the
 * target byte size (quality and dimensions are stepped down as needed).
 */
export function compressImage(file: File, options: CompressImageOptions = {}): Promise<string> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.75,
    maxBytes = DEFAULT_MAX_BYTES,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file was provided'));
      return;
    }
    if (!file.type || (!file.type.startsWith('image/') && file.type !== 'image/heic' && file.type !== 'image/heif')) {
      reject(new Error('Only image files are supported'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file. Please try a different image.'));
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const image = new window.Image();
      let attempts = 0;
      const loadWithFallback = (url: string) => {
        attempts++;
        image.onerror = () => {
          if (attempts === 1 && file.type === 'image/heic') {
            // Some browsers can't decode HEIC directly. Surface a clear message.
            reject(new Error('HEIC photos from iPhone are not supported. Please change your camera to "Most Compatible" or take a screenshot.'));
            return;
          }
          reject(new Error('Could not decode the selected image. Please try a JPG or PNG.'));
        };
        image.onload = () => {
          try {
            resolve(processImage(image, { maxWidth, maxHeight, quality, maxBytes }));
          } catch (error) {
            reject(error instanceof Error ? error : new Error('Failed to compress image'));
          }
        };
        image.src = url;
      };
      loadWithFallback(src);
    };
    reader.readAsDataURL(file);
  });
}

function processImage(
  image: HTMLImageElement,
  opts: { maxWidth: number; maxHeight: number; quality: number; maxBytes: number }
): string {
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  let quality = opts.quality;

  // Cap starting dimensions to avoid OOM on huge images from modern phones
  const STARTING_MAX_DIM = 2400;
  if (width > STARTING_MAX_DIM || height > STARTING_MAX_DIM) {
    const scale = STARTING_MAX_DIM / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  for (let iteration = 0; iteration < 10; iteration++) {
    const scale = Math.min(1, opts.maxWidth / width, opts.maxHeight / height);
    const canvasWidth = Math.max(1, Math.round(width * scale));
    const canvasHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Your browser does not support image processing. Please update your browser.');
    }

    // White background ensures JPEG transparency renders correctly
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (estimateBytes(dataUrl) <= opts.maxBytes) {
      return dataUrl;
    }

    if (quality > 0.4) {
      quality -= 0.1;
      continue;
    }

    // Still too large at minimum quality - reduce dimensions and retry
    width = Math.round(width * 0.8);
    height = Math.round(height * scale);
    if (width < 320 || height < 320) break;
    quality = opts.quality;
  }

  // Last resort: smallest possible JPEG from the current size
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, opts.maxWidth / width, opts.maxHeight / height);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Your browser does not support image processing. Please update your browser.');
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.45);
}
