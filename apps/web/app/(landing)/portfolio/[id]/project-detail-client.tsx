'use client';

import { useState, useCallback, useEffect, useRef, startTransition } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { CallbackForm } from '@/components/landing/CallbackForm';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Heart, X } from 'lucide-react';
import YALightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { useFavorites } from '@/hooks/use-favorites';

const projectCategoryLabels: Record<string, string> = {
  kitchen: 'Кухня',
  wardrobe: 'Шафа',
  bathroom: 'Ванна',
  office: 'Офіс',
  other: 'Інше',
};

const projectCategoryColors: Record<string, string> = {
  kitchen: 'bg-orange-500',
  wardrobe: 'bg-purple-500',
  bathroom: 'bg-blue-500',
  office: 'bg-gray-500',
  other: 'bg-green-500',
};

export default function ProjectDetailClient({ id }: { id: string }) {
  const { data: project, isLoading } = useQuery(orpc.catalog.projects.getById.queryOptions({
    input: { id: parseInt(id) },
  }));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { toggle, isFavorite } = useFavorites();

  if (isLoading) return <div className="container mx-auto px-4 py-12 text-center text-slate-400">Завантаження...</div>;
  if (!project) return <div className="container mx-auto px-4 py-12 text-center text-slate-400">Проект не знайдено</div>;

  // Alias for existing JSX blocks (the page was originally implemented for cars).
  const projectData = project;

  const images = project.images ?? [];
  const projectName = project.title;
  const categoryLabel = projectCategoryLabels[project.category] ?? project.category;
  const projectPrice = categoryLabel;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/portfolio"
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад до каталогу
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Photo Gallery */}
          <div>
            {images.length > 0
              ? (
                <div
                  className="aspect-[4/3] bg-slate-800 rounded-lg overflow-hidden cursor-pointer relative group"
                  onClick={() => startTransition(() => setLightboxOpen(true))}
                >
                  <img
                    src={images[selectedIndex].url}
                    alt={`${projectName} — фото ${selectedIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-black/50 px-3 py-1.5 rounded-full">
                      {selectedIndex + 1} / {images.length}
                    </span>
                  </div>
                </div>
              )
              : (
                <div className="aspect-[4/3] bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-slate-500">Фото відсутнє</span>
                </div>
              )}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2 mt-2">
                {images.slice(0, 6).map((img: any, i: number) => {
                  const isLast = i === 5 && images.length > 6;
                  const remaining = images.length - 6;
                  return (
                    <button
                      key={img.id}
                      onClick={() => {
                        setSelectedIndex(i);
                        if (isLast) startTransition(() => setLightboxOpen(true));
                      }}
                      className={`relative aspect-square bg-slate-800 rounded overflow-hidden border-2 transition-colors ${
                        i === selectedIndex
                          ? 'border-amber-400'
                          : 'border-transparent hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${projectName} — мініатюра ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isLast && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{remaining}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-black">
                {projectName}
              </h1>
              <span className={`text-xs px-3 py-1 rounded-full text-white ${projectCategoryColors[project.category] ?? 'bg-amber-400'}`}>
                {categoryLabel}
              </span>
              <button
                onClick={() => toggle(project.id)}
                className="ml-auto p-2 rounded-full hover:bg-slate-800 transition-colors"
                aria-label={isFavorite(project.id)
                  ? 'Видалити з вибраного'
                  : 'Додати у вибране'}
              >
                <Heart
                  className={`h-6 w-6 transition-colors ${
                    isFavorite(project.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                />
              </button>
            </div>

            <div className="bg-slate-900 rounded-lg overflow-hidden mb-6">
              <div className="flex justify-between px-4 py-3 bg-slate-800/50">
                <span className="text-slate-400">Категорія</span>
                <span className="text-white font-medium">{categoryLabel}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-400">Зображення</span>
                <span className="text-white font-medium">{images.length}</span>
              </div>
            </div>

            {project.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-black">Опис</h3>
                <p className="text-slate-300 break-words whitespace-pre-wrap">{project.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Callback Form */}
        <section className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-black">
            Цікавить цей проект? <span className="text-amber-400">Залиште заявку!</span>
          </h2>
          <CallbackForm />
        </section>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setSelectedIndex}
          projectName={projectName}
          projectPrice={projectPrice}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  initialIndex,
  onClose,
  onIndexChange,
    projectName,
  projectPrice,
}: {
  images: { id: number; url: string }[];
  initialIndex: number;
  onClose: () => void;
  onIndexChange: (_i: number) => void;
  projectName: string;
  projectPrice: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomOpen, setZoomOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = useCallback((dir: 1 | -1) => {
    setIndex((prev) => (prev + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    onIndexChange(index);
    thumbRefs.current[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [index, onIndexChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (zoomOpen) return; // YALightbox handles its own keys
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, go, zoomOpen]);

  const slides = images.map((img) => ({ src: img.url }));

  return (
    <>
      {/* ══ ZOOM — yet-another-react-lightbox ══════════════════════ */}
      {zoomOpen && (
        <YALightbox
          open={zoomOpen}
          close={() => setZoomOpen(false)}
          slides={slides}
          index={index}
          on={{ view: ({ index: i }) => setIndex(i) }}
          plugins={[Zoom]}
          zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
          styles={{ root: { zIndex: 1100 } }}
        />
      )}

      {/* ══ MAIN LIGHTBOX ══════════════════════════════════════════ */}
      <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col md:flex-row">

        {/* ── MOBILE ─────────────────────────────── */}
        <div className="md:hidden flex flex-col h-full">
          <div className="flex items-start justify-between px-4 pt-4 pb-3 shrink-0">
            <div>
              <p className="text-white font-bold text-base leading-tight">{projectName}</p>
              <p className="text-white font-bold text-xl mt-0.5">{projectPrice}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 ml-3 shrink-0 mt-0.5"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.url}
                alt={`${projectName} — фото ${i + 1}`}
                className="w-full object-contain block cursor-zoom-in"
                onClick={() => { setIndex(i); setZoomOpen(true); }}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP ────────────────────────────── */}
        <div className="hidden md:flex w-full h-full">

          {/* Left: thumbnail strip */}
          <div className="w-[136px] flex flex-col bg-black/40 shrink-0">
            <button
              onClick={() => go(-1)}
              className="flex items-center justify-center py-2.5 text-white/40 hover:text-white transition-colors shrink-0"
            >
              <ChevronUp className="h-5 w-5" />
            </button>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-2.5 py-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  ref={(el) => { thumbRefs.current[i] = el; }}
                  onClick={() => setIndex(i)}
                  className={`relative shrink-0 aspect-[4/3] rounded overflow-hidden border-2 transition-all duration-150 ${
                    i === index
                      ? 'border-white opacity-100'
                      : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Мініатюра ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="flex items-center justify-center py-2.5 text-white/40 hover:text-white transition-colors shrink-0"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Center: main photo — click to zoom */}
          <div className="flex-1 relative flex items-center justify-center">
            <img
              src={images[index].url}
              alt={`${projectName} — фото ${index + 1}`}
              className="max-h-full max-w-full object-contain p-6 cursor-zoom-in"
              onClick={() => setZoomOpen(true)}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/40 px-3 py-1 rounded-full pointer-events-none">
              {index + 1} / {images.length}
            </div>
          </div>

          {/* Right: info panel */}
          <div className="w-72 bg-zinc-900 flex flex-col shrink-0 p-6">
            <div className="flex items-start justify-between mb-1">
              <p className="text-white font-bold text-xl leading-snug pr-2">{projectName}</p>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white shrink-0 p-0.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-2xl font-bold text-white">{projectPrice}</p>
          </div>
        </div>
      </div>
    </>
  );
}
