'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { PageCard } from './_components';

export default function PagesAdminPage() {
  const { data, isLoading } = useQuery(orpc.cms.pages.list.queryOptions({
    input: { publishedOnly: false },
  }));

  if (isLoading) return <div>Завантаження...</div>;

  const pagesList = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Сторінки</h1>
      </div>
      <div className="grid gap-4">
        {pagesList.map((page) => (
          <PageCard
            key={page.id}
            page={page}
          />
        ))}
        {pagesList.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Сторінок ще немає</p>
        )}
      </div>
    </div>
  );
}
