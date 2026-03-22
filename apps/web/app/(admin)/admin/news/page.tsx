'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { ArticleCard } from './_components';

export default function NewsAdminPage() {
  const { data, isLoading } = useQuery(orpc.cms.articles.list.queryOptions({
    input: { publishedOnly: false },
  }));

  if (isLoading) return <div>Завантаження...</div>;

  const articles = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Новини</h1>
      </div>
      <div className="grid gap-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
          />
        ))}
        {articles.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Новин ще немає</p>
        )}
      </div>
    </div>
  );
}
