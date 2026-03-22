'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { categoryLabels, categoryColors } from './project-labels';
import type { AppOutputs } from '@/lib/orpc';

type ProjectListItem = AppOutputs['catalog']['projects']['list']['items'][number];

interface ProjectCardProps {
  project: ProjectListItem;
  onDelete: (_id: number) => void;
  onArchive?: (_id: number) => void;
  onUnarchive?: (_id: number) => void;
  isDeleting: boolean;
}

export function ProjectCard({ project, onDelete, onArchive, onUnarchive, isDeleting }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-4">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt="" className="h-16 w-24 object-cover rounded shrink-0" />
            ) : (
              <div className="h-16 w-24 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground shrink-0">Фото</div>
            )}
            <div className="min-w-0">
              <p className="font-medium truncate">{project.title}</p>
              {project.description && (
                <p className="text-sm text-muted-foreground truncate max-w-xs">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant={project.isPublished ? 'default' : 'secondary'}>
              {project.isPublished ? 'Опубліковано' : 'Чернетка'}
            </Badge>
            <Badge className={categoryColors[project.category]}>
              {categoryLabels[project.category]}
            </Badge>
            {project.isFeatured && <Badge variant="outline">Рекомендоване</Badge>}
            {project.isArchived && <Badge variant="destructive">Архів</Badge>}
            {onUnarchive ? (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUnarchive(project.id)}
                title="Розархівувати"
              >
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/admin/projects/${project.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                {onArchive && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onArchive(project.id)}
                    title="Архівувати"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              disabled={isDeleting}
              onClick={() => {
                if (confirm('Видалити цей проект? Фото також будуть видалені.')) {
                  onDelete(project.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
