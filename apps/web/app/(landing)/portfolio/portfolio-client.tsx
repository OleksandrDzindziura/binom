'use client';

import { useState, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import FurnitureCard from '@/components/landing/FurnitureCard';



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
  const { data, isLoading } = useQuery(orpc.catalog.projects.list.queryOptions({
    input: { ...filters, page, limit: 12 },
  }));

  const projects = data?.items ?? [];
  const totalPages = data?.total ?? 1;

  return (
    <div className="py-8">
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
                    <FurnitureCard key={p.id} id={p.id} title={p.title} imageUrl={p.imageUrl} category={p.category} href={`/portfolio/${p.id}`} />
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
  );
}
