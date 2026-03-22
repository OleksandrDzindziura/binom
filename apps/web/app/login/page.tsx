'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { signIn, signUp } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useAppForm } from '@/hooks/forms/form';
import { loginSchema, registerSchema } from '@repo/schemas';

export default function LoginPage() {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const schema = isRegister
          ? registerSchema
          : loginSchema;
        const result = schema.safeParse(value);
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(', ');
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        if (isRegister) {
          const result = await signUp.email({ name: value.name, email: value.email, password: value.password });
          if (result.error) {
            setError(result.error.message ?? t('errorRegister'));
            return;
          }
        } else {
          const result = await signIn.email({ email: value.email, password: value.password });
          if (result.error) {
            setError(result.error.message ?? t('errorLogin'));
            return;
          }
        }
        router.push('/admin');
        router.refresh();
      } catch {
        setError(t('errorGeneric'));
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isRegister
              ? t('titleRegister')
              : t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
              className="space-y-4"
            >
              {isRegister && (
                <form.AppField name="name">
                  {(field) => (
                    <field.Input
                      label={t('name')}
                      placeholder={t('namePlaceholder')}
                    />
                  )}
                </form.AppField>
              )}
              <form.AppField name="email">
                {(field) => (
                  <field.Input
                    label={t('email')}
                    type="email"
                    placeholder={t('emailPlaceholder')}
                  />
                )}
              </form.AppField>
              <form.AppField name="password">
                {(field) => (
                  <field.Input
                    label={t('password')}
                    type="password"
                    placeholder="Пароль"
                  />
                )}
              </form.AppField>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <form.SubmitButton className="w-full">
                {isRegister
                  ? t('submitRegister')
                  : t('submit')}
              </form.SubmitButton>
            </form>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  );
}
