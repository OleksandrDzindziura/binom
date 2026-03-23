'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Star } from 'lucide-react';

export type PendingImage = {
  file: File;
  previewUrl: string;
  isMain: boolean;
};

export type ExistingImage = {
  id: number;
  url: string;
  isMain: boolean;
};

type ImageUploadProps = {
  existingImages?: ExistingImage[];
  onExistingChange?: (images: ExistingImage[]) => void;
  /** Called when user removes an existing (already-saved) image. */
  onRemoveExisting?: (id: number) => void;
  pendingImages: PendingImage[];
  onPendingChange: (images: PendingImage[]) => void;
  maxImages?: number;
};

export default function ImageUpload({
  existingImages = [],
  onExistingChange,
  onRemoveExisting,
  pendingImages,
  onPendingChange,
  maxImages = 20,
}: ImageUploadProps) {
  const totalCount = existingImages.length + pendingImages.length;
  const anyMain = existingImages.some((img) => img.isMain) || pendingImages.some((img) => img.isMain);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: PendingImage[] = Array.from(files).map((file, i) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: !anyMain && i === 0 && existingImages.length === 0 && pendingImages.length === 0,
    }));

    onPendingChange([...pendingImages, ...newImages].slice(0, maxImages - existingImages.length));
  }, [pendingImages, onPendingChange, maxImages, existingImages, anyMain]);

  const removeExisting = (index: number) => {
    if (!onExistingChange) return;
    onRemoveExisting?.(existingImages[index]?.id);
    const updated = existingImages.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isMain) && !pendingImages.some((img) => img.isMain)) {
      updated[0].isMain = true;
    }
    onExistingChange(updated);
  };

  const removePending = (index: number) => {
    URL.revokeObjectURL(pendingImages[index].previewUrl);
    const updated = pendingImages.filter((_, i) => i !== index);
    if (!existingImages.some((img) => img.isMain) && updated.length > 0 && !updated.some((img) => img.isMain)) {
      updated[0].isMain = true;
    }
    onPendingChange(updated);
  };

  const setMainExisting = (index: number) => {
    if (!onExistingChange) return;
    onExistingChange(existingImages.map((img, i) => ({ ...img, isMain: i === index })));
    onPendingChange(pendingImages.map((img) => ({ ...img, isMain: false })));
  };

  const setMainPending = (index: number) => {
    if (onExistingChange) {
      onExistingChange(existingImages.map((img) => ({ ...img, isMain: false })));
    }
    onPendingChange(pendingImages.map((img, i) => ({ ...img, isMain: i === index })));
  };

  const renderCard = (
    src: string,
    isMain: boolean,
    onSetMain: () => void,
    onRemove: () => void,
    key: string,
    index: number,
  ) => (
    <div key={key} className="relative group aspect-[4/3] rounded-lg overflow-hidden border">
      <img src={src} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20 [@media(hover:hover)]:bg-black/0 [@media(hover:hover)]:group-hover:bg-black/40 transition-colors" />
      <div className="absolute top-1 right-1 flex gap-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity">
        <Button type="button" variant="secondary" size="icon" className="h-8 w-8 md:h-7 md:w-7" onClick={onSetMain} title="Зробити головною">
          <Star className={`h-4 w-4 md:h-3.5 md:w-3.5 ${isMain ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
        <Button type="button" variant="destructive" size="icon" className="h-8 w-8 md:h-7 md:w-7" onClick={onRemove}>
          <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </Button>
      </div>
      {isMain && (
        <span className="absolute bottom-1 left-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded font-medium">
          Головна
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {existingImages.map((img, i) =>
          renderCard(img.url, img.isMain, () => setMainExisting(i), () => removeExisting(i), `existing-${img.id}`, i),
        )}
        {pendingImages.map((img, i) =>
          renderCard(img.previewUrl, img.isMain, () => setMainPending(i), () => removePending(i), img.previewUrl, existingImages.length + i),
        )}

        {totalCount < maxImages && (
          <label className="aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Додати фото</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {totalCount} / {maxImages} фото
        </p>
      )}
    </div>
  );
}
