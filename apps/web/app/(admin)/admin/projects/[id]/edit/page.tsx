'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import EditProjectForm from '../../_components/EditProjectForm';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = parseInt(id);

  const { data: project, isLoading } = useQuery(orpc.catalog.projects.getById.queryOptions({ input: { id: projectId } }));

  if (isLoading) return <div className="p-8">Завантаження...</div>;
  if (!project) return <div className="p-8">Проект не знайдено</div>;

  return (
    <EditProjectForm project={project} projectId={projectId} />
  );
}
