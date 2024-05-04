// ** Mui Components
import { Box, IconButton, InputBase } from '@mui/material';

// ** Mui Icons
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';

// ** Custom Icons
import { VisibilityIcon, VisibilityOffIcon } from '@icons';
import { Draggable } from '@hello-pangea/dnd';
import { useEffect, useRef, useState } from 'react';

const ITEM_HEIGHT = 44;

type ListEditorItemProps = {
  label: string;
  index: number;
  visible?: boolean;
  isDragging: boolean;
  focused?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onRemove?: () => void;
  onLabelChange?: (label: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

let timeout: NodeJS.Timeout;

export default function ListEditorItem({
  label,
  index,
  visible = true,
  isDragging,
  focused = false,
  onVisibilityChange,
  onRemove,
  onLabelChange,
  onFocus,
  onBlur,
}: ListEditorItemProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(label);

  // throttle label change to let user edit the input in a smooth way
  useEffect(() => {
    if (value !== label) {
      timeout = setTimeout(() => {
        onLabelChange?.(value);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [value, label, onLabelChange]);

  // focus input when parent says to focus
  useEffect(() => {
    if (focused) {
      ref.current?.focus();
    }
  }, [focused]);

  return (
    <Draggable draggableId={`item:${label}`} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            display: 'flex',
            '& > *:first-child': {
              transition: '.25s ease-in-out',
              opacity: 0,
            },
            '&:hover > *:first-child': {
              opacity: isDragging && !snapshot.isDragging ? 0 : 1,
            },
          }}
        >
          <Box
            {...provided.dragHandleProps}
            sx={{
              color: 'text.disabled',
              width: 21,
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <DragIndicatorOutlinedIcon />
          </Box>
          <Box sx={{
            border: '1px solid #00000010',
            borderRadius: 1,
            height: ITEM_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pl: 3,
            pr: 2,
            flex: 1,
            ...(snapshot.isDragging ? {
              bgcolor: '#fff',
              overflow: 'hidden',
            } : {}),
            '& > *:last-child > *:first-of-type': {
              transition: '.25s ease-in-out',
              opacity: 0,
            },
            '&:hover > *:last-child > *:first-of-type': {
              opacity: isDragging && !snapshot.isDragging ? 0 : 1,
            },
            '& > *:last-child > *:last-child': {
              transition: '.25s ease-in-out',
              opacity: 0,
            },
            '&:hover > *:last-child > *:last-child': {
              opacity: isDragging && !snapshot.isDragging ? 0 : 1,
            },
          }}>
            <Box>
              <InputBase
                inputRef={ref}
                placeholder="Column name"
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Box>
            <Box sx={{ display: 'flex' }}>
              <IconButton size="small" onClick={() => onRemove?.()}>
                <DeleteOutlineRoundedIcon sx={{ color: 'text.disabled' }} />
              </IconButton>
              <IconButton sx={{ ...(!visible ? { opacity: '1!important' } : {}) }} size="small" onClick={() => onVisibilityChange?.(!visible)}>
                {visible ? (
                  <VisibilityIcon sx={{ color: 'text.disabled' }} />
                ) : (
                  <VisibilityOffIcon sx={{ color: 'text.disabled' }} />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Draggable>
  );
}
