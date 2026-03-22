'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectCard } from '../_components';

export default function ProjectsArchivePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(orpc.catalog.projects.list.queryOptions({
    input: { publishedOnly: false, isArchived: true, limit: 100 },
  }));

  const deleteProject = useMutation(orpc.catalog.projects.delete.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries(),
  }));

  const unarchiveProject = useMutation(orpc.catalog.projects.unarchive.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Проект розархівовано');
    },
  }));

  if (isLoading) return <div>Завантаження...</div>;

  const projects = data?.items ?? [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Архів проектів</h1>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={(id) => deleteProject.mutate({ id })}
            onUnarchive={(id) => unarchiveProject.mutate({ id })}
            isDeleting={deleteProject.isPending}
          />
        ))}
        {projects.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Архів порожній</p>
        )}
      </div>
    </div>
  );
}
