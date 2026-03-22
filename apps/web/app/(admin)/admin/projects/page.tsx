'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectCard } from './_components';

export default function ProjectsAdminPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(orpc.catalog.projects.list.queryOptions({
    input: { publishedOnly: false, isArchived: false, limit: 100 },
  }));

  const deleteProject = useMutation(orpc.catalog.projects.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }));

  const archiveProject = useMutation(orpc.catalog.projects.archive.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Проект переміщено в архів');
    },
    onError: () => toast.error('Не вдалося архівувати проект'),
  }));

  const projects = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((p) =>
      `${p.title} ${p.description ?? ''} ${p.category}`.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  if (isLoading) return <div>Завантаження...</div>;
  if (error) return <div className="text-red-500">Помилка: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Виконані роботи</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/projects/archive">
              <Archive className="mr-2 h-4 w-4" />
              Архів
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Додати проект
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук по назві, опису, категорії..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={(id) => deleteProject.mutate({ id })}
            onArchive={(id) => archiveProject.mutate({ id })}
            isDeleting={deleteProject.isPending}
          />
        ))}
        {projects.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {search ? 'Нічого не знайдено' : 'Проекти ще не додані'}
          </p>
        )}
      </div>
    </div>
  );
}
