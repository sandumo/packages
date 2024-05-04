import { useEffect, useState } from 'react';

// ** Mui Components
import { Box } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ListEditorItem from './ListEditorItem';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';

type ListEditorProps<T> = {
  items?: T[];
  defaultItems?: T[];
  getItemLabel?: (item: T) => string;
  getItemVisibility?: (item: T) => boolean;

  /**
   * Used to prevent render issues of list items. For input focus to work properly, the key of the item must be a value that doesn't change (`id` will work, `label` won't work).
   */
  getItemKey?: (item: T) => number | string;
  getNewBlankItem?: () => T;
  onItemVisibilityChange?: (item: T, visible: boolean) => void;
  onItemRemove?: (item: T) => void;
  onChange?: (items: T[]) => void;
  onItemIndexChange?: (item: T, oldIndex: number, newIndex: number) => void;
  onItemLabelChange?: (item: T, label: string) => void;
}

export default function ListEditor<T>({
  items: _items,
  defaultItems,
  getItemLabel = (item: T) => item as unknown as string,
  getItemVisibility = (item: T) => true,
  getItemKey = (item: T) => getItemLabel(item),
  getNewBlankItem,
  onItemVisibilityChange,
  onChange,
  onItemIndexChange,
  onItemRemove,
  onItemLabelChange,
}: ListEditorProps<T>) {
  const [items, setItems] = useState(_items || []);
  const [usedDefaultItems, setUsedDefaultItems] = useState(false);
  const [focusedItemKey, setFocusedItemKey] = useState<number | string | null>(null);

  useEffect(() => setItems(_items || []), [_items]);
  useEffect(() => {
    if (!usedDefaultItems && items.length === 0) {
      setItems(defaultItems || []);
      setUsedDefaultItems(true);
    }
  }, []);

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);

    const { source, destination, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newItems = [...items];
    const [item] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, item);

    setItems(newItems);
    onChange?.(newItems);
    onItemIndexChange?.(item, source.index, destination.index);
  };

  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={() => setIsDragging(true)}>
      <Droppable droppableId="items" direction="vertical">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ mb: -2, ml: '-21px', '& > *': { mb: 2 } }}
            className="scrollbar scrollbar-y"
          >
            {items.map((item, index) => (
              <ListEditorItem
                key={getItemKey(item)}
                label={getItemLabel(item)}
                index={index}
                visible={getItemVisibility(item)}
                onVisibilityChange={visible => onItemVisibilityChange?.(item, visible)}
                isDragging={isDragging}
                onRemove={() => onItemRemove?.(item)}
                onLabelChange={label => onItemLabelChange?.(item, label)}
                onFocus={() => setFocusedItemKey(getItemKey(item))}
                onBlur={() => setFocusedItemKey(null)}
                focused={focusedItemKey === getItemKey(item)}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
      <Box
        sx={{
          height: 44,
          border: 1,
          borderColor: '#00000005',
          borderRadius: 1,
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          color: '#00000080',
          bgcolor: '#00000008',
          cursor: 'pointer',
          transition: '.2s ease-in-out',
          '&:hover': {
            bgcolor: '#0000000f',
          },
        }}
        onClick={() => onChange?.([...items, getNewBlankItem?.() || {} as T])}
      >
        <Box>Adaugă o coloană</Box>
        <AddRoundedIcon />
      </Box>
    </DragDropContext>
  );
}
