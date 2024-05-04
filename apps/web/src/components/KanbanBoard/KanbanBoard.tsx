import { Box, Button, SxProps, Typography } from '@mui/material';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import Column from './Column';
import { useEffect, useState } from 'react';
import ImageButton from '@components/ImageButton';
import Dialog from '@components/Dialog';
import { CandidateKambanEmptyStateIcon } from '@icons';

export type BoardProps<T extends Record<string, any>, C extends Record<string, any>> = {
  columns: C[];

  // setColumns?: (columns: C[]) => void;
  cards: T[];

  // setCards?: (cards: T[]) => void;
  onCardMoved?: (card: T, sourceIndex: number, destinationIndex: number, sourceColumn: C, destinationColumn: C) => void;
  onColumnMoved?: (column: C, sourceIndex: number, destinationIndex: number) => void;
  sx?: SxProps;
  renderCard?: (card: T, index: number) => React.ReactNode;
  getColumnId?: (column: C) => string;
  getColumnIndex?: (column: C) => number;
  renderColumnHeader?: (column: C, index: number) => JSX.Element;
  getCardId?: (card: T) => string;
  getCardIndex?: (card: T) => number;
  getCardColumnValue?: (card: T) => string;
}

const defaultColumnHeaderRender = (column: any) => (
  <Box sx={{
    fontWeight: 'bold',
    borderRadius: 1,
    py: 1,
    px: 2,
    backgroundColor: 'primary.light',
    color: 'primary.main',
  }}>{column.title}</Box>
);

export default function KanbanBoard<T extends Record<string, any>, C extends Record<string, any>>({
  columns: _columns,
  cards: _cards,
  onCardMoved,
  onColumnMoved,
  sx = {},
  renderCard,
  getColumnId: _getColumnId = (column: C) => column.id,
  getColumnIndex = (column: C) => column.index,
  renderColumnHeader = defaultColumnHeaderRender,
  getCardId: _getCardId = (card: T) => card.id,
  getCardIndex = (card: T) => card.index,
  getCardColumnValue: _getCardColumnValue = (card: T) => card.status,
}: BoardProps<T, C>) {
  // Adjust non-string value to string
  const getColumnId = (column: C) => String(_getColumnId(column));
  const getCardId = (card: T) => String(_getCardId(card));
  const getCardColumnValue = (card: T) => String(_getCardColumnValue(card));

  // keep columns and cards in state and update them only inside the component
  const [columns, setColumns] = useState<C[]>(_columns);
  const [cards, setCards] = useState<T[]>(_cards);

  useEffect(() => setCards(_cards), [_cards]); // update cards when _cards changes

  useEffect(() => {
    setColumns?.(
      _columns
        .sort((column1, column2) => getColumnIndex(column1) > getColumnIndex(column2) ? 1 : -1)
        .map(column => ({
          ...column,
          cardIds:
              _cards
                .filter(card => getCardColumnValue(card) === getColumnId(column))
                .sort((card1, card2) => getCardIndex(card1) > getCardIndex(card2) ? 1 : -1)
                .map(getCardId),
        }))
    );
  }, [_cards, _columns]);

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

    // If a column was moved
    if (type === 'column') {
      const newColumns = Array.from(columns);
      const [column] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, columns[source.index]);

      setColumns?.(newColumns);
      onColumnMoved?.(column, source.index, destination.index);

      return;
    }

    const card = cards.find((card) => getCardId(card) === draggableId) as T;
    const startColumn = columns.find((column) => getColumnId(column) === source.droppableId) as C;
    const finishColumn = columns.find((column) => getColumnId(column) === destination.droppableId) as C;

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newCardIds = Array.from(startColumn?.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      setColumns?.(columns.map((column) => getColumnId(column) === getColumnId(startColumn) ? { ...column, cardIds: newCardIds } : column));
      onCardMoved?.(card, source.index, destination.index, startColumn, finishColumn);

      return;
    }

    // Moving from one list to another
    const startCardIds = Array.from(startColumn.cardIds);
    startCardIds.splice(source.index, 1);

    const finishCardIds = Array.from(finishColumn.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);

    setColumns?.(columns.map((column) => {
      if (getColumnId(column) === getColumnId(startColumn)) {
        return {
          ...column,
          cardIds: startCardIds,
        };
      }
      if (getColumnId(column) === getColumnId(finishColumn)) {
        return {
          ...column,
          cardIds: finishCardIds,
        };
      }

      return column;
    }));
    onCardMoved?.(card, source.index, destination.index, startColumn, finishColumn);
  };

  // Add Candidate Dialog state
  const [addCandidateDialogOpen, setAddCandidateDialogOpen] = useState(false);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="columns" direction="horizontal" type="column">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="scrollbar scrollbar-y"
            sx={{
              display: 'flex',
              overflowX: 'auto',
              pb: 2,
              ml: '-6px',
              pl: '6px',
              ...sx,
            }}
          >
            {columns.length > 0 ?
              (
                columns.map((column: C, index: number) => (
                  <Column
                    key={getColumnId(column)}
                    column={column}
                    cards={column.cardIds?.map((cardId: any) => cards.find(card => getCardId(card) === cardId)) || []}
                    index={index}
                    renderCard={renderCard}
                    renderColumnHeader={renderColumnHeader}
                    getCardId={getCardId}
                    getColumnId={getColumnId}
                  />
                ))
              ) :
              (
                <Box sx={{ ml: 2, backgroundColor: '#fff', mt: 3, mb: 3, textAlign: 'center', width: '97%', px: '20%', py: '5%', boxShadow: '0px 0px 8px rgba(17, 24, 40, 0.16)', borderRadius: '4px', border: '1px dashed #A768FA' }}>
                  <CandidateKambanEmptyStateIcon sx={{ fontSize: 100, color: '#E0E0E0' }}/>
                  <Typography sx={{ color: '#212121', lineHeight: '20px', mb: 6, fontWeight: 700 }}>La moment nu este adaugat nici un candidat</Typography>
                  <Button onClick={() => setAddCandidateDialogOpen(true)} variant="contained">Add Candidate</Button>
                </Box>
              )
            }
            {provided.placeholder}
          </Box>
        )}
      </Droppable>

      <Dialog
        open={addCandidateDialogOpen}
        onClose={() => setAddCandidateDialogOpen(false)}
        title="Adauga un candidat"
        hideControls
      >
        <Box sx={{ display: 'flex', gap: 4, p: 4 }}>
          <ImageButton label="Completeaza forma" imageSrc="/images/logos/google-forms.png" />
          <ImageButton label="Trimite catre CallCentru" imageSrc="/images/actions/online-survey.png" />
        </Box>
      </Dialog>
    </DragDropContext>
  );
}
