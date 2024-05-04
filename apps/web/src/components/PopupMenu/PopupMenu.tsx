import Link from '@components/Link';
import { Box, Menu, MenuItem, PaperProps, PopoverOrigin, SxProps } from '@mui/material';
import React, { useState } from 'react';

type Option = string | Record<string, any>;

interface PopupMenuProps<T extends Option> {
  children: (props: { onClick: (event: React.MouseEvent<HTMLElement>) => void }, state: { open: boolean }) => React.ReactNode;
  options: T[];
  renderLabel?: (option: T) => React.ReactNode;
  renderIcon?: (option: T) => React.ReactNode;
  renderOption?: (option: T) => React.ReactNode;
  onOptionClick?: (option: T) => void;
  getOptionClickHandler?: (option: T) => ((option: T) => void) | undefined;
  getOptionHref?: (option: T) => string | undefined;
  getOnClickHandler?: (option: T) => (() => void) | null;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  PaperProps?: Partial<PaperProps<'div', {}>>;
  itemSx?: SxProps;
}

export default function PopupMenu<T extends Option>({
  children,
  options,
  renderLabel,
  renderIcon,
  renderOption,
  onOptionClick,
  getOptionClickHandler,
  getOptionHref,
  getOnClickHandler,
  anchorOrigin,
  transformOrigin,
  PaperProps,
  itemSx = {},
}: PopupMenuProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (option: T) => {
    handleClose();

    const handler = getOptionClickHandler?.(option) ?? (() => {});
    handler(option);
    onOptionClick?.(option);
  };

  return (
    <Box>
      {children({ onClick: handleOpen }, { open })}
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiList-padding': {
            py: 1,
          },
        }}
        {...(anchorOrigin ? { anchorOrigin } : {})}
        {...(transformOrigin ? { transformOrigin } : {})}
        {...(PaperProps ? { PaperProps } : {})}
      >
        {options.map(option => (
          <MenuItem
            onClick={() => getOnClickHandler ? getOnClickHandler(option)?.() : handleOptionClick(option)}
            sx={{ height: 40, pr: 6, '&:not(:last-child)': { borderBottom: '1px solid #00000008' }, ...itemSx }}
            key={renderLabel ? renderLabel(option) as string : option as string}
            {...(getOptionHref?.(option) ? { component: Link, href: getOptionHref(option) } : {})}
          >
            {renderOption ? renderOption(option) : (
              <>
                {renderIcon ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 3,
                    color: 'text.secondary',
                  }}>
                    {renderIcon(option)}
                  </Box>
                ) : null}
                {renderLabel?.(option) ?? option}
              </>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
