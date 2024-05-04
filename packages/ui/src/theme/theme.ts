import { createTheme } from '@mui/material/styles';
import components from './components';

// import { GeistMono } from 'geist/font/mono';

// const nunito = Nunito({
//   weight: ['300', '400', '500', '600', '700', '800', '900'],
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['Open Sans', 'Arial', 'sans-serif'],
// });

// const inter = Inter({
//   variable: '--font-inter',
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800', '900'],
// });

// const geistSans = GeistSans({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800', '900'],
// });

let theme = createTheme({
  // spacing: (factor: number) => `${0.25 * factor}rem`,
  spacing: (factor: number) => `${0.25 * factor}rem`,
  palette: {
    mode: 'light',
    tonalOffset: .88,
    primary: {
      main: '#418BF9',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#FF4C51',
    },
    success: {
      main: '#56CA00',
    },
    text: {
      primary: '#544f5a',
      secondary: '#9FA5C0',
    },
  },

  //   typography: {
  //     fontFamily:
  //       userFontFamily ||
  //       [
  //         'Inter',
  //         'sans-serif',
  //         '-apple-system',
  //         'BlinkMacSystemFont',
  //         '"Segoe UI"',
  //         'Roboto',
  //         '"Helvetica Neue"',
  //         'Arial',
  //         'sans-serif',
  //         '"Apple Color Emoji"',
  //         '"Segoe UI Emoji"',
  //         '"Segoe UI Symbol"',
  //       ].join(','),
  //   },
  //   shadows: shadows(mode),
  //   ...spacing,
  //   breakpoints: breakpoints(),
  //   shape: {
  //     borderRadius: 6,
  //   },
  //   mixins: {
  //     toolbar: {
  //       minHeight: 64,
  //     },
  //   },

  typography: {
    // fontFamily: inter.style?.fontFamily,
    // fontFamily: geistSans.style?.fontFamily,
    // fontFamily: GeistSans.style?.fontFamily,
  },
});

// Assign custom typography to theme
// theme = createTheme(theme, {
//   typography: typography(theme),
// });

// Assign custom compoents styles to theme
// theme = createTheme(deepmerge(theme, {
//   components: components(theme),
// }));

theme = createTheme(theme, {
  components: components(theme),
});

export default theme;
