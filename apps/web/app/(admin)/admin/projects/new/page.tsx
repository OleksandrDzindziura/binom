'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { useAppForm } from '@/hooks/forms/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUpload, { type PendingImage } from '@/components/form/ImageUpload';
import ProjectFormFields from '../_components/ProjectFormFields';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const getUploadUrl = useMutation(orpc.upload.getUploadUrl.mutationOptions());
  const addProjectImage = useMutation(orpc.catalog.images.add.mutationOptions());
  const createProject = useMutation(orpc.catalog.projects.create.mutationOptions());

  const [formError, setFormError] = useState('');

  const mapCategoryForCreate = (
    category: string | undefined,
  ): 'кухня' | 'шафа' | 'ванна' | 'офіс' | 'інше' => {
    // UI select uses categoryLabels keys: kitchen/wardrobe/bathroom/office/other,
    // but API expects enum values: kitchen/шафа/ванна/офіс/інше.
    switch (category) {
      case 'kitchen':
        return 'кухня';
      case 'wardrobe':
        return 'шафа';
      case 'bathroom':
        return 'ванна';
      case 'office':
        return 'офіс';
      case 'other':
        return 'інше';
      default:
        return 'кухня';
    }
  };

  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'kitchen' as string,
      isPublished: false,
      isFeatured: false,
    },
    onSubmit: async ({ value }) => {
      setFormError('');
      if (!value.title.trim()) {
        setFormError('Вкажіть назву проекту');
        return;
      }

      setSubmitting(true);
      try {
        const project = await createProject.mutateAsync({
          title: value.title,
          description: value.description || undefined,
          category: mapCategoryForCreate(value.category),
          isPublished: value.isPublished,
          isFeatured: value.isFeatured,
        });

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
            filename: img.file.name,
            category: 'project_photo',
            contentType: img.file.type,
          });

          await fetch(uploadUrl, {
            method: 'PUT',
            body: img.file,
            headers: { 'Content-Type': img.file.type },
          });

          await addProjectImage.mutateAsync({
            projectId: project.id,
            url: publicUrl,
            order: i,
            isMain: img.isMain,
          });
        }

        await queryClient.invalidateQueries();
        toast.success('Проект успішно додано');
        router.push('/admin/projects');
      } catch (err) {
        console.error('Failed to create project:', err);
        toast.error('Не вдалося додати проект');
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
        <h1 className="text-3xl font-bold">Додати проект</h1>
      </div>

      {(createProject.isError || formError) && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
          {formError || createProject.error?.message || 'Не вдалося створити проект'}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        <ProjectFormFields form={form} />

        <Card>
          <CardHeader>
            <CardTitle>Фотографії</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              pendingImages={images}
              onPendingChange={setImages}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
          <Button variant="outline" className="w-full md:w-auto min-h-11" asChild>
            <Link href="/admin/projects">Скасувати</Link>
          </Button>
          <form.AppForm>
            <form.SubmitButton className="w-full md:w-auto min-h-11">
              {submitting ? 'Створення...' : 'Створити проект'}
            </form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </div>
  );
}
