import { Currency, IconButton } from '@components';
import { useBasketContext } from '@context/BasketContext';
import { DefaultLayout } from '@layouts';
import { Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from 'api-client';
import { Box, Container, Typography } from 'ui';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Image from 'next/image';

const Page = () => {
  const { getBasketItems } = useBasketContext();

  return (
    <Container sx={{ my: 6 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 4 }}>Checkout</Typography>

      <Box sx={{
        '& > *:not(:last-child)': {
          borderBottom: '1px solid #00000010',
        },
        '& > *': {
          padding: '1rem 0',
        },
      }}>
        {getBasketItems().map((item, index) => (
          <BasketItem key={index} id={item.id} qty={item.qty} />
        ))}
      </Box>
    </Container>
  );
};

Page.getLayout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>;

export default Page;

function BasketItem({ id, qty }: { id: number; qty: number }) {
  const { data: product } = useQuery(api.product.getProductQuery(id));

  const { removeItemFromBasket } = useBasketContext();

  if (!product) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center'  }}>
      {/* <Box sx={{ mr: 2 }}> */}
      <Image src={'/api/storage/' + product.pictures[0]?.path} width={80} height={80} alt="" style={{ marginRight: '.5rem' }} />
      {/* </Box> */}
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{product.title}</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Currency>{product.pricePerPack}</Currency> x {qty} = <Currency>{product.pricePerPack * qty}</Currency>
        </Box>
      </Box>
      <Box sx={{ pl: 4 }}>x{qty}</Box>
      <Tooltip title="Remove" sx={{ ml: 'auto' }}>
        <IconButton onClick={() => removeItemFromBasket(product)} title="Remove">
          <ClearRoundedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
