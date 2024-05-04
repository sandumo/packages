import Typography from '@components/Typography/Typography';
import { FormControl, MenuItem, Select as MuiSelect, SxProps } from '@mui/material';

type SelectProps<T> = {
  label?: string;
  placeholder?: string;
  value: T;
  options: T[];
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number;
  onChange?: (value: T) => void;
  sx?: SxProps;
  disabled?: boolean;
}

export default function Select<T>({
  label,
  placeholder,
  value,
  options,
  getOptionLabel = (option: any) => option as unknown as string,
  getOptionValue = getOptionLabel,
  onChange,
  sx,
  disabled,
}: SelectProps<T>) {
  return (
    <FormControl
      sx={{
        minWidth: 120,
        '& .MuiInputBase-input.Mui-disabled': {
          '-webkit-text-fill-color': '#00000020!important',
        },
        ...sx,
      }}
      size="small"
      disabled={disabled}
    >
      {label && <Typography sx={{ fontSize: 12, mb: 1, fontWeight: 700, color: disabled ? 'text.disabled' : 'text.primary' }}>{label}</Typography>}
      <MuiSelect
        placeholder={placeholder}
        value={options.findIndex((option, index) => value && getOptionValue(option) === getOptionValue(value))}
        onChange={event => onChange?.(options[event.target.value as number])}
        sx={{
          bgcolor: '#f6f6f6',
          border: '1px solid #f1f1f1',
          height: 48,
          '& fieldset': {
            display: 'none',
          },
        }}
        disabled={disabled}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={index}>{getOptionLabel(option)}</MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
