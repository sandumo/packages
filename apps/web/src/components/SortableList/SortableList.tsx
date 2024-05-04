import { Box, SxProps } from '@mui/material';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

type SortableListProps<T> = {
  items: T[];
  onItemsChange?: (items: T[]) => void;
  getItemId: (card: T) => string;
  renderItem?: (item: T, index: number) => React.ReactNode;
  sx?: SxProps;
}

export default function SortableList<T>({ items, onItemsChange, getItemId, renderItem, sx = {} }: SortableListProps<T>) {
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={sx}
          >
            {items.map((item, index) => (
              <Draggable key={index} draggableId={`${getItemId(item)}-${index}`} index={index}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{ mb: 2 }}
                  >
                    {renderItem ? renderItem(item, index) : null}
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
