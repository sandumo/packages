import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { Box } from '@mui/material';

interface InputLableAndClearProps {
  label?: string;
  multiline?: boolean;
  name?: string;
  defaultValue?: string;
}

export default function InputLableAndClear(props: InputLableAndClearProps) {
  const { label, multiline, name, defaultValue } = props;

  return (
    <Box sx = {{ mt: 2, mb: 4 }}>
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Autocomplete
          freeSolo
          options={[]}
          value={defaultValue || undefined}
          renderInput={(params) => <TextField
            name={ name }
            multiline={multiline}
            rows={4}
            {...params}
            label={label} />}
        />
      </Stack>
    </Box>
  );
}

