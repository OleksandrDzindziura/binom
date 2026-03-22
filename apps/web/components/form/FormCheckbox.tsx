import { FC, useId } from 'react';
import { useFieldContext } from '@/hooks/forms/form-context';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';

type FormCheckboxProps = {
  label: string;
  id?: string;
};

const FormCheckbox: FC<FormCheckboxProps> = ({ label, id: providedId }) => {
  const field = useFieldContext<boolean>();
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const isInvalid = !field.state.meta.isValid;

  return (
    <Field orientation="horizontal">
      <Checkbox
        id={id}
        aria-invalid={isInvalid}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        onBlur={field.handleBlur}
      />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default FormCheckbox;
