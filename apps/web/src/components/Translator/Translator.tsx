import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, Box } from '@mui/material';

const Translator: React.FC = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [shortLanguage, setShortLanguage] = useState('');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
      setSelectedLanguage(storedLanguage);

      switch (storedLanguage) {
      case 'ro':
        setShortLanguage('RO');
        break;
      case 'ru':
        setShortLanguage('РУ');
        break;
      case 'en':
        setShortLanguage('EN');
        break;
      default:
        setShortLanguage('RO');
      }
    } else {
      setSelectedLanguage('ro');
      setShortLanguage('RO');
    }
  }, [i18n]);

  const changeLanguage = (lng: any) => {
    i18n.changeLanguage(lng);
    setSelectedLanguage(lng);
    localStorage.setItem('language', lng);

    setSelectedLanguage(lng);

    switch (lng) {
    case 'ro':
      setShortLanguage('RO');
      break;
    case 'ru':
      setShortLanguage('РУ');
      break;
    case 'en':
      setShortLanguage('EN');
      break;
    default:
      setShortLanguage('RO');
    }
  };

  return (
    <Box sx={{ mr: 8 }}>
      <Select
        value={selectedLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        sx={{ width: '90px', '& .MuiSelect-select': { p: '10px 14px' } }}
        renderValue={option => shortLanguage}
      >
        <MenuItem value="ro">Română</MenuItem>
        <MenuItem value="ru">Русский</MenuItem>
        <MenuItem value="en">English</MenuItem>
      </Select>
    </Box>
  );
};

export default Translator;
