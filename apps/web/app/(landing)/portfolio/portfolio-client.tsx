'use client';

import { useState, startTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { formatUSD } from '@repo/schemas';
import { useFavorites } from '@/hooks/use-favorites';
import { Heart } from 'lucide-react';

const statusLabels: Record<string, string> = {
  in_stock: 'В наявності',
  on_order: 'На замовлення',
  in_transit: 'В дорозі',
};

const statusColors: Record<string, string> = {
  in_stock: 'bg-green-500',
  on_order: 'bg-yellow-500',
  in_transit: 'bg-blue-500',
};

const engineLabels: Record<string, string> = {
  petrol: 'Бензин',
  diesel: 'Дизель',
  electric: 'Електро',
  hybrid: 'Гібрид',
  lpg: 'Газ',
  petrol_lpg: 'Газ пропан-бутан/Бензин',
  petrol_cng: 'Газ метан/Бензин',
  hybrid_petrol: 'Гібрид (HEV)',
  hybrid_diesel: 'Гібрид/Дизель',
  plug_in_hybrid: 'Гібрид (PHEV)',
  hybrid_mhev: 'Гібрид (MHEV)',
  hybrid_reev: 'Гібрид (REEV)',
};

const transmissionLabels: Record<string, string> = {
  manual_5: 'Механіка 5-ст.',
  manual_6: 'Механіка 6-ст.',
  manual: 'Механіка',
  automatic: 'Автомат',
  tiptronic: 'Типтронік',
  robot: 'Робот',
  variator: 'Варіатор',
};

const locationLabels: Record<string, string> = {
  rivne: 'м. Рівне, Млинівська 29 Б',
  obariv: 'Обарів, вул. Миколаївська, 1',
};

export default function PortfolioClient() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [filterKey, setFilterKey] = useState(0);

  const updateFilter = (updater: Parameters<typeof setFilters>[0]) => {
    setFilters(updater);
    setPage(1);
  };
  const { toggle, isFavorite } = useFavorites();

  const { data: makes } = useQuery(orpc.catalog.makes.list.queryOptions({ input: {} }));
  const { data: models } = useQuery(orpc.catalog.models.list.queryOptions({
    input: { makeId: filters.makeId },
  }));
  const { data, isLoading } = useQuery(orpc.catalog.cars.list.queryOptions({
    input: { ...filters, page, limit: 12 },
  }));

  const cars = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Каталог автомобілів</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-slate-900 rounded-lg">
          <select
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            value={filters.makeId ?? ''}
            onChange={(e) => updateFilter((f) => ({ ...f, makeId: e.target.value ? Number(e.target.value) : undefined, modelId: undefined }))}
          >
            <option value="">Всі марки</option>
            {(makes ?? []).map((m) => (
              <option
                key={m.id}
                value={m.id}
              >{m.name}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            value={filters.modelId ?? ''}
            disabled={!filters.makeId}
            onChange={(e) => updateFilter((f) => ({ ...f, modelId: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">Всі моделі</option>
            {(models ?? []).map((m) => (
              <option
                key={m.id}
                value={m.id}
              >{m.name}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            value={filters.engineType ?? ''}
            onChange={(e) => updateFilter((f) => ({ ...f, engineType: e.target.value || undefined }))}
          >
            <option value="">Тип палива</option>
            {Object.entries(engineLabels).map(([key, label]) => (
              <option
                key={key}
                value={key}
              >{label}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            value={filters.transmission ?? ''}
            onChange={(e) => updateFilter((f) => ({ ...f, transmission: e.target.value || undefined }))}
          >
            <option value="">КПП</option>
            {Object.entries(transmissionLabels).map(([key, label]) => (
              <option
                key={key}
                value={key}
              >{label}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            value={filters.location ?? ''}
            onChange={(e) => updateFilter((f) => ({ ...f, location: e.target.value || undefined }))}
          >
            <option value="">Всі локації</option>
            {Object.entries(locationLabels).map(([key, label]) => (
              <option
                key={key}
                value={key}
              >{label}</option>
            ))}
          </select>

          <input
            key={`priceFrom-${filterKey}`}
            type="number"
            placeholder="Ціна від, $"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm w-28"
            onChange={(e) => updateFilter((f) => ({ ...f, priceFrom: e.target.value ? Number(e.target.value) * 100 : undefined }))}
          />
          <input
            key={`priceTo-${filterKey}`}
            type="number"
            placeholder="Ціна до, $"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm w-28"
            onChange={(e) => updateFilter((f) => ({ ...f, priceTo: e.target.value ? Number(e.target.value) * 100 : undefined }))}
          />

          <input
            key={`yearFrom-${filterKey}`}
            type="number"
            placeholder="Рік від"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm w-24"
            onChange={(e) => updateFilter((f) => ({ ...f, yearFrom: e.target.value ? Number(e.target.value) : undefined }))}
          />
          <input
            key={`yearTo-${filterKey}`}
            type="number"
            placeholder="Рік до"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm w-24"
            onChange={(e) => updateFilter((f) => ({ ...f, yearTo: e.target.value ? Number(e.target.value) : undefined }))}
          />

          <button
            onClick={() => startTransition(() => { setFilters({}); setPage(1); setFilterKey((k) => k + 1); })}
            className="px-3 py-2 text-sm text-amber-400 hover:text-amber-300"
          >
            Скинути фільтри
          </button>
        </div>

        {/* Car Grid */}
        {isLoading
          ? (
            <div className="text-center py-12 text-slate-400">Завантаження...</div>
          )
          : cars.length === 0
            ? (
              <div className="text-center py-12 text-slate-400">Автомобілів не знайдено</div>
            )
            : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400/50 transition-colors group relative"
                    >
                      <button
                        onClick={() => toggle(car.id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        aria-label={isFavorite(car.id)
                          ? 'Видалити з вибраного'
                          : 'Додати у вибране'}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            isFavorite(car.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-white/70 hover:text-white'
                          }`}
                        />
                      </button>
                      <Link href={`/portfolio/${car.id}`}>
                        <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center overflow-hidden">
                          {car.imageUrl
                            ? (
                              <Image
                                src={car.imageUrl}
                                alt={`${car.makeName} ${car.modelName} ${car.year}`}
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
                              {car.makeName} {car.modelName}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[car.status]}`}>
                              {statusLabels[car.status]}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-amber-400 mb-3">{formatUSD(car.priceCents)}</p>
                          <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                            <span>{car.year} рік</span>
                            <span>{engineLabels[car.engineType]}</span>
                            <span>{car.engineVolume
                              ? `${car.engineVolume}${car.engineType === 'electric'
? ' кВт' : 'л'}`
                              : ''}</span>
                            <span>{transmissionLabels[car.transmission]}</span>
                            {car.mileageKm != null && <span>{car.mileageKm.toLocaleString()} км</span>}
                          </div>
                          {car.location && (
                            <p className="mt-2 text-xs text-slate-500">
                              {locationLabels[car.location]}
                            </p>
                          )}
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
