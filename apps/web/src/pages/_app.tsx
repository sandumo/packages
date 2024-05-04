// ** React Imports
import { JSXElementConstructor, ReactElement, ReactNode } from 'react';

// ** Next Imports
import Head from 'next/head';
import { Router, useRouter } from 'next/router';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

// ** Store Imports
import { store } from 'src/store';
import { Provider } from 'react-redux';

// ** Loader Import
import NProgress from 'nprogress';

// ** Emotion Imports
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';

// ** Config Imports
import 'src/configs/i18n';
import { defaultACLObj } from 'src/configs/acl';
import themeConfig from 'src/configs/themeConfig';

// ** Third Party Import

// ** Component Imports

// import AuthGuard from 'src/@core/components/auth/AuthGuard';
// import GuestGuard from 'src/@core/components/auth/GuestGuard';
// import WindowWrapper from 'src/@core/components/window-wrapper';

// // ** Spinner Import
// import Spinner from 'src/@core/components/spinner';

// ** Contexts
import { AuthProvider } from 'src/context/AuthContext';

// ** Styled Components

// ** Utils Imports
// import { createEmotionCache } from 'src/@core/utils/create-emotion-cache';

// ** Prismjs Styles
import 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Overlay Scrollbar
import 'overlayscrollbars/overlayscrollbars.css';

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css';

// ** Global css styles
import '../../styles/globals.css';
import '../../styles/custom-scrollbar.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ** Leaflet Marker Cluster Styles
import '../../styles/leaflet-marker-cluster.css';
import '../../styles/leaflet.css';

// ** TipTap rich text editor styles
import '../../styles/tiptap.css';

// import { api } from 'api-client';
import api from 'api-client';
import { Environment } from 'src/configs/env';
import ContextSettings from '@configs/ContextSettings';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AdminLayout, EmployeeLayout, EmployerLayout } from '@layouts';
import { DialogConfirmProvider } from '@context/DialogConfirmContext';
import { ThemeProvider, createEmotionCache } from 'ui';
import { UserDataType } from '@context/types';

import { Analytics } from '@vercel/analytics/react';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { BasketProvider } from '@context/BasketContext';

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
  session: UserDataType
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

const clientSideEmotionCache = createEmotionCache();

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start();
  });
  Router.events.on('routeChangeError', () => {
    NProgress.done();
  });
  Router.events.on('routeChangeComplete', () => {
    NProgress.done();
  });
}

// const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
//   if (guestGuard) {
//     return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>;
//   } else if (!guestGuard && !authGuard) {
//     return <>{children}</>;
//   } else {
//     return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>;
//   }
// };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  },
});

api.axios.defaults.baseURL = Environment.API_URL;
api.axios.defaults.validateStatus = status => true;

// apiAutogen.axios.defaults.baseURL = Environment.API_URL;
// apiAutogen.axios.defaults.validateStatus = status => true;

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps, session } = props;

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false;

  const router = useRouter();

  let getLayout = (page: ReactElement<any, string | JSXElementConstructor<any>>, title?: string): ReactNode => page;//Component.getLayout;

  if (Component.getLayout) {
    getLayout = Component.getLayout;
  } else {
    if (router.pathname.startsWith('/employee')) {
      getLayout = (page: ReactNode, title?: string) => <EmployeeLayout title={title} >{page}</EmployeeLayout>;
    } else if (router.pathname.startsWith('/employer')) {
      getLayout = (page: ReactNode) => <EmployerLayout>{page}</EmployerLayout>;
    } else if (router.pathname.startsWith('/admin')) {
      getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
    }
  }

  // const getLayout =
  //   Component.getLayout ?? (page => <Dashboard2Layout>{page}</Dashboard2Layout>);

  const setConfig = Component.setConfig ?? undefined;

  const authGuard = Component.authGuard ?? false;

  const guestGuard = Component.guestGuard ?? false;

  const aclAbilities = Component.acl ?? defaultACLObj;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>Flooring</title>
            <meta name='viewport' content='initial-scale=1, width=device-width' />
          </Head>

          <AuthProvider session={session}>
            <ThemeProvider>
              <QueryClientProvider client={queryClient}>
                <ContextSettings />
                <DialogConfirmProvider>
                  <BasketProvider>
                    {getLayout(<Component {...pageProps} />, (Component as any)?.title)}
                    <Analytics />
                    <SpeedInsights />
                  </BasketProvider>
                </DialogConfirmProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </AuthProvider>
        </CacheProvider>
      </Provider>
    </LocalizationProvider>
  );
};

export default App;

// This function is called once in every page load
// It's making use of the `x-session` header passed from global nextjs middleware.ts
// It will pass the session data to the page component as props
// App.getInitialProps = async (ctx: any) => {
//   const session = ctx.ctx.req?.headers['x-session'];

//   return {
//     session: JSON.parse(session ?? '{}'),
//   };
// };
