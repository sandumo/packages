import { Box, Checkbox, Menu, MenuItem } from '@mui/material';
import { DataGrid, DataGridProps, GridRow } from '@mui/x-data-grid';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import Link from '@components/Link';
import { JSXElementConstructor, useState } from 'react';

const NoRowsOverlay = () => (
  <Box sx={{
    height: '100%',
    color: 'text.disabled',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <FolderOpenRoundedIcon sx={{ mr: 1 }} fontSize="small" /> No data
  </Box>
);

type ContextMenuItem = {
  label: string;

  onClick?: () => void;
  href?: string;
};

type RowContextMenuProps = {
  items: ContextMenuItem[];
}

const Row = ({ getRowHref, handleRowContextMenu, rowContextMenu, ...props }: any) => {
  const additionalProps: Record<string, any> = {};
  const style: Record<string, any> = {};

  if (handleRowContextMenu) {
    additionalProps.onContextMenu = (event: React.MouseEvent) => {
      event.preventDefault();
      handleRowContextMenu(event, props.row);
    };

    if (rowContextMenu && rowContextMenu.id === props.row.id) {
      style.backgroundColor = 'rgba(127, 36, 241, 0.08)';
    }
  }

  if (getRowHref) {
    style.cursor = 'pointer';
  }

  const gridRowCompoent = <GridRow {...props} {...additionalProps} style={{ ...props.style, ...style }} />;

  if (!getRowHref) return gridRowCompoent;

  return (
    <Link href={getRowHref(props.row)}>
      {gridRowCompoent}
    </Link>
  );
};

const getRowComponent = ({ getRowHref, handleRowContextMenu, rowContextMenu }: { getRowHref?: (row: any) => string, handleRowContextMenu?: (event: React.MouseEvent, options: any) => void, rowContextMenu?: any }): JSXElementConstructor<any> => {
  return ({ ...props }: any) => <Row {...props} {...({ getRowHref, handleRowContextMenu, rowContextMenu })} />;
};

const BaseCheckbox = ({ ...props }: any) => (
  <Checkbox {...props} onClick={e => e.stopPropagation()}/>
);

type TableProps = {
  getRowHref?: (row: any) => string;
  getRowContextMenu?: (row: any) => RowContextMenuProps;
} & DataGridProps

export default function Table({
  rows,
  columns,
  getRowHref,
  getRowContextMenu,
  sx,
  ...props
}: TableProps) {
  const [rowContextMenu, setRowContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    id: number;
  } | null>(null);

  const [rowContextMenuOptions, setRowContextMenuOptions] = useState<Record<string, any> | null>(null);

  const handleRowContextMenu = (event: React.MouseEvent, row: any) => {
    setRowContextMenuOptions({ ...(getRowContextMenu?.(row) || {}), id: row.id });
    setRowContextMenu(
      rowContextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          id: row.id,
        }
        : null,
    );
  };

  const handleRowContextMenuClose = () => {
    setRowContextMenu(null);
  };

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}

        // autoHeight
        isCellEditable={() => false}
        isRowSelectable={() => !!props.checkboxSelection}
        rowsPerPageOptions={[10, 25, 50, 100]}
        disableSelectionOnClick
        disableColumnMenu
        sx={{
          // border: 'none',
          // filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.10))',
          '& .MuiDataGrid-main': {
            backgroundColor: 'background.paper',
            borderRadius: 1,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.paper',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeader': {
            p: 2,
            '&:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: 14,
          },
          '& .MuiDataGrid-columnHeaderTitleContainer': {
            overflow: 'unset',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'background.paper',
            borderBottom: theme => `1px solid ${theme.palette.divider}`,

            ...(props.onRowClick && {
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }),
          },
          '& .MuiDataGrid-cell': {
            p: 2,
            border: 'none',
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            // border: 'none',
          },
          '& .MuiDataGrid-columnHeaderCheckbox': {
            width: '56px!important',
            maxWidth: '56px!important',
            px: '7px',
          },
          '& .MuiDataGrid-cellCheckbox': {
            px: '28px',
          },
          flex: 1,
          ...sx,
        }}
        components={{
          NoRowsOverlay,
          Row: getRowComponent({ getRowHref, ...(getRowContextMenu ? { handleRowContextMenu, rowContextMenu } : {}) }),
          BaseCheckbox,
        }}
        {...props}
      />
      <Menu
        open={rowContextMenu !== null}
        onClose={handleRowContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          rowContextMenu !== null
            ? { top: rowContextMenu.mouseY, left: rowContextMenu.mouseX }
            : undefined
        }
        slotProps={{
          backdrop: {
            onContextMenu: (e: any) => {
              e.preventDefault();
              handleRowContextMenuClose();
            },
          },
        }}
      >
        {rowContextMenuOptions && rowContextMenuOptions.items.map((item: ContextMenuItem) => item.href ? (
          <Link href={item.href}>
            <MenuItem onClick={() => { item.onClick?.(); handleRowContextMenuClose(); }}>{item.label}</MenuItem>
          </Link>
        ) : (
          <MenuItem onClick={() => { item.onClick?.(); handleRowContextMenuClose(); }}>{item.label}</MenuItem>
        ))}
      </Menu>
    </>
  );
}
