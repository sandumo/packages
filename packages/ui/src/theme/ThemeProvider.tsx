import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { CssBaseline } from '@mui/material';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {/* <GlobalStyles styles={() => GlobalStyling(theme) as any} /> */}
      {children}
    </MuiThemeProvider>
  );
}
