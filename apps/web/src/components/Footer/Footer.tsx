import { Box, Container, Link, Typography } from 'ui';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import FmdGoodRoundedIcon from '@mui/icons-material/FmdGoodRounded';
import Logo from '../Logo';

export default function Footer() {
  return (
    <Box sx={{
      bgcolor: '#00000008',
      pt: 6,
      pb: 4,

      // px: 6,
      borderTop: '1px solid #00000010',
    }}>
      <Container>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { mb: 6 }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ mr: { xs: 0, sm: 16 }, width: { xs: '100%', sm: 'auto' }, minWidth: 150 }}>
            {/* <Image src="/images/logo-big-black.png" width={176} height={66} alt="" /> */}
            <Logo />
          </Box>

          <Box sx={{ mr: { xs: 0, sm: 12, minWidth: 150 } }}>
            <Typography fontWeight={700} gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>Links</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', '& > *': { mb: 2, fontSize: 14, textAlign: { xs: 'center', sm: 'left' } }, '& > *:hover': { color: '#418bf9' } }}>
              <Link href="#">Home</Link>
              <Link href="#about">About</Link>
            </Box>
          </Box>

          <Box>
            <Typography fontWeight={700} gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>Products</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', '& > *': { mb: 2, fontSize: 14, textAlign: { xs: 'center', sm: 'left' } }, '& > *:hover': { color: '#418bf9' } }}>
              <Link href="#laminate">Laminate</Link>
              <Link href="#lvt">LVT</Link>
              <Link href="#engineered-wood">Engineered Wood</Link>
              <Link href="#parquet">Parquet</Link>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', '& *:hover > *': { color: '#418bf9!important' }, '& > *:not(:last-child)': { mb: 2 }, '& > *': { justifyContent: { xs: 'center', sm: 'left' } } }}>
              <Link href="tel:+4078026270" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalPhoneRoundedIcon sx={{ mr: 1.5, color: 'text.secondary' }} fontSize="small" />
                <Box>+40 780 26 270</Box>
              </Link>
              <Link href="mailto:nikk@gmail.com" sx={{ display: 'flex', alignItems: 'center' }}>
                <AlternateEmailRoundedIcon sx={{ mr: 1.5, color: 'text.secondary' }} fontSize="small" />
                <Box>nikk@gmail.com</Box>
              </Link>
              <Link href="https://maps.app.goo.gl/eLvyLMRecykV893r5" sx={{ display: 'flex', alignItems: 'center' }}>
                <FmdGoodRoundedIcon sx={{ mr: 1.5, color: 'text.secondary' }} fontSize="small" />
                <Box>Abingdon, Oxfordshire</Box>
              </Link>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid #00000010', pt: 2, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ color: 'text.secondary', fontSize: 14, textAlign: 'center' }}>
            NICK Flooring LTD &copy; {new Date().getFullYear()} All rights reserved.
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
