import { default as CustomForm } from './Form';
import { FormProps } from './Form';
import { FormProvider } from './Form.context';

export { useFormContext } from './Form.context';

export default function Form<T extends Record<string, any>>(props: FormProps<T>) {
  return (
    <FormProvider>
      <CustomForm {...props} />
    </FormProvider>
  );
}
