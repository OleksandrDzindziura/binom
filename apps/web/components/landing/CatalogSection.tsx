'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { ChefHat, Package, Bath, Briefcase, Grid2x2, ArrowRight } from 'lucide-react';

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

  const categoryLabelFor = (category: string | undefined | null) => {
    if (!category) return '';
    return categories.find((c) => c.key === category)?.label ?? '';
  };

  const ProjectTile = ({
    project,
    variant,
    className,
  }: {
    project: any;
    variant: 'large' | 'top' | 'bottom';
    className?: string;
  }) => {
    const label = categoryLabelFor(project?.category);

    const aspectClass =
      variant === 'large' ? 'h-full' : 'h-[200px]';

    return (
      <Link
        href={`/portfolio/${project.id}`}
        className={`group block bg-slate-900 border border-slate-800 group overflow-hidden rounded-3xl  transition-colors ${className ?? ''}`}
      >
        <div className={`${aspectClass} bg-slate-800 overflow-hidden relative`}>
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-600">
              <Package className="h-16 w-16" />
            </div>
          )}

          {/* readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/0" />

          <div className="absolute top-6 left-6 right-6 flex items-start justify-between gap-4">
            {label ? (
              <span className="text-xs text-white/80 font-bold tracking-widest uppercase">
                {label}
              </span>
            ) : (
              <span />
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-white font-extrabold uppercase tracking-wide">
              {project.title}
            </h3>
            {project.description ? (
              <p className="mt-2 text-white/70 text-sm line-clamp-2">{project.description}</p>
            ) : null}

            <span className="mt-4 flex gap-1 py-3 text-white font-bold bg-black/10 uppercase text-xs">
              Переглянути
              <ArrowRight className="h-4 w-4 rotate-300 group-hover:ml-2 transition-all duration-300" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section id="catalog" className="py-16 bg-white">
      <div>
        <h2 className="text-3xl md:text-4xl text-black font-extrabold text-center mb-10 uppercase">
          Наші роботи
        </h2>


        {/* Projects Mosaic */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Завантаження...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Проектів не знайдено</div>
        ) : (
          (() => {
            const topProjects = projects.slice(0, 3) as any[];

            return (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
                {topProjects.length === 1 ? (
                  <ProjectTile
                    project={topProjects[0]}
                    variant="large"
                    className="lg:col-span-2 lg:row-span-2"
                  />
                ) : null}

                {topProjects.length === 2 ? (
                  <>
                    <ProjectTile
                      project={topProjects[0]}
                      variant="large"
                      className="lg:row-span-2"
                    />
                    <ProjectTile
                      project={topProjects[1]}
                      variant="top"
                      className="lg:row-start-1 lg:col-start-2"
                    />
                  </>
                ) : null}

                {topProjects.length >= 3 ? (
                  <>
                    <ProjectTile
                      project={topProjects[0]}
                      variant="large"
                      className="lg:row-span-2"
                    />
                    <ProjectTile
                      project={topProjects[1]}
                      variant="top"
                      className="lg:row-start-1 lg:col-start-2"
                    />
                    <ProjectTile
                      project={topProjects[2]}
                      variant="bottom"
                      className="lg:row-start-2 lg:col-start-2"
                    />
                  </>
                ) : null}
              </div>
            );
          })()
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
