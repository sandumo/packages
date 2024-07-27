import { useState } from 'react';
import TextField from '../TextField';
import { DatePickerProps as MuiDatePickerProps, DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { SxProps } from '@mui/material';
import datetime, { Datetime } from '@sandumo/datetime';
import { useFormContext } from '../Form/Form.context';

type DatePickerProps<TInputDate, TDate> = Omit<MuiDatePickerProps<TInputDate, TDate>, 'renderInput' | 'onChange' | 'value'> & {
  name?: string;
  value?: NonNullable<TInputDate>;
  sx?: SxProps;
  defaultValue?: NonNullable<TInputDate>;
  error?: boolean;
  helperText?: string;
  onChange?: (value: TInputDate) => void;
};

export default function DatePicker<TInputDate, TDate>({
  name,
  label,
  sx,
  defaultValue: _defaultValue,
  ...props
}: DatePickerProps<TInputDate, TDate>) {
  // TODO: Fix this, improve this
  // const defaultValue = props.value ? new Date(props.value as any) : null;

  const { errors } = useFormContext();

  let defaultValue = props.value ? datetime(props.value as any) : _defaultValue ? datetime(_defaultValue as any) : null;

  const [value, setValue] = useState<Datetime | null>(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value?.toDateFormat()} />
      <MuiDatePicker
        label={label}
        value={value?.toDateFormat()}
        inputFormat="YYYY-MM-DD"
        onChange={(value) => setValue(datetime(value))}
        renderInput={(params) => (
          <TextField
            {...params}
            value={datetime(params.value as string).toDateFormat()}

            error={props.error || !!(name && errors[name])}
            helperText={props.helperText || (name && errors[name])}

            // {...props}
            // name={name}
            sx={sx}
          />
        )}
      />
    </>
  );
}
