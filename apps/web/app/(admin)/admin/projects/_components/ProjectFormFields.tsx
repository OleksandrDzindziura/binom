'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryLabels } from './project-labels';

interface ProjectFormFieldsProps {
  form: any;
}

export default function ProjectFormFields({ form }: ProjectFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Інформація про проект</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form.AppField name="title">
          {(field: any) => (
            <field.Input label="Назва проекту" placeholder="Кухня в стилі модерн" required />
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field: any) => (
            <field.Textarea label="Опис" placeholder="Короткий опис виконаної роботи..." />
          )}
        </form.AppField>

        <form.AppField name="category">
          {(field: any) => (
            <field.Select
              label="Категорія"
              options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
            />
          )}
        </form.AppField>

        <div className="flex gap-6">
          <form.AppField name="isPublished">
            {(field: any) => <field.Checkbox label="Опубліковано" />}
          </form.AppField>
          <form.AppField name="isFeatured">
            {(field: any) => <field.Checkbox label="Рекомендоване" />}
          </form.AppField>
        </div>
      </CardContent>
    </Card>
  );
}
