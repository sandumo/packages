import { Box } from '@mui/material';
import Image from 'next/image';
import { Typography, Button, Link } from 'ui';

type ProductCardProps = {
  product: any; // Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      sx={{
        border: 1,
        borderWidth: 2,
        borderColor: 'divider',
        p: '2px',
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',

        // boxShadow: 7,
        // boxShadow: '0px 0px 10px rgb(0 0 0 / 10%)',
      }}
    >
      <Box sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <Image src={'/api/storage/' + product.pictures[0]?.path} fill style={{ objectFit: 'cover' }} alt="" />
      </Box>
      <Box sx={{ p: '6px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontWeight: '700', textAlign: 'center' }}>{product.title}</Typography>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: 14, textAlign: 'center', mt: 2 }}>was £{product.oldPricePerSquareMeter} /m<sup>2</sup></Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
            <Typography sx={{ mr: 1, color: 'error.main', textAlign: 'center' }}>now</Typography>
            <Typography sx={{ color: 'error.main', fontWeight: 700, fontSize: 22, textAlign: 'center' }}>£{product.pricePerSquareMeter}</Typography>
            <Typography sx={{ ml: 1, color: 'error.main', textAlign: 'center' }}>/m<sup>2</sup></Typography>
          </Box>
        </Box>

        <Button fullWidth sx={{ mt: 2 }}>View product</Button>
      </Box>
    </Link>
  );
}
