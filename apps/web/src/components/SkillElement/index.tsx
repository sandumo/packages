import { Box } from '@mui/material';

interface skillElementInterface {
    note: number;
    label: string;
}

const SkillElement = ({ note, label }: skillElementInterface) => {
  return (
    <Box
      sx={{
        margin: '4px',
        borderCollapse: 'separate',
        backgroundColor: '#F5ECFE',
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '8px',
        gap: '8px',
        height: '40px',
        borderRadius: '4px',
        flex: 'none',
        order: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 12px',
          gap: '10px',
          width: '17px',
          height: '20px',
          background: '#994DF9',
          borderRadius: '4px',
          flex: 'none',
          order: '0',
          flexGrow: '0',
        }}
      >
        <Box
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            color: '#FFFFFF',
          }}
        >
          {note}
        </Box>
      </Box>
      <Box>
        {label}
      </Box>
    </Box>
  );
};

export default SkillElement;
