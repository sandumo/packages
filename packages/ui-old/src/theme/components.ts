/* eslint-disable import/no-anonymous-default-export */
import { Interpolation, Theme, ThemeOptions } from '@mui/material/styles';
import { ButtonProps } from '@mui/material/Button';
import Color from 'color';

export default function (theme: Theme): ThemeOptions['components'] {
  return {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        variant: 'tonal',
      },

      variants: [
        // 'tonal' button variant
        ...Object.keys(theme.palette).map((color) => ({
          props: { variant: 'tonal', color },
          style: {
            backgroundColor: (theme.palette as any)[color].light,
            color: (theme.palette as any)[color].main,
            ...theme.unstable_sx({
              '&:hover': {
                bgcolor: Color((theme.palette as any)[color].light).darken(.025).hex(),
              },
            }),
          },
        })) as { props: Partial<ButtonProps>; style: Interpolation<{ theme: Theme }> }[],
      ],

      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 5,
          lineHeight: 1.71,
          letterSpacing: '0.3px',
          padding: `${theme.spacing(1.875, 3)}`,
          '& .MuiButton-root:hover': {
            boxShadow: 'none!important',
          },
        },

        contained: ({ ownerState }) => ({
          boxShadow: 'none!important',
          padding: `${theme.spacing(1.875, 5.5)}`,
          backgroundColor: (theme.palette as any)[ownerState.color || 'primary'].main,
          '&:hover': {
            backgroundColor: Color((theme.palette as any)[ownerState.color || 'primary'].main).darken(.2).hex(),
          },
        }),
        outlined: {
          padding: `${theme.spacing(1.625, 5.25)}`,
        },
        sizeSmall: {
          padding: `${theme.spacing(1, 2.25)}`,
          '&.MuiButton-contained': {
            padding: `${theme.spacing(1, 3.5)}`,
          },
          '&.MuiButton-outlined': {
            padding: `${theme.spacing(0.75, 3.25)}`,
          },
        },
        sizeMedium: {
          fontSize: '1rem', // 7.5 22
        },
        sizeLarge: {
          fontSize: 20,
          padding: `${theme.spacing(2.125, 5.5)}`,
          '&.MuiButton-contained': {
            padding: `${theme.spacing(2.125, 6.5)}`,
          },
          '&.MuiButton-outlined': {
            padding: `${theme.spacing(1.875, 6.25)}`,
          },
        },
      },
    },

    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#00000006!important',
          borderWidth: '1px',
          borderColor: '#00000010!important',
          border: '1px solid #00000010!important',
          '&:hover': {
            backgroundColor: '#E8E8E8',
          },
          '& fieldset': {
            borderColor: '#00000010!important',
            borderWidth: '1px!important',
          },
          '&:hover > fieldset': {
            borderColor: '#f1f1f1!important',
          },
          '& .MuiInputBase-input.Mui-disabled::-webkit-input-placeholder': {
            '-webkit-text-fill-color': 'red!important',
          },

          '& .MuiInputBase-multiline': {
            // height: 'auto!important',
          },

          '& .MuiInputBase-inputMultiline': {
            // backgroundColor: 'red!important',
          },
        },
        input: {
          paddingTop: '8.5px!important',
          paddingBottom: '8.5px!important',
          minHeight: '22px!important',
        },
        multiline: {
          // height: 'auto!important',
          maxHeight: '500px',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
      },
    },

    MuiTextField: {
      styleOverrides: {
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: theme.unstable_sx({
          // paddingTop: '13px!important',
          // paddingBottom: '13px!important',
          // lineHeight: '22px',

          minHeight: '22px', // TODO: figure out how to handle different sizes
          '& .notranslate::after': {
            color: '#00000040',
          },
        }),
      },
    },

    MuiFormControl: {
      styleOverrides: {
        root: {
          height: 'auto!important',
          '& .MuiInputBase-root': {
            // height: '40px!important', // TODO: figure out how to handle different sizes
            maxHeight: '40px',
          },
          '& .MuiInputBase-multiline': {
            maxHeight: '500px',
            padding: '12px',

            '& .MuiInputBase-inputMultiline': {
              padding: '0px!important',
            },
          },
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            paddingTop: '0px!important',
            paddingBottom: '0px!important',
          },
        },
      },
    },
  };
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    tonal: true;
  }
}
