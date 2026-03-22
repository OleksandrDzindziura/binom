import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFieldContext } from '@/hooks/forms/form-context';
import { FC, ReactNode } from 'react';

export type FormSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type FormSelectProps = {
  label?: string;
  id?: string;
  description?: string;
  placeholder?: string;
  options: FormSelectOption[];
  disabled?: boolean;
  children?: ReactNode;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
};

const FormSelect: FC<FormSelectProps> = ({
  label,
  id,
  description,
  placeholder,
  options,
  disabled = false,
  children,
  orientation = 'vertical',
}) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field orientation={orientation} data-invalid={isInvalid || undefined}>
      <FieldContent>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
      <Select
        value={field.state.value ?? ''}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger id={id} disabled={disabled} onBlur={field.handleBlur}>
          <SelectValue placeholder={placeholder ?? label ?? 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {children ??
            options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

export default FormSelect;
