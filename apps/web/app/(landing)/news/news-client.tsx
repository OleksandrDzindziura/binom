'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';

export default function NewsClient() {
  const { data: articles, isLoading } = useQuery(orpc.cms.articles.list.queryOptions({
    input: { publishedOnly: true },
  }));

  if (isLoading) return <div className="container mx-auto px-4 py-12 text-center text-slate-400">Завантаження...</div>;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Новини</h1>
        <div className="space-y-6">
          {(articles ?? []).map((article) => (
            <article
              key={article.id}
              className="bg-slate-900 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
              {article.publishedAt && (
                <p className="text-xs text-slate-500 mb-3">
                  {new Date(article.publishedAt).toLocaleDateString('uk-UA')}
                </p>
              )}
              <p className="text-slate-300">{article.content?.slice(0, 200)}...</p>
            </article>
          ))}
          {(articles ?? []).length === 0 && (
            <p className="text-center text-slate-400">Новин ще немає</p>
          )}
        </div>
      </div>
    </div>
  );
}
