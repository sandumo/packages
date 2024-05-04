import { Container, Typography, Button, ImageSlider } from 'ui';

// import api from '@/lib/api-client';
import { Box, Grid } from '@mui/material';

// import { Product } from '@prisma/client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { ProductColor, productColorMapping } from '@utils/mappings';
import api, { Product } from 'api-client';
import { DefaultLayout } from '@layouts';
import { IconButton } from '@components';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useBasketContext } from '@context/BasketContext';

function Page({ id }: any) {
  const [product, setProduct] = useState<Product>();
  const [qty, setQty] = useState(1);
  const [addedToBasket, setAddedToBasket] = useState(false);

  const { addItemToBasket, getItemFromBasket, updateItemInBasket } = useBasketContext();
  const [imageSliderOpen, setImageSliderOpen] = useState(false);

  useEffect(() => {
    setQty(getItemFromBasket(id)?.qty || 1);
    setAddedToBasket(getItemFromBasket(id) !== null);
  }, [id, getItemFromBasket]);

  useEffect(() => {
    api.product.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <>Loading...</>;

  return (
    <Container sx={{ py: { xs: 4, sm: 8 } }}>
      <Grid container spacing={6}>
        {/* Images */}
        <Grid item xs={12} sm={7}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#00000050',
                },
              },
            }}
            onClick={() => setImageSliderOpen(true)}
          >
            <Image src={'/api/storage/' + product.pictures[0]?.path} fill style={{ objectFit: 'cover' }} alt="" />
          </Box>
          <Box sx={{ display: 'flex', mt: 2, '& > *:not(:last-child)': { mr: 2 } }}>
            {product.pictures.map((picture) => (
              <Box
                key={picture.path}
                sx={{
                  position: 'relative',
                  width: '100px',
                  aspectRatio: '1 / 1',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#00000050',
                    },
                  },
                }}
                onClick={() => setImageSliderOpen(true)}
              >
                <Image src={'/api/storage/' + picture.path} fill style={{ objectFit: 'cover' }} alt="" />
              </Box>
            ))}
          </Box>

          <ImageSlider
            open={imageSliderOpen}
            onClose={() => setImageSliderOpen(false)}
            images={product.pictures.map(picture => picture.path)}
          />
        </Grid>

        {/* Right block: title, price, add to basket */}
        <Grid item xs={12} sm={5}>
          <Typography variant="h1" sx={{ fontWeight: 700, fontSize: 24 }}>{product.title}</Typography>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: 14, mt: 2 }}>was £{product.oldPricePerSquareMeter} /m<sup>2</sup></Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography sx={{ mr: 1, color: 'error.main'  }}>now</Typography>
              <Typography sx={{ color: 'error.main', fontWeight: 700, fontSize: 28 }}>£{product.pricePerSquareMeter}</Typography>
              <Typography sx={{ ml: 1, color: 'error.main' }}>/m<sup>2</sup></Typography>
            </Box>
            <Typography sx={{ fontSize: 12 }}>(£{product.pricePerPack} per pack)</Typography>
          </Box>

          <Box sx={{ height: 24 }} />

          <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
            <Box sx={{
              bgcolor: '#00000008',
              borderRadius: 1,
              border: 1,
              borderColor: '#00000010',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 40,
              px: 3,
            }}>
              <Typography sx={{ color: 'text.secondary' }}>Type</Typography>
              <Typography>{product.category}</Typography>
            </Box>

            <Box sx={{
              bgcolor: '#00000008',
              borderRadius: 1,
              border: 1,
              borderColor: '#00000010',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 40,
              px: 3,
            }}>
              <Typography sx={{ color: 'text.secondary' }}>Color</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 2 }}>
                  <Box sx={{ width: 20, aspectRatio: '1 / 1', borderRadius: '50%', bgcolor: productColorMapping[product.color as ProductColor] }} />
                </Box>
                <Typography>{product.color}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 2 }}>Quantity:</Box>
              <IconButton onClick={() => addedToBasket ? updateItemInBasket(product, qty - 1 < 1 ? 1 : qty - 1) : setQty(value => value - 1 < 1 ? 1 : value - 1)} disabled={qty === 1}>
                <RemoveRoundedIcon />
              </IconButton>
              <Typography sx={{ mx: 2 }}>{qty}</Typography>
              <IconButton onClick={() => addedToBasket ? updateItemInBasket(product, qty + 1) : setQty(value => value + 1)}>
                <AddRoundedIcon />
              </IconButton>
              <Box sx={{ ml: 'auto', fontWeight: 700, color: 'primary.main' }}>
                = {(product.pricePerPack * qty / product.pricePerSquareMeter).toFixed(2)} m<sup>2</sup> = £{(product.pricePerPack * qty).toFixed(2)}
              </Box>
            </Box>
            <Button fullWidth variant={addedToBasket ? 'outlined' : 'contained'} sx={{ mb: 2 }} size="large" onClick={() => addItemToBasket(product, qty)} color={addedToBasket ? 'success' : 'primary'} disabled={addedToBasket}>Added to basket</Button>
            <Button fullWidth>Order sample</Button>
          </Box>
        </Grid>
      </Grid>

      <Grid container sx={{ mt: 8 }} spacing={6}>
        <Grid item xs={12} sm={7}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 24 }} gutterBottom>Description</Typography>
            <Typography>{product.description}</Typography>
          </Box>

          {/* Highlights */}
          <Box sx={{ mt: 6 }}>
            {product.highlights.map((highlight: string, index: number) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', height: 32 }}>
                <CheckCircleRoundedIcon color="success" sx={{ mr: 1.5 }} />
                <Typography>{highlight}</Typography>
              </Box>
            ))}
          </Box>

          {/* Suitability */}
          <Box sx={{ mt: 6 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 24 }} gutterBottom>Suitability</Typography>
            <Box>
              {product.suitability.map((suitability: string, index: number) => (
                <Box key={index}>
                  <Typography>{suitability}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={5}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 24 }} gutterBottom>Specifications</Typography>
            <Box sx={{ border: 1, borderColor: '#00000010', borderRadius: 1, overflow: 'hidden', bgcolor: '#00000008' }}>
              <Box
                component="table"
                border="collapse"
                sx={{
                  width: '100%',
                  fontSize: 14,
                  '& > *:not(:last-child)': {
                    borderBottom: 1,
                    borderColor: '#00000010',
                  },
                }}
              >
                {Object.keys(product.specifications || {}).map((key, index) => (
                  <Box
                    component="tr"
                    key={index}
                    sx={{
                      px: 2,
                      fontSize: 14,
                      height: 32,
                    }}
                  >
                    <Box sx={{ px: 2, fontWeight: 600, borderRight: 0, borderColor: 'divider' }} component="td">
                      {key}:
                    </Box>
                    <Box component="td" sx={{ pr: 2, pl: 2 }}>
                      {(product.specifications as Record<string, any>)[key]}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

    </Container>
  );
}

Page.getLayout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>;

export default Page;

export const getServerSideProps = async (ctx: any) => {
  return {
    props: {
      id: Number(ctx.params.id),
    },
  };
};
