import Pagination from '@components/Pagination';
import Select from '@components/Select';
import { Box } from '@mui/material';

type DashboardPaginationProps = {
  page: number;
  onPageChange?: (page: number) => void;
  pageSize: number;
  onPageSizeChange?: (pageSize: number) => void;
  count: number;
}

export default function DashboardPagination({
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  count,
}: DashboardPaginationProps) {
  return (
    <Box sx={{
      position: 'sticky',
      bottom: -16,
      py: 2,
      px: 4,
      bgcolor: '#fff',
      borderTop: 1,
      borderTopColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Select value={pageSize} options={[10, 25, 50, 100, 200]} onChange={pageSize => onPageSizeChange?.(pageSize)} />
      <Pagination page={page} count={Math.ceil(count / pageSize)} onChange={onPageChange} />
    </Box>
  );
}
