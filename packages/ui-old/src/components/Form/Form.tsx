import { Box } from '@mui/material';
import { handleSubmit } from '../../utils';
import { useFormContext } from './Form.context';
import zod from 'zod';

// TODO: use this when costumizing global error messages
// const customErrorMap: zod.ZodErrorMap = (error, ctx) => {
//   switch (error.code) {
//   case zod.ZodIssueCode.invalid_type:
//     if (error.expected === 'string') {
//       return { message: 'This ain\'t a string!' };
//     }
//     break;
//   case zod.ZodIssueCode.custom:
//     // produce a custom message using error.params
//     // error.params won't be set unless you passed
//     // a `params` arguments into a custom validator
//     const params = error.params || {};
//     if (params.myField) {
//       return { message: `Bad input: ${params.myField}` };
//     }
//     break;
//   }

//   // fall back to default message!
//   return { message: ctx.defaultError };
// };

// zod.setErrorMap(customErrorMap);

type ErrorsType<T extends Record<string, any>> = Partial<Record<keyof T, string>> & { errorMessage?: string };

type SubmitHandlerReturnType<T extends Record<string, any>> = void | null | false | undefined | ErrorsType<T>;

export type FormProps<T extends Record<string, any>> = {
  children: React.ReactNode | (({ errors, pending }: { errors: ErrorsType<T>, pending: boolean }) => React.ReactNode);
  onSubmit: (data: T) => Promise<SubmitHandlerReturnType<T>> | SubmitHandlerReturnType<T>;
  getValidationSchema?: (root: typeof zod) => zod.ZodRawShape;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
}

export default function Form<FormData extends Record<string, any>>({
  children,
  onSubmit,
  getValidationSchema,
  encType,
}: FormProps<FormData>) {
  const { errors, setErrors, pending, setPending } = useFormContext();

  return (
    <Box
      component="form"
      method="post"
      encType={encType}
      onSubmit={handleSubmit(async (data: FormData) => {

        if (getValidationSchema) {
          const schema = zod.object(getValidationSchema?.(zod) || {});
          const err = schema.safeParse(data);

          const indexedErrors: Record<string, any> = {};

          if (!err.success) {
            for (const error of err.error.errors) {
              const pathKey = error.path.join('.');
              indexedErrors[pathKey] = error.message;
            }

            setErrors(indexedErrors);

            return;
          }

          setErrors(indexedErrors);
        }

        setPending(true);
        const errors = await onSubmit?.(data);
        setErrors((errors || {}) as Record<string, string>);
        setPending(false);
      })}
    >
      {typeof children === 'function' ? children({ errors: errors as ErrorsType<FormData>, pending }) : children}
    </Box>
  );
}
