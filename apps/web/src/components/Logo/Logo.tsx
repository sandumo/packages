import { Box } from '@mui/material';
import Image from 'next/image';
import { Link } from 'ui';

export default function Logo() {
  return (
    <Link href="/">
      <Box
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
        }}
      >
        <Image src="/logo-2.png" fill style={{ objectFit: 'contain' }} alt="" />
      </Box>
    </Link>
  );
}
