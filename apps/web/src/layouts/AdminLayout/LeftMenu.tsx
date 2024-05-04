import { useState } from 'react';
import { Box } from '@mui/material';
import { Link } from '@components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

// Icons
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '@hooks/useAuth';
import Logo from '@components/Logo';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Products',
    href: '/admin',
    icon: <StoreRoundedIcon />,
  },
];

type LeftMenuItemProps = {
  item: MenuItem;
  expanded?: boolean;
  onClick?: () => void;
}

const LeftMenuItem = ({ item, expanded, onClick }: LeftMenuItemProps) => {
  const router = useRouter();

  const selected = item.href && router.pathname === item.href;

  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          height: 40,
          width: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          borderRadius: '4px',
          ':hover': {
            ...(!selected && { bgcolor: 'action.hover' }),
          },
          ...(selected ? {
            bgcolor: theme => `${theme.palette.primary.main}20`,

            // bgcolor: '#2077F8',

            color: '#2077F8',
          } : {}),
          position: 'relative',
          '&:hover > *:last-child': {
            display: 'block',
          },

          // ...(item.children && { border: '1px solid transparent' }),
          // ...(expanded && { bgcolor: '#00000009', border: '1px solid #00000002' }),
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24  }}>
          {item.icon}
        </Box>

        {/* Right vertical bar */}
        {selected && (
          <Box sx={{
            position: 'absolute',
            right: 0,

            width: 3,
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            bgcolor: '#2077F8',
            top: 8,
            bottom: 8,
          }} />
        )}

        <Box sx={{
          position: 'absolute',
          left: 'calc(100% + 16px)',
          zIndex: 9999,

          // bgcolor: '#080808',
          bgcolor: 'primary.main',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: '4px',
          boxShadow: 5,

          display: 'none',
        }}>
          {item.label}
        </Box>
      </Box>
    </Box>
  );
};

export default function LeftMenu() {
  const [expandedItem, setExpandedItem] = useState<MenuItem | null>(null);

  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <Box sx={{
      width: 56,
      borderRight: 1,
      borderRightColor: 'divider',

      // bgcolor: 'blue',
      px: 2,
      pt: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      <Box sx={{ height: 32, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo />
      </Box>

      {/* <Box sx={{ borderBottom: 1, borderBottomColor: '#0000000a', width: '100%', marginTop: '7px' }} /> */}

      <Box sx={{ mt: 6, '& > *:not(:last-child)': { mb: 2 } }}>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href || '#'}>
            <LeftMenuItem item={item} />
          </Link>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{}}>
        <LeftMenuItem item={{
          label: 'Ieșire',
          icon: <LogoutRoundedIcon />,
        }} onClick={() => logout()} />
      </Box>
    </Box>
  );
}
