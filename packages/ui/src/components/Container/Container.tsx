import { Container as MuiContainer, SxProps } from '@mui/material';

type ContainerProps = {
  children: React.ReactNode;
  sx?: SxProps;
}

export default function Container({ children, sx }: ContainerProps) {
  return (
    <MuiContainer sx={{
      px: {
        xs: '1rem!important',
        sm: '2rem!important',
      },
      ...sx,
    }}>
      {children}
    </MuiContainer>
  );
}
