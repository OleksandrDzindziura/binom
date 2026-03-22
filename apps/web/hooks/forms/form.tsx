import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './form-context';

import FormInput from '@/components/form/FormInput';
import FormSubmitButton from '@/components/form/FormSubmitButton';
import FormCancelButton from '@/components/form/FormCancelButton';
import FormFieldLayout from '@/components/form/FormFieldLayout';
import FormSwitch from '@/components/form/FormSwitch';
import FormSelect from '@/components/form/FormSelect';
import FormCheckbox from '@/components/form/FormCheckbox';
import FormTextarea from '@/components/form/FormTextarea';
import FormCombobox from '@/components/form/FormCombobox';

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Input: FormInput,
    Select: FormSelect,
    Switch: FormSwitch,
    Checkbox: FormCheckbox,
    Textarea: FormTextarea,
    Combobox: FormCombobox,
  },
  formComponents: {
    SubmitButton: FormSubmitButton,
    CancelButton: FormCancelButton,
    FieldLayout: FormFieldLayout,
  },
});
