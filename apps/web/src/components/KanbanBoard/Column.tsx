import { Box } from '@mui/material';
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';

type ColumnProps<T extends Record<string, any>, C extends Record<string, any>> = {
  column: C;
  cards: T[];
  index: number;
  renderCard?: (card: T, index: number) => React.ReactNode;
  getColumnId?: (column: C) => string;
  renderColumnHeader?: (column: C, index: number) => React.ReactNode;
  getCardId?: (card: T) => string;
}

export default function Column<T extends Record<string, any>, C extends Record<string, any>>({
  column,
  cards,
  index,
  renderCard,
  getColumnId = (column: C) => column.id,
  renderColumnHeader = (column: C) => column.title,
  getCardId = (card: T) => card.id,
}: ColumnProps<T, C>) {
  return (
    <Draggable draggableId={getColumnId(column)} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            minWidth: '332px',
            backgroundColor: snapshot.isDragging ? 'background.default' : 'transparent',
            m: '-6px',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            mr: '10px',
          }}
        >
          <Box
            {...provided.dragHandleProps}
            sx={{
              mt: '6px',
              mx: '6px',
              mb: 3,
            }}
          >
            {renderColumnHeader(column, index)}
          </Box>
          <Droppable droppableId={getColumnId(column)} type="card">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'none',
                  transition: '.25s ease-in-out',
                  flex: 1,
                  minHeight: 100,
                  borderRadius: 1,
                  p: '6px',
                }}
              >
                {cards.map((card, index) => (
                  <Card
                    key={getCardId(card)}
                    card={card}
                    index={index}
                    renderCard={renderCard}
                    getCardId={getCardId}
                  />
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Box>
      )}
    </Draggable>
  );
}
