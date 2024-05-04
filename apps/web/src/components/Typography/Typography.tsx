import { TypographyProps } from '@mui/material';
import MuiTypography from '@mui/material/Typography';

// TODO: Add automatic translation of the text
export default function Typography({ children, ...props }: TypographyProps) {
  return (
    <MuiTypography {...props}>{children}</MuiTypography>
  );
}
