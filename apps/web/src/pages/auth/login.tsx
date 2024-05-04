// ** React Imports
import { ReactNode } from 'react';

// ** Layouts
import LoginLayout from '@layouts/LoginLayout';

// ** Components
import Typography from '@components/Typography';
import { Button, TextField } from '@components';

// ** MUI Components
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// ** Hooks
import { useAuth } from 'src/hooks/useAuth';

// ** Google Auth

// ** Utils
import { handleSubmit } from '@utils';

interface FormData {
  email: string
  password: string
}

const Page = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;

    auth.login({ email, password }, () => {
      alert('Error');
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      {/* <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
        <Link href="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <BrandLogo size="small" white />
        </Link>
      </Box> */}
      <Typography fontSize={24} fontWeight={700} align="center" sx={{ mb: 8 }}>Conectare</Typography>

      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box>
          <TextField
            name="email"
            label="Adresa de email"
            placeholder="ion@example.com"
            sx={{ mb: 2 }}
          />

          <TextField
            name="password"
            label="Parola"
            placeholder="******"
            type="password"
          />
        </Box>

        <Button variant="contained" sx={{ height: 48, mt: 8 }} fullWidth type="submit">Continuă</Button>

        {/* <Divider sx={{ my: theme => `${theme.spacing(1)} !important` }}>sau</Divider> */}

        {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GoogleOAuthProvider clientId={Environment.GOOGLE_CLIENT_ID}>
              <GoogleLogin onSuccess={idToken => auth.googleAuth({ isOrganization, idToken })} onError={() => console.log('[x] google auth error')} width={(hidden ? 400 : 364) as unknown as string} size="large" />
            </GoogleOAuthProvider>
          </Box> */}
      </Box>
    </Box>
  );
};

Page.getLayout = (page: ReactNode) => <LoginLayout>{page}</LoginLayout>;

export default Page;
