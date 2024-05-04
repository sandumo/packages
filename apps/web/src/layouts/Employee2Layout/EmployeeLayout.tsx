import { IconButton } from '@components';
import { BaseDashboardLayoutProps } from '@layouts/base/BaseDashboardLayout';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';

type EmployeeLayoutProps = Omit<BaseDashboardLayoutProps, 'appBar' | 'leftMenu'> & { title?: string};

export default function EmployeeLayout({ title, ...props }: EmployeeLayoutProps) {
  const router = useRouter();

  return (

    // <BaseDashboardLayout
    //   appBar={<AppBar title={props.title} />}
    //   leftMenu={<LeftMenu />}
    //   {...props}
    // />
    <Box sx={{
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {router.pathname !== '/employee' && (
        <Box sx={{ width: '100vw', borderBottom: '1px solid #00000020', m: -4, mb: 4, py: 2 }}>
          <Box sx={{ maxWidth: 630, mx: 'auto', display: 'flex', alignItems: 'center' }}>
            <IconButton href="/employee" size="large">
              <ArrowBackIosRoundedIcon />
            </IconButton>

            <Box sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>
              {title}
            </Box>

            <Box sx={{ width: 48 }} />
          </Box>
        </Box>
      )}
      <Box sx={{
        width: '100%',
        maxWidth: 600,
      }}>
        {/* {router.pathname !== '/employee' && (
          <Box sx={{ bgcolor: 'red', mb: 2 }}>
            <IconButton href="/employee" size="large">
              <ArrowBackIosRoundedIcon />
            </IconButton>
          </Box>
        )} */}
        {props.children}
      </Box>
    </Box>
  );
}
