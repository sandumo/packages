import { SxProps } from '@mui/material';
import { Box } from 'ui';

type CurrencyProps = {
  children: number
  currency?: 'GBP' | 'USD' | 'EUR'
  sx?: SxProps
}

export default function Currency({ children, currency = 'GBP', sx }: CurrencyProps) {
  if (typeof children !== 'number') {
    return null;
  }

  return (
    <Box sx={sx} component="span">
      {currency === 'GBP' && '£'}
      {currency === 'USD' && '$'}
      {currency === 'EUR' && '€'}
      {children.toFixed(2)}
    </Box>
  );
}
