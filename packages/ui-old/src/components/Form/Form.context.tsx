import { ReactNode, createContext, useContext, useState } from 'react';

type FormValuesType = {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  pending: boolean;
  setPending: (pending: boolean) => void;
}

const defaultProvider: FormValuesType = {
  errors: {},
  setErrors: () => null,
  pending: false,
  setPending: () => null,
};

const FormContext = createContext(defaultProvider);

type Props = {
  children: ReactNode
}

const FormProvider = ({ children }: Props) => {
  const [pending, setPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = {
    errors,
    setErrors,
    pending,
    setPending,
  };

  return <FormContext.Provider value={values}>{children}</FormContext.Provider>;
};

export { FormProvider };

export const useFormContext = () => useContext(FormContext);
