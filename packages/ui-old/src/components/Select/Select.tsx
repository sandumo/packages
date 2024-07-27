import { useFormContext } from '../Form/Form.context';
import Typography from '../Typography';
import { Select as MuiSelect, MenuItem, SelectProps as MuiSelectProps, FormControl, FormHelperText } from '@mui/material';
import { useState } from 'react';

type SelectProps<T> = Omit<MuiSelectProps, 'value' | 'defaultValue' | 'onChange'> & {
  options: T[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string;
};

export default function Select<T>({
  name,
  label,
  options,
  value,
  defaultValue,
  getOptionLabel = option => option as any,
  getOptionValue = getOptionLabel,
  onChange,
  fullWidth = true,
  placeholder,
  sx,
  ...props
}: SelectProps<T>) {
  const [internalValue, setInternalValue] = useState<T | null>(value || defaultValue || null);

  const { errors } = useFormContext();

  const optionsHashMap = options.reduce((acc, option, index) => {
    acc[getOptionValue(option)] = option;

    return acc;
  }, {} as Record<string, T>);

  const getOptionByHash = (hash: string): T => optionsHashMap[hash];

  return (
    <FormControl fullWidth={fullWidth} sx={sx} error={props.error || !!(name && errors[name])}>
      <input type="hidden" name={name + ':' + 'json'} value={JSON.stringify(internalValue)} />
      {label && <Typography sx={{ fontSize: 12, fontWeight: 700, mb: .5, color: props.disabled ? 'text.disabled' : 'text.primary' }}>{label}</Typography>}
      <MuiSelect
        {...props}
        value={value ? getOptionValue(value) : ''}
        onChange={e => {
          const value = getOptionByHash(e.target.value as string);
          onChange?.(value);
          setInternalValue(value as NonNullable<T>);
        }}
        renderValue={selected => getOptionLabel(getOptionByHash(selected as string))}
        sx={{
          ...(placeholder && {
            '& .MuiSelect-select .notranslate::after': {
              content: `"${placeholder}"`,
            },
          }),
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </MuiSelect>
      {name && errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
    </FormControl>
  );
}
