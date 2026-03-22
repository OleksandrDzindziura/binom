'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AppOutputs } from '@/lib/orpc';

type NewsArticle = AppOutputs['cms']['articles']['list'][number];

interface ArticleCardProps {
  article: NewsArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-medium truncate">{article.title}</p>
          <p className="text-sm text-muted-foreground truncate">{article.slug}</p>
        </div>
        <Badge
          className="w-fit"
          variant={article.isPublished
            ? 'default'
            : 'secondary'}
        >
          {article.isPublished
            ? 'Опубліковано'
            : 'Чернетка'}
        </Badge>
      </CardContent>
    </Card>
  );
}
