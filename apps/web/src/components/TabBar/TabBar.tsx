import { Box, Tab, Tabs } from '@mui/material';
import { JSXElementConstructor, ReactElement } from 'react';

type TabBarProps<T> = {
  value: number;
  onChange: (value: number) => void;
  tabs: T[];
  getTabLabel?: (tab: T) => string;
  getTabIcon?: (tab: T) => string | ReactElement<any, string | JSXElementConstructor<any>> | undefined;
  toolbar?: React.ReactNode;
}

export default function TabBar<T>({
  value,
  onChange,
  tabs,
  getTabLabel = (tab: T) => tab as unknown as string,
  getTabIcon = (tab: T) => undefined,
  toolbar,
}: TabBarProps<T>) {
  return (
    <Box sx={{
      display: 'flex',
      bgcolor: '#fff',
      borderRadius: 1,
      border: 1,
      borderColor: '#00000010',
      minHeight: 40,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
      pr: 2,
    }}>
      <Tabs
        value={value}
        onChange={(_, index) => onChange(index)}
        sx={{
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
          },
          '& .MuiTabs-indicator': {
            borderRadius: 1,
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} label={getTabLabel(tab)} icon={getTabIcon(tab)} iconPosition="start" />
        ))}
      </Tabs>
      {toolbar}
    </Box>
  );
}

// old Job/Candidate tab bar
{/* <Tabs
        scrollButtons="auto"
        variant="scrollable"
        value={tab}
        onChange={(e: React.SyntheticEvent, value: number) => setTab(value)}
        sx={{
          minHeight: 40,
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 2,
          mb: 4,
          boxShadow: '0px 0px 8px rgba(17, 24, 40, 0.16)',
          '& .MuiTab-root': {
            textTransform: 'none',
            py: 2,
            px: 2,
            minHeight: 40,
            minWidth: 40,
            mr: 6,
            color: 'text.primary',
            '&:hover': {
              // bgcolor: '#00000005',
            },
            '&.Mui-selected': {
              color: 'text.primary',
              fontWeight: 700,
            },
          },
          '& .MuiTabs-indicator': {
            borderRadius: 1,
          },
        }}
      >
        <Tab disableRipple label="Candidați" />
        <Tab disableRipple label="Toată informația" />
        <Tab disableRipple label="Istorie" />
      </Tabs> */}
