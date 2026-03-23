'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import type { AppOutputs } from '@/lib/orpc';
import { useAppForm } from '@/hooks/forms/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUpload, { type PendingImage, type ExistingImage } from '@/components/form/ImageUpload';
import ProjectFormFields from './ProjectFormFields';

type ProjectDetail = NonNullable<AppOutputs['catalog']['projects']['getById']>;

export interface EditProjectFormProps {
  project: ProjectDetail;
  projectId: number;
}

export default function EditProjectForm({ project, projectId }: EditProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    (project.images ?? []).map((img) => ({ id: img.id, url: img.url, isMain: img.isMain }))
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

  const getUploadUrl = useMutation(orpc.upload.getUploadUrl.mutationOptions());
  const addProjectImage = useMutation(orpc.catalog.images.add.mutationOptions());
  const deleteProjectImage = useMutation(orpc.catalog.images.delete.mutationOptions());
  const setMainImage = useMutation(orpc.catalog.images.setMain.mutationOptions());
  const reorderImages = useMutation(orpc.catalog.images.reorder.mutationOptions());
  const updateProject = useMutation(orpc.catalog.projects.update.mutationOptions());

  const form = useAppForm({
    defaultValues: {
      title: project.title,
      description: project.description ?? '',
      category: project.category,
      isPublished: project.isPublished,
      isFeatured: project.isFeatured,
    },
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      try {
        await updateProject.mutateAsync({
          id: projectId,
          data: {
            title: value.title,
            description: value.description || undefined,
            category: value.category as 'кухня' | 'шафа' | 'ванна' | 'офіс' | 'інше',
            isPublished: value.isPublished,
            isFeatured: value.isFeatured,
          },
        });

        // Delete removed images
        for (const imageId of removedImageIds) {
          await deleteProjectImage.mutateAsync({ id: imageId });
        }

        // Upload new images
        const addedIds: number[] = [];
        for (let i = 0; i < pendingImages.length; i++) {
          const img = pendingImages[i];
          const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
            filename: img.file.name,
            category: 'project_photo',
            contentType: img.file.type,
          });
          await fetch(uploadUrl, { method: 'PUT', body: img.file, headers: { 'Content-Type': img.file.type } });
          const added = await addProjectImage.mutateAsync({
            projectId,
            url: publicUrl,
            order: existingImages.length + i,
            isMain: img.isMain,
          });
          addedIds.push(added.id);
        }

        // Set main image if changed
        const mainExisting = existingImages.find((i) => i.isMain);
        if (mainExisting) {
          await setMainImage.mutateAsync({ imageId: mainExisting.id, projectId });
        }

        // Reorder
        const finalIds = [...existingImages.map((i) => i.id), ...addedIds];
        if (finalIds.length > 0) {
          await reorderImages.mutateAsync({ projectId, imageIds: finalIds });
        }

        await queryClient.invalidateQueries();
        toast.success('Проект оновлено');
        router.push('/admin/projects');
      } catch (err) {
        console.error('Failed to update project:', err);
        toast.error('Не вдалося оновити проект');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Редагувати проект</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }}
        className="space-y-6"
      >
        <ProjectFormFields form={form} />

        <Card>
          <CardHeader><CardTitle>Фотографії</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload
              existingImages={existingImages}
              pendingImages={pendingImages}
              onExistingChange={setExistingImages}
              onPendingChange={setPendingImages}
              onRemoveExisting={(id: number) => setRemovedImageIds((prev: number[]) => [...prev, id])}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
          <Button variant="outline" className="w-full md:w-auto min-h-11" asChild>
            <Link href="/admin/projects">Скасувати</Link>
          </Button>
          <form.AppForm>
            <form.SubmitButton className="w-full md:w-auto min-h-11">
              {submitting ? 'Збереження...' : 'Зберегти зміни'}
            </form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </div>
  );
}
