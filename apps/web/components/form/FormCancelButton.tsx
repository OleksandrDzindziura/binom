import { useFormContext } from '@/hooks/forms/form-context';
import { Button } from '@/components/ui/button';
import { FC, ReactNode } from 'react';

type FormCancelButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
};

const FormCancelButton: FC<FormCancelButtonProps> = ({ children, onClick, className }) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="button" variant="outline" disabled={isSubmitting} className={className} onClick={onClick}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
};

export default FormCancelButton;
