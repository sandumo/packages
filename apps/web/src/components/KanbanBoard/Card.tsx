import { Box } from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';

type CardProps<T extends Record<string, any>> = {
  card: T;
  index: number;
  renderCard?: (card: T, index: number) => React.ReactNode;
  getCardId?: (card: T) => string;
}

export default function Card<T extends Record<string, any>>({
  card,
  index,
  renderCard,
  getCardId = (card: T) => card.id,
}: CardProps<T>) {
  return (
    <Draggable draggableId={getCardId(card)} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ mb: 2 }}
        >
          {renderCard ? renderCard(card, index) : null}
        </Box>
      )}
    </Draggable>
  );
}
