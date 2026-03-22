'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AppOutputs } from '@/lib/orpc';

type Page = AppOutputs['cms']['pages']['list'][number];

interface PageCardProps {
  page: Page;
}

export function PageCard({ page }: PageCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-medium truncate">{page.title}</p>
          <p className="text-sm text-muted-foreground truncate">/{page.slug}</p>
        </div>
        <Badge
          className="w-fit"
          variant={page.isPublished
            ? 'default'
            : 'secondary'}
        >
          {page.isPublished
            ? 'Опубліковано'
            : 'Чернетка'}
        </Badge>
      </CardContent>
    </Card>
  );
}
