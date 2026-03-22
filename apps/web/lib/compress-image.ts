import imageCompression from 'browser-image-compression';

const OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp' as const,
};

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const compressed = await imageCompression(file, OPTIONS);

  const name = file.name.replace(/\.\w+$/, '.webp');
  return new File([compressed], name, { type: 'image/webp' });
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
