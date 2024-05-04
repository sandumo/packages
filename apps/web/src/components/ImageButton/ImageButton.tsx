import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface ImageButtonProps {
  label: string;
  imageSrc: string;
  onClick?: () => void;
}

export default function ImageButton({ label, imageSrc, onClick }: ImageButtonProps) {
  return (
    <Box
      sx={{
        width: 249,
        height: 168,
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 6,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.action.hover,
        },
      }}
      {...(onClick ? { onClick } : {})}
    >
      <Image src={imageSrc} width={80} height={80} alt="" />
      <Typography sx={{ fontWeight: 700, mt: 6 }}>{label}</Typography>
    </Box>
  );
}
