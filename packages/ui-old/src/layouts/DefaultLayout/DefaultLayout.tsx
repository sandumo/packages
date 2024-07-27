import { Container } from '@mui/material';

interface Props {
  children?: React.ReactNode,
}

export const DefaultLayout = ({ children }: Props) => {
  return <Container style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>{children}</Container>;
};
