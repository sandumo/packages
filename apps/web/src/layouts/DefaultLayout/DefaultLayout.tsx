import Logo from '@components/Logo';
import { Container, Box } from 'ui';
import Footer from '@components/Footer';
import { Basket } from '@components';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container sx={{ height: 64, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 10 }}>
            <Logo />
          </Box>
          <Box sx={{
            display: {
              xs: 'none',
              md: 'flex',
            },
          }}>
            {['Laminate', 'LVT', 'Engineered Wood', 'Parquet'].map((category, index) => (
              <Box key={index} sx={{ mr: 6 }}>
                {category}
              </Box>
            ))}
          </Box>
          <Box sx={{ ml: 'auto' }}>
            {/* <Button startIcon={<ShoppingCartRoundedIcon />}>Basket</Button> */}
            <Basket />
          </Box>
        </Container>
      </Box>
      <Box sx={{ minHeight: '100dvh' }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
