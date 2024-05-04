import { CssBaseline } from '@mui/material';
import { ThemeProvider} from '../packages/ui/src/theme';
// import { CacheProvider } from '@emotion/react';
// import { createEmotionCache } from '../packages/ui/src/@core/utils/create-emotion-cache';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

// const cache = createEmotionCache();


export const withMuiTheme = (Story) => (
  // <CacheProvider value={cache}>
    <ThemeProvider>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  // </CacheProvider>
);

export const decorators = [withMuiTheme];

export default preview;
