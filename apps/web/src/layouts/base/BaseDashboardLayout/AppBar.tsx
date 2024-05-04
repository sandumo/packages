import { Avatar, Typography } from '@components';
import { Box, IconButton } from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import { useAuth } from '@hooks/useAuth';

type AppBarProps = {
  title?: React.ReactNode;
}

export default function AppBar({ title }: AppBarProps) {
  const { user } = useAuth();

  return (
    <Box sx={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 4,
      backgroundColor: '#fff',
      gap: 4,
      borderBottom: 1,
      borderBottomColor: 'divider',
    }}>
      <Box sx={{ display: 'flex' }}>
        {title}
      </Box>

      <Box sx={{ display: 'flex' }}>
        <Box sx={{ '& > *:not(:last-child)': { mr: 2 } }}>
          <IconButton>
            <NotificationsNoneRoundedIcon />
          </IconButton>
          <IconButton>
            <ControlPointRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{
          bgcolor: '#00000008',
          border: '1px solid #00000008',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '100px',
          ml: 4,
          pr: 4,
        }}>
          <Avatar src={user?.avatarUrl} name={user?.displayName} sx={{ border: '1px solid #00000008' }} />
          <Box sx={{ ml: 2 }}>
            <Typography sx={{ mb: -2.5, fontSize: 16, fontWeight: 600 }}>{user?.displayName}</Typography>
            <Typography variant="caption">JoptaSpace</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
