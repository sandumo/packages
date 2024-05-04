import { Box, SxProps, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type SkillLevelPickerProps = {
  name?: string;
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  sx?: SxProps;
}

type Level = {
  color: string;
  label: string;
}

const levels: Level[] = [
  {
    color: '#FF7E7E',
    label: 'Nivel 1',
  },
  {
    color: '#FCAE7A',
    label: 'Nivel 2',
  },
  {
    color: '#EC930C',
    label: 'Nivel 3',
  },
  {
    color: '#80D378',
    label: 'Nivel 4',
  },
  {
    color: '#39D2F3',
    label: 'Nivel 5',
  },
];

const size = 48;

export  function SkillLevelPicker({ sx }: SkillLevelPickerProps) {
  const [value, setValue] = useState<number>(1);

  const currentLevel = levels[value - 1];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx,
    }}>
      <Box sx={{ width: (size + 1) * 5 }}>
        <Typography fontSize={12} fontWeight={700}>Nivel</Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        bgcolor: '#00000008',
        borderRadius: 1,
        border: '1px solid #00000008',
        position: 'relative',
      }}>
        {levels.map((level, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#00000008',
                },
              }}
              onClick={() => setValue(index + 1)}
            >
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: level.color,
              }} />
            </Box>
            {index !== levels.length - 1 && (
              <Box sx={{
                width: '1px',
                height: 24,
                bgcolor: '#00000010',
              }} />
            )}
          </Box>
        ))}

        <Box sx={{
          width: size,
          height: size,
          borderRadius: 1,
          transition: '.25s',
          position: 'absolute',
          bgcolor: currentLevel.color,
          top: 0,
          left: value * (size + 1) - size - 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: '#f6f6f6',
          }} />
        </Box>
      </Box>

      <Typography fontSize={12} fontWeight={700} sx={{ mt: 1, color: currentLevel.color }}>{currentLevel.label}</Typography>
    </Box>
  );
}

export default function SkillLevelPicker2({ name, label, value: _value, onChange, sx }: SkillLevelPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, _setValue] = useState<number>(_value || 1);

  const setValue = (value: number) => {
    _setValue(value);
    onChange?.(value);
  };

  useEffect(() => {
    if (value !== _value) {
      setValue(_value || 1);
    }
  }, [_value]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      ...sx,
    }} ref={ref}>
      {name && <input type="hidden" name={`${name}:json`} value={value} />}

      <Box sx={{ width: (size + 1) * 5 }}>
        <Typography fontSize={12} fontWeight={700}>{label}</Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        bgcolor: '#00000008',
        borderRadius: 1,
        border: '1px solid #00000008',
        position: 'relative',
      }}>
        {levels.map((level, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', ...(value === index + 1 && { flex: 1 }) }}>
            <Box
              sx={{
                width: value === index + 1 ? (ref.current?.clientWidth || 250) - ((size + 1) * 4 + 1) : 48,
                flex: 1,
                height: 48,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: '.40s',
                overflow: 'hidden',

                ...(value === index + 1 ? {
                  bgcolor: level.color,
                } : {
                  '&:hover': {
                    bgcolor: '#00000008',
                  },
                }),
              }}
              onClick={() => setValue(index + 1)}
            >
              {value === index + 1 ? (
                <Box sx={{
                  flex: 1,
                  px: 4,
                }}>
                  <Typography fontWeight={800} sx={{ color: '#fff', textOverflow: 'clip', whiteSpace: 'nowrap' }}>{level.label}</Typography>
                </Box>
              ) : (
                <Box sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: level.color,
                }} />
              )}
            </Box>
            {index !== levels.length - 1 && (
              <Box sx={{
                width: '1px',
                height: 24,
                bgcolor: '#00000010',
              }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
