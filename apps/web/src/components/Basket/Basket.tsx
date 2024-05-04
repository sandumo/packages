import { Box, Button, Typography } from 'ui';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { ClickAwayListener, Popper, Tooltip } from '@mui/material';
import { useState } from 'react';
import Paper from '@components/Paper';
import { useQuery } from '@tanstack/react-query';
import api from 'api-client';
import Image from 'next/image';
import { useBasketContext } from '@context/BasketContext';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { IconButton } from '@components';

export default function Basket() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { getBasketItems } = useBasketContext();

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Box>
        <Button
          startIcon={<ShoppingCartRoundedIcon />}
          onClick={(event) => setAnchorEl(anchorEl ? null : event.currentTarget)}
        >
          Basket
        </Button>

        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placeholder
          sx={{
            bgcolor: 'background.paper',
          }}
          placement="bottom-end"
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
        >
          <Paper sx={{
            minWidth: 200,
            p: 4,
          }}>
            <Typography sx={{ fontWeight: 700, mb: 4 }}>Basket</Typography>

            {getBasketItems().map((item, index) => (
              <BasketItem key={item.id} id={item.id} qty={item.qty} />
            ))}

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" fullWidth sx={{ mt: 4 }} href="/checkout" onClick={() => setAnchorEl(null)}>Checkout</Button>
            </Box>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

function BasketItem({ id, qty }: { id: number, qty: number }) {
  const { data: product } = useQuery(api.product.getProductQuery(id));

  const { removeItemFromBasket } = useBasketContext();

  if (!product) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 2 }}>
        <Image src={'/api/storage/' + product.pictures[0]?.path} width={64} height={64} alt="" />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{product.title}</Typography>
        <Typography sx={{ ml: 'auto' }}>{product.pricePerPack} x {qty} = {product.pricePerPack * qty}</Typography>
      </Box>
      <Box sx={{ pl: 4 }}>x{qty}</Box>
      <Tooltip title="Remove" sx={{ ml: 2 }}>
        <IconButton onClick={() => removeItemFromBasket(product)} title="Remove">
          <ClearRoundedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
