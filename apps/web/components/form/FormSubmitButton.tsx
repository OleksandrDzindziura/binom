import { useFormContext } from '@/hooks/forms/form-context';
import { Button } from '@/components/ui/button';
import { FC, ReactNode } from 'react';

type FormSubmitButtonProps = {
  children?: ReactNode;
  className?: string;
};

const FormSubmitButton: FC<FormSubmitButtonProps> = ({ children, className }) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
      {({ canSubmit, isSubmitting }) => (
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={className}
          onClick={() => { void form.handleSubmit(); }}
        >
          {isSubmitting ? 'Vent...' : children}
        </Button>
      )}
    </form.Subscribe>
  );
};

export default FormSubmitButton;
