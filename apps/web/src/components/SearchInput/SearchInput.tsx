import React from 'react';
import { InputBase, IconButton, Box, SxProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

let timeout: NodeJS.Timeout;

export interface SearchInputProps {
  value?: string;
  placeholder?: string;
  sx?: SxProps;
  color?: 'primary' | 'secondary';
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onStopTyping?: (value: string) => void;
  onFocusChange?: (value: boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  stopTypingDelay?: number;
  endAdornment?: React.ReactNode;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  placeholder = 'Search',
  sx,
  color = 'secondary',
  onChange,
  onSubmit,
  onStopTyping,
  onFocusChange,
  onKeyDown,
  stopTypingDelay = 500,
  endAdornment,
  autoFocus = false,
}: SearchInputProps) {
  return (
    <Box sx={{
      height: 40,
      backgroundColor: color === 'primary' ? 'primary.light' : 'background.paper',
      border: theme => color === 'primary' ? 'none' : `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      px: 1,
      ...(sx ? sx : {}),
    }}>
      <form
        style={{ display: 'flex', alignItems: 'center', flex: 1 }}
        onSubmit={e => {
          e.preventDefault();
          onSubmit?.((e.target as any).searchInput.value);
        }}
      >
        <IconButton
          type="submit"
          size="small"
          sx={{
            mr: '4px',
            color: color === 'primary' ? 'text.primary' : 'text.disabled',
          }}
        >
          <SearchIcon />
        </IconButton>
        <InputBase
          name="searchInput"
          placeholder={placeholder}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          autoComplete="off"
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          sx={{
            fontSize: 16,
            mr: 2,
            flex: 1,
            '& input': {
              '::placeholder': {
                color: color === 'primary' ? 'text.primary' : 'text.disabled',
                opacity: 1,
              },
              '&:-ms-input-placeholder': {
                color: color === 'primary' ? 'text.primary' : 'text.disabled',
              },
              '&::-ms-input-placeholder': {
                color: color === 'primary' ? 'text.primary' : 'text.disabled',
              },
            },
          }}
          endAdornment={endAdornment}
          {...(value != undefined && onChange ? { value, onChange: e => onChange(e.target.value) } : {})}
          {...(onStopTyping ? { onKeyUp: e => { clearTimeout(timeout); timeout = setTimeout(() => onStopTyping?.((e.target as any).value), stopTypingDelay); } } : {})}
        />
      </form>
    </Box>
  );
}
