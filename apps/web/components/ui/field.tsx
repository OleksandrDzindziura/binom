import { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function FieldSet({ className, ...props }: React.ComponentPropsWithoutRef<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentPropsWithoutRef<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      className={cn('mb-2 font-medium', variant === 'legend' ? 'text-base' : 'text-sm', className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn('flex flex-col gap-6', className)}
      {...props}
    />
  );
}

const fieldVariants = cva('gap-3', {
  variants: {
    orientation: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row items-center',
      responsive: 'flex flex-col',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn('flex flex-1 flex-col gap-1.5', className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn('flex w-fit gap-2', className)}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="field-title"
      className={cn('flex w-fit items-center gap-2', className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-muted-foreground text-sm font-normal leading-normal', className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  errors?: ({ message?: string } | undefined)[];
}) {
  const content = useMemo(() => {
    if (children) {
      if (typeof children === 'string') {
        return <p className={cn('text-destructive text-sm font-normal', className)}>{children}</p>;
      }
      return children;
    }

    if (!errors || errors.length === 0) return null;

    if (errors.length === 1 && errors[0]?.message) {
      return (
        <p className={cn('text-destructive text-sm font-normal', className)}>
          {errors[0].message}
        </p>
      );
    }

    return (
      <div className="gap-1">
        {errors.map(
          (error, index) =>
            error?.message && (
              <p key={index} className={cn('text-destructive text-sm font-normal', className)}>
                • {error.message}
              </p>
            )
        )}
      </div>
    );
  }, [children, errors, className]);

  if (!content) return null;

  return (
    <div role="alert" data-slot="field-error" {...props}>
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldContent,
  FieldTitle,
};
