import { useEffect, useState } from 'react';
import { Typography, Container, Button, Box, Grid } from 'ui';
import ProductCard from '@components/ProductCard';
import DefaultLayout from '@layouts/DefaultLayout';
import api from 'api-client';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.product.getProducts({}).then((data) => {
      console.log('[x] products', data);
      setProducts(data);
    });
  }, []);

  return (
    <DefaultLayout>
      <Box sx={{
        height: '65vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#00000008',
        mb: 8,
        backgroundImage: 'url(/laminate-1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'bottom',
        color: 'white',
        position: 'relative',
      }}>

        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 100%)',
        }} />
        <Container sx={{ position: 'absolute', bottom: 32, display: 'block' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '3rem', mb: 2 }}>
              Explore Top Flooring Choices
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.75rem', fontWeight: '700', opacity: .55 }}>
              Laminate, Engineered Wood, LVT, and Parquet Selections
            </Typography>
          </Box>
          {/* <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}> */}
          <Button variant="contained" href="/explore">Shop now</Button>
          {/* </Box> */}
        </Container>
      </Box>
      <Container sx={{ mb: 12 }}>
        <Grid container spacing={8}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </DefaultLayout>
  );
}
