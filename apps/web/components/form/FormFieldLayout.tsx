import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { FC, ReactNode } from 'react';
import { useFieldContext } from '@/hooks/forms/form-context';

type FormFieldLayoutProps = {
  label?: string;
  id: string;
  description?: string;
  children?: ReactNode;
};

const FormFieldLayout: FC<FormFieldLayoutProps> = ({ label, description, id, children }) => {
  const field = useFieldContext<string>();

  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {!field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default FormFieldLayout;
