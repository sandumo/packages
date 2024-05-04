import { Theme } from '@mui/material';
import { Nunito } from 'next/font/google';

const defaultFont = Nunito({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Open Sans', 'Arial', 'sans-serif'],
});

export default function (theme: Theme): Partial<Theme['typography']> {
  return {
    fontFamily: defaultFont.style?.fontFamily,
  };
}
