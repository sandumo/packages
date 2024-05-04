import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

// Components
import Typography from '@components/Typography';
import Collapse from '@components/Collapse';
import Checkbox from '@components/Checkbox';

type CheckboxListProps<T> = {
  title: string;
  options: T[];
  getOptionLabel: (option: T) => React.ReactNode;
  getOptionChecked: (option: T) => boolean;
  onOptionCheckedChange: (option: T, checked: boolean) => void;
  getSelectedCount?: (options: T[]) => number;
  onClear?: () => void;
}

export default function CheckboxList<T>({
  title,
  options,
  getOptionLabel,
  getOptionChecked,
  onOptionCheckedChange,
  getSelectedCount,
  onClear,
}: CheckboxListProps<T>) {
  const [expanded, setExpanded] = useState(true);

  const selectedCount = getSelectedCount?.(options) || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ flex: 1, cursor: 'pointer', fontSize: 18, fontWeight: 700 }} onClick={() => setExpanded(!expanded)}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedCount ? (
            <Box
              sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: theme => `${theme.palette.primary.main}25`,
                color: 'primary.main',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: '.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms!important',
                '& > *': { transition: '.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms!important' },
                '&:hover': { bgcolor: theme => `${theme.palette.primary.main}30` },
                '&:hover > *:first-of-type': { opacity: 0, transform: 'scale(0)' },
                '&:hover > *:last-child': { opacity: 1, transform: 'scale(1)' },
                position: 'relative',
              }}
              onClick={onClear}
            >
              <Box sx={{ position: 'absolute' }}>{selectedCount}</Box>
              <ClearRoundedIcon sx={{ position: 'absolute', opacity: 0, transform: 'scale(0)', fontSize: 18 }} />
            </Box>
          ) : null}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <KeyboardArrowDownRoundedIcon sx={{ transform: `rotate(${expanded ? 0 : 180}deg)`, transition: '.25s ease-in-out' }} />
          </IconButton>
        </Box>
      </Box>
      <Collapse
        in={expanded}
      >
        {options.map((option, index) => (
          <Checkbox
            key={index}
            label={getOptionLabel(option)}
            checked={getOptionChecked(option)}
            onChange={(_, checked) => onOptionCheckedChange(option, checked)}
            sx={{ mr: '13px' }}
          />
        ))}
        <Box sx={{ height: '1rem' }} />
      </Collapse>
    </Box>
  );
}
