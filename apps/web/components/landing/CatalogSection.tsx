'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { ChefHat, Package, Bath, Briefcase, Grid2x2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const categories = [
  { key: 'kitchen', label: 'Кухні', icon: ChefHat },
  { key: 'wardrobe', label: 'Шафи', icon: Package },
  { key: 'bathroom', label: 'Ванна кімната', icon: Bath },
  { key: 'office', label: 'Офіс', icon: Briefcase },
  { key: 'other', label: 'Інше', icon: Grid2x2 },
] as const;

export function CatalogSection() {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const { data, isLoading } = useQuery(
    orpc.catalog.projects.list.queryOptions({
      input: {
        category: categoryFilter as any,
        publishedOnly: true,
        limit: 12,
      },
    }),
  );

  const projects = data?.items ?? [];

  return (
    <section id="catalog" className="py-16 bg-slate-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 uppercase">
          Наші роботи
        </h2>

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <button
            onClick={() => setCategoryFilter(undefined)}
            className={`px-5 py-2.5 font-bold text-sm uppercase transition-colors ${
              !categoryFilter
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-900 border border-slate-700 text-white hover:border-amber-400/50'
            }`}
          >
            Всі
          </button>
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(categoryFilter === key ? undefined : key)}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm uppercase transition-colors ${
                categoryFilter === key
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-900 border border-slate-700 text-white hover:border-amber-400/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Projects Carousel */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Завантаження...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Проектів не знайдено</div>
        ) : (
          <Carousel opts={{ align: 'start', loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {projects.map((project: any) => (
                <CarouselItem key={project.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Link
                    href={`/portfolio/${project.id}`}
                    className="bg-slate-900 border border-slate-800 overflow-hidden group h-full flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-slate-800 overflow-hidden">
                      {project.imageUrl ? (
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          width={600}
                          height={450}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Package className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold uppercase mb-3">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <span className="mt-auto block w-full py-3 text-center border-2 border-amber-400 text-white font-bold group-hover:bg-amber-400/10 transition-colors uppercase text-sm">
                        Переглянути
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-amber-400" />
            <CarouselNext className="hidden md:flex -right-4 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-amber-400" />
          </Carousel>
        )}

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/portfolio"
            className="inline-block px-10 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg transition-colors uppercase"
          >
            Переглянути всі роботи
          </Link>
        </div>
      </div>
    </section>
  );
}
