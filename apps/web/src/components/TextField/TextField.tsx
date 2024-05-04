import { Box, IconButton, InputAdornment, InputBase } from '@mui/material';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useEffect, useRef, useState } from 'react';
import Typography from '@components/Typography/Typography';

type TextFieldProps = {
  clearable?: boolean;
} & MuiTextFieldProps;

export default function TextField({
  clearable = false,
  value: _value,

  defaultValue,
  onChange,
  sx = {},

  // incompatible props
  margin,
  onKeyDown,
  onKeyUp,
  onInvalid,

  disabled,

  ...props
}: TextFieldProps) {
  const ref = useRef(null);
  const [value, setValue] = useState<any>(_value || defaultValue || '');

  useEffect(() => {
    if (_value !== null && _value != value) {
      setValue(_value);
    }
  }, [_value]);

  return (
    <Box sx={sx}>
      {props.label && (
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: '4px', color: disabled ? 'text.disabled' : 'text.primary' }}>{props.label}</Typography>
      )}
      <MuiTextField
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={e => { setValue(e.target.value); onChange?.(e); }}
        {...props}
        label=""
        variant="filled"
        disabled={disabled}

        sx={{
          width: '100%',
          height: 48,
          '& > .MuiInputBase-root': {
            paddingTop: '0px!important',

            bgcolor: '#f6f6f6',
            border: '1px solid #f1f1f1',
          },
          '& > .MuiFilledInput-root': {
            height: '100%',
            borderRadius: 1,
            '&:before': {
              borderBottom: 'none!important',
            },
            '&:after': {
              borderBottom: 'none!important',
            },
            '& > .MuiInputBase-input': {
              paddingTop: '0px!important',
              paddingBottom: '0px!important',
              height: '100%',
            },
          },
          '& > .MuiFormLabel-root': {
            display: 'none',
          },
          '& .MuiInputBase-root.Mui-disabled': {
            backgroundColor: '#f6f6f6',
          },
          '& .MuiInputBase-input.Mui-disabled::-webkit-input-placeholder': {
            '-webkit-text-fill-color': '#00000040!important',
          },
        }}

        InputProps={{
          ...props.InputProps,
          endAdornment: clearable ? (
            <>
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setValue('');
                    onChange?.({ target: { value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className="MuiTextFieldClearButton"
                  sx={{
                    visibility: 'hidden',

                    // TODO: apply this animation in future
                    // transition: 'all .15s ease-in-out',
                    // opacity: props.value ? 1 : 0,
                    // transform: 'scale(.75)',
                  }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
              {props.InputProps?.endAdornment}
            </>
          ) : props.InputProps?.endAdornment,
        }}
      />
    </Box>
  );

  return (
    <Box>
      {props.label && (
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: '4px' }}>{props.label}</Typography>
      )}
      <Box sx={{
        bgcolor: '#F4F5F7',
        border: '1px solid #F4F5F7',
        height: 48,
        borderRadius: 1,
        ...sx,
      }}>
        <InputBase
          sx={{ height: '100%', px: 4, width: '100%' }}

          // placeholder={props.placeholder}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={e => { setValue(e.target.value); onChange?.(e); }}
          {...props}
        />
      </Box>
    </Box>
  );

  return (
    <MuiTextField
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onChange={e => { setValue(e.target.value); onChange?.(e); }}
      {...props}
      sx={{
        // ...props.sx,
        '&:hover .MuiInputAdornment-root > .MuiTextFieldClearButton': {
          visibility: 'visible',

          // TODO: apply this animation in future
          // opacity: 1,
          // transform: 'scale(1)',
        },
      }}
      InputProps={{
        ...props.InputProps,
        endAdornment: clearable ? (
          <>
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setValue('');
                  onChange?.({ target: { value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                className="MuiTextFieldClearButton"
                sx={{
                  visibility: 'hidden',

                  // TODO: apply this animation in future
                  // transition: 'all .15s ease-in-out',
                  // opacity: props.value ? 1 : 0,
                  // transform: 'scale(.75)',
                }}
              >
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
            {props.InputProps?.endAdornment}
          </>
        ) : props.InputProps?.endAdornment,
      }}
    />
  );
}
