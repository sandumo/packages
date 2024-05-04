// ** React Imports
import { useState, ReactNode } from 'react';

// ** Layouts
import LoginLayout from '@layouts/LoginLayout';

// ** Components
import Link from '@components/Link';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import TextField from '@components/TextField';
import Typography from '@components/Typography';
import BrandLogo from '@components/BrandLogo';

// ** MUI Components
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// ** Hooks
import { useAuth } from 'src/hooks/useAuth';

// ** Google Auth
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// ** Utils
import { handleSubmit } from '@utils';
import { Environment } from '@configs/env';

interface FormData {
  field1: string;
  field2: string;
  field3: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const Page = () => {
  const [isOrganization, setIsOrganization] = useState<boolean>(false);

  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down('md'));

  const onSubmit = async (data: FormData) => {
    const { field1, field2, field3, email, phoneNumber, password } = data;

    const payload = {
      isOrganization,
      email,
      phoneNumber,
      password,
      ...(isOrganization ? { organizationName: field1, organizationIDNO: field2, fullname: field3 } : { firstname: field1, lastname: field2, idnp: field3 }),
    };

    auth.register(payload, () => {
      alert('Error');
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 16 }}>
        <BrandLogo size="small" />
      </Box>

      <Typography variant="h5" fontWeight={600} align="center" sx={{ mb: 6 }}>Înregistrează-te</Typography>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        height: 44,
        mb: 6,
        cursor: 'pointer',
        '& > *:not(:last-child)': {
          width: '50%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        },
      }}>
        <Box onClick={() => setIsOrganization(false)}>Angajat</Box>
        <Box onClick={() => setIsOrganization(true)}>Angajator</Box>
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          transition: 'all .25s ease',
          ...(isOrganization ? { left: '50%' } : { left: 0 }),
          width: '50%',
          borderTop: theme => `2px solid ${theme.palette.primary.main}`,
          borderRadius: 1,
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
        }} />
      </Box>

      <Box
        component='form'
        noValidate
        autoComplete='off'
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <TextField
          name="field1"
          label={isOrganization ? 'Nume companie' : 'Nume'}
          size="small"
          fullWidth
        />

        <TextField
          name="field2"
          label={isOrganization ? 'IDNO' : 'Prenume'}
          size="small"
          fullWidth
        />

        <TextField
          name="field3"
          label={isOrganization ? 'Nume Prenume' : 'IDNP'}
          size="small"
          fullWidth
        />

        <TextField
          name="phoneNumber"
          label="Număr de telefon"
          size="small"
          fullWidth
        />

        <TextField
          name="email"
          label="Email"
          size="small"
          fullWidth
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          size="small"
          fullWidth
        />

        <Checkbox label="Sunt de acord cu Politica de Confidențialitate și Termenii" labelSx={{ fontSize: 14, color: 'text.secondary' }}/>

        <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 2 }}>Înregistrează-te</Button>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant='body2' sx={{ mr: 2 }}>Ai deja un cont?</Typography>
          <Typography variant='body2'>
            <Link href="/login" primary>Conectează-te</Link>
          </Typography>
        </Box>

        <Divider sx={{ my: theme => `${theme.spacing(1)} !important` }}>sau</Divider>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GoogleOAuthProvider clientId={Environment.GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={idToken => auth.googleAuth({ isOrganization, idToken })} onError={() => console.log('[x] google auth error')} width={hidden ? '400px' : '364'} size="large" />
          </GoogleOAuthProvider>
        </Box>
      </Box>
    </Box>
  );
};

Page.getLayout = (page: ReactNode) => <LoginLayout>{page}</LoginLayout>;

export default Page;
