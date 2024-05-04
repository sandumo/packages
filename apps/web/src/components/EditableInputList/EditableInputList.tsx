import { TextField } from '@components';
import { Box, IconButton, SxProps } from '@mui/material';
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from '@hello-pangea/dnd';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { useEffect, useState } from 'react';

export type EditableInputListType<T> = {
  items: T[];
  onItemsChange?: (items: T[]) => void;
  getItemValue: (item: T, index: number) => string;
  getItemId: (item: T) => string;
  renderItem?: (item: T, index: number) => React.ReactNode;
  onValueChange?: (item: T, index: number, value: string) => void;
  onItemAdd?: (value: string, index: number) => void;
  getFilter?: (item: T, index: number) => boolean;
  sx?: SxProps;
}

export default function EditableInputList<T>({
  items,
  onItemsChange,
  getItemId,
  renderItem,
  sx = {},
  getItemValue,
  onValueChange,
  onItemAdd,
  getFilter,
}: EditableInputListType<T>) {
  const [winReady, setwinReady] = useState(false);

  const [newItemValue, setNewItemValue] = useState('');

  const onDragEnd = (result: DropResult) => {
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

    const newItems = Array.from(items);
    newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, items[source.index]);

    onItemsChange?.(newItems);
  };

  useEffect(() => {
    setwinReady(true);
  }, []);

  if (winReady === false) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided: DroppableProvided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={sx}
          >
            {items.map((item, index) => (getFilter?.(item, index) === true || !getFilter) && (
              <Draggable key={index} draggableId={`${getItemId(item)}-${index}`} index={index}>
                {(provided: DraggableProvided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ position: 'relative', '&:hover > *:last-child': { opacity: 1 } }}>
                      <TextField
                        placeholder="Începe a scrie pentru a adăuga"
                        value={getItemValue(item, index)}
                        onChange={e => onValueChange?.(item, index, e.target.value)}
                        onBlur={() => onItemsChange?.(items.filter((_, i) => getItemValue(_, i) !== ''))}
                      />
                      <Box sx={{ position: 'absolute', top: 0, bottom: 0, right: 'calc(100% + 4px)', display: 'flex', alignItems: 'center', opacity: 0 }}>
                        <IconButton size="small" onClick={() => onItemsChange?.(items.filter((_, i) => i !== index))}>
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ cursor: 'grab' }}>
                          <DragIndicatorRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>

      <TextField
        placeholder="Începe a scrie pentru a adăuga"
        value={newItemValue}
        onChange={e => setNewItemValue?.(e.target.value)}
        onBlur={e => {
          if (e.target.value === '') return;
          onItemAdd?.(e.target.value, items.length);
          setNewItemValue('');
        }}
      />

      {newItemValue && (
        <TextField sx={{ mt: 2 }} placeholder="Începe a scrie pentru a adăuga" />
      )}
    </DragDropContext>
  );
}
