import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useFieldContext } from '@/hooks/forms/form-context';
import { ComponentProps, FC, useId } from 'react';

type FormInputProps = {
  label?: string;
  placeholder?: string;
  id?: string;
  description?: string;
} & Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'onBlur'>;

const FormInput: FC<FormInputProps> = ({
  label,
  placeholder,
  description,
  id: providedId,
  ...props
}) => {
  const field = useFieldContext<string>();
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <Input
        {...props}
        id={id}
        placeholder={placeholder ?? label}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {!field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default FormInput;
