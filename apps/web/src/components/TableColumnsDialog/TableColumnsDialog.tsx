import Checkbox from '@components/Checkbox';
import Dialog from '@components/Dialog';
import SortableList from '@components/SortableList';
import { TableColDef } from '@components/Table';
import Typography from '@components/Typography';
import { ColumnsIcon } from '@icons';
import { Box, Divider } from '@mui/material';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

interface TableColumnsDialogProps {
  open: boolean;
  onClose: () => void;
  columns: TableColDef[];
  onColumnsChange: (columns: TableColDef[]) => void;
  columnVisibilityModel: GridColumnVisibilityModel;
  onColumnVisibilityModelChange: (columnVisibilityModel: GridColumnVisibilityModel) => void;
}

export default function TableColumnsDialog({
  open,
  onClose,
  columns,
  onColumnsChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
}: TableColumnsDialogProps) {
  const [updatedColumnVisibilityModel, setUpdatedColumnVisibilityModel] = useState<GridColumnVisibilityModel>(columnVisibilityModel);
  const [updatedColumns, setUpdatedColumns] = useState<TableColDef[]>(columns);

  useEffect(() => {
    setUpdatedColumnVisibilityModel(columnVisibilityModel);
  }, [columnVisibilityModel]);

  useEffect(() => {
    setUpdatedColumns(columns);
  }, [columns]);

  return (
    <Dialog
      title="Editează coloanele"
      open={open}
      onClose={onClose}
      onConfirm={async () => {
        onColumnVisibilityModelChange(updatedColumnVisibilityModel);
        onColumnsChange(updatedColumns);
      }}
    >
      <Box sx={{
        display: 'flex',
        gap: 4,
        minWidth: '560px',
      }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom sx={{ fontWeight: 700 }}>Alege coloana</Typography>
          {columns.map((column) => (
            <Checkbox
              key={column.headerName}
              label={column.headerName}
              checked={updatedColumnVisibilityModel[column.field] === false ? false : true}
              onChange={() => setUpdatedColumnVisibilityModel({ ...updatedColumnVisibilityModel, [column.field]: !(updatedColumnVisibilityModel[column.field] === false ? false : true) })}
            />
          ))}
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ flex: 1 }}>
          <Typography gutterBottom sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ordonează coloanele</Typography>
          <SortableList
            items={updatedColumns}
            getItemId={(item) => item.field}
            onItemsChange={(items) => setUpdatedColumns(items)}
            renderItem={(item, index) => (
              <Box sx={{
                height: 40,
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                px: 2,
                backgroundColor: 'background.paper',
                gap: 4,
              }}>
                <ColumnsIcon sx={{ color: 'text.disabled' }} />
                <Typography>{item.headerName}</Typography>
              </Box>
            )}
          />
        </Box>
      </Box>
    </Dialog>
  );
}
