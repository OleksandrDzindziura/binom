import { FC, useId } from 'react';
import { useFieldContext } from '@/hooks/forms/form-context';
import { Switch } from '@/components/ui/switch';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

type FormSwitchProps = {
  label: string;
  id?: string;
};

const FormSwitch: FC<FormSwitchProps> = ({ label, id: providedId }) => {
  const field = useFieldContext<boolean>();
  const uniqueId = useId();
  const id = providedId ?? uniqueId;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Switch
        id={id}
        aria-invalid={isInvalid}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default FormSwitch;
