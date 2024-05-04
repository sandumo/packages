import { Box, SxProps } from '@mui/material';
import { menuItems } from './LeftMenu';
import { useRouter } from 'next/router';
import { Typography } from '@components';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export type BaseDashboardLayoutProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  sx?: SxProps;
  leftMenu?: React.ReactNode;
  appBar?: React.ReactNode;
  leftSubMenu?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  sx = {},
  title: _title,
  footer,
  leftMenu,
  appBar,
  leftSubMenu,
}: BaseDashboardLayoutProps) {
  const router = useRouter();

  const title = _title || <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{menuItems.find(item => item.href === router.pathname)?.label}</Typography>;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* LeftMenu */}
      {leftMenu}
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* AppBar */}
        {appBar}

        {/* LeftSubMenu */}
        {leftSubMenu ? (
          <Box sx={{ display: 'flex', height: 'calc(100% - 48px)' }}>
            <Box sx={{ borderRight: 1, borderRightColor: 'divider', width: 230, p: 4 }}>
              {leftSubMenu}
            </Box>
            <Box sx={{ height: '100%', flex: 1, overflow: 'scroll', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  flex: 1,
                  p: 4,
                  '& > *:not(:last-child)': {
                    mb: 4,
                  },
                  ...sx,
                }}
                component={OverlayScrollbarsComponent}
                data-overlayscrollbars-initialize
              >
                {children}
              </Box>
              {footer}
            </Box>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                flex: 1,
                p: '1rem!important',
                '& > *:not(:last-child)': {
                  mb: 4,
                },
                ...sx,
              }}
              component={OverlayScrollbarsComponent}
              data-overlayscrollbars-initialize
            >
              {children}
            </Box>
            {footer}
          </>
        )}
      </Box>
    </Box>
  );
}
