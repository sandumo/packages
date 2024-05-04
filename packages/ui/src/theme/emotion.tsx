import createCache from '@emotion/cache';
import createEmotionServer from '@emotion/server/create-instance';
import { Children } from 'react';

export const createEmotionCache = () => {
  return createCache({ key: 'css' });
};

export const getEmotionCacheInitialProps = async (ctx: any, document: any) => {

  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) => (props: any) =>
        (
          <App
            {...props} // @ts-ignore
            emotionCache={cache}
          />
        ),
    });

  const initialProps = await document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style: any) => {
    return (
      <style
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
      />
    );
  });

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags],
  };
};
