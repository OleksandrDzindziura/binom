'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useFieldContext } from '@/hooks/forms/form-context';
import { FC, useId, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FormComboboxProps = {
  label?: string;
  placeholder?: string;
  id?: string;
  description?: string;
  options: { label: string; value: string }[];
};

const FormCombobox: FC<FormComboboxProps> = ({
  label,
  placeholder,
  description,
  id: providedId,
  options,
}) => {
  const field = useFieldContext<string>();
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentValue = field.state.value ?? '';

  const handleSelect = (value: string) => {
    field.handleChange(value);
    setOpen(false);
    setSearch('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search) {
      e.preventDefault();
      const num = parseFloat(search);
      if (!isNaN(num)) {
        field.handleChange(search);
        setOpen(false);
        setSearch('');
      }
    }
  };

  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            onBlur={field.handleBlur}
            className={cn(
              'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              !currentValue && 'text-muted-foreground',
            )}
          >
            {currentValue || placeholder || label}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder ?? 'Введіть значення...'}
              value={search}
              onValueChange={setSearch}
              onKeyDown={handleSearchKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                {search && !isNaN(parseFloat(search)) ? (
                  <button
                    type="button"
                    className="w-full px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer"
                    onClick={() => handleSelect(search)}
                  >
                    Використати: {search}
                  </button>
                ) : (
                  'Введіть число'
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentValue === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {!field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default FormCombobox;
