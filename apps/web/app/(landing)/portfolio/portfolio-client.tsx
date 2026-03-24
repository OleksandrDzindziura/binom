'use client';

import { useState, startTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { useFavorites } from '@/hooks/use-favorites';
import { Heart } from 'lucide-react';



const projectCategories: Record<string, { label: string }> = {
  kitchen: { label: 'Кухня' },
  wardrobe: { label: 'Шафа' },
  bathroom: { label: 'Ванна' },
  office: { label: 'Офіс' },
  other: { label: 'Інше' },
};

export default function PortfolioClient() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);

  const updateFilter = (updater: Parameters<typeof setFilters>[0]) => {
    setFilters(updater);
    setPage(1);
  };
  const { toggle, isFavorite } = useFavorites();

  const { data, isLoading } = useQuery(orpc.catalog.projects.list.queryOptions({
    input: { ...filters, page, limit: 12 },
  }));

  const projects = data?.items ?? [];
  const totalPages = data?.total ?? 1;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-black">Каталог проектів</h1>

        {/* Filters */}
          <select
            className="px-3 py-2 rounded bg-gray-800 border border-slate-700 text-white text-sm mb-3"
            value={filters.category ?? ''}
            onChange={(e) => updateFilter((f) => ({ ...f, category: e.target.value || undefined }))}
          >
            <option value="">Всі категорії</option>
            {Object.entries(projectCategories).map(([key, label]) => (
              <option
                key={key}
                value={key}
              >{label.label}</option>
            ))}
          </select>

        {/* Car Grid */}
        {isLoading
          ? (
            <div className="text-center py-12 text-slate-400">Завантаження...</div>
          )
          : projects.length === 0
            ? (
              <div className="text-center py-12 text-slate-400">Проектів не знайдено</div>
            )
            : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400/50 transition-colors group relative"
                    >
                      <button
                        onClick={() => toggle(p.id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        aria-label={isFavorite(p.id)
                          ? 'Видалити з вибраного'
                          : 'Додати у вибране'}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            isFavorite(p.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-white/70 hover:text-white'
                          }`}
                        />
                      </button>
                      <Link href={`/portfolio/${p.id}`}>
                        <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center overflow-hidden">
                          {p.imageUrl
                            ? (
                              <Image
                                src={p.imageUrl}
                                alt={`${p.title}`}
                                width={400}
                                height={300}
                                className="w-full h-full object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            )
                            : (
                              <span className="text-slate-500 text-sm">Фото</span>
                            )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                                {p.title}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                            <span>{projectCategories[p.category]?.label ?? p.category}</span>
                        </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => startTransition(() => setPage(p))}
                        className={`px-4 py-2 rounded text-sm ${
                          p === page
                            ? 'bg-amber-500 text-slate-900 font-semibold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
      </div>
    </div>
  );
}
