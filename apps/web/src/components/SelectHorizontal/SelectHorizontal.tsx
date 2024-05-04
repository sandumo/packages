import { Box, SxProps, Tab, Tabs } from '@mui/material';
import { JSXElementConstructor, ReactElement } from 'react';

type TabBarProps<T> = {
  value: T;
  onChange: (value: T) => void;
  options: T[];
  getOptionLabel?: (option: T) => string;
  getTabIcon?: (tab: T) => string | ReactElement<any, string | JSXElementConstructor<any>> | undefined;
  toolbar?: React.ReactNode;
  sx?: SxProps;
}

export default function TabBar<T>({
  value,
  onChange,
  options,
  getOptionLabel = (tab: T) => tab as unknown as string,
  getTabIcon = (tab: T) => undefined,
  toolbar,
  sx,
}: TabBarProps<T>) {
  return (
    <Box sx={{
      borderRadius: 1,
      display: 'inline-flex',
      bgcolor: theme => `${theme.palette.primary.main}18`,
      minHeight: 40,
      ...sx,
    }}>
      <Tabs
        value={options.findIndex((option, index) => getOptionLabel(option) === getOptionLabel(value))}
        onChange={(_, index) => onChange?.(options[index])}
        sx={{
          minHeight: 40,
          height: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            height: 40,
            fontWeight: 600,
            color: 'primary.main',
            transition: '0.2s ease-in-out',
            borderRadius: 1,
            '&:hover': {
              bgcolor: theme => `${theme.palette.primary.main}20!important`,
            },
          },
          '& .MuiTabs-indicator': {
            borderRadius: 1,
            bgcolor: 'primary.main',

            // bgcolor: '#00000020', // 'primary.main',
            height: 40,
            zIndex: 0,
          },
          '& .Mui-selected': {
            color: '#fff!important',
            zIndex: 1,
          },
        }}
      >
        {options.map((tab, index) => (
          <Tab key={index} label={getOptionLabel(tab)} icon={getTabIcon(tab)} iconPosition="start" sx={{ zIndex: 2 }} disableRipple />
        ))}
      </Tabs>
      {toolbar}
    </Box>
  );
}
