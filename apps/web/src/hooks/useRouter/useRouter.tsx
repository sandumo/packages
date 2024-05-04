import { NextRouter, useRouter as useNextRouter } from 'next/router';

type CustomRouter = NextRouter & {
  pushWithPersistedQueryParams: (url: string, query?: Record<string, any>) => void
  getUrlWithPersistedQueryParams: (url: string, paramsToPersist?: string[]) => string
  updateQuery: (query: Record<string, any>, removeOldQuery?: boolean) => void
}

export default function useRouter(): CustomRouter  {
  const router = useNextRouter();

  return {
    ...router,
    pushWithPersistedQueryParams: (url: string, query?: Record<string, any>) => {
      const { query: currentQuery } = router;
      router.push({
        pathname: url,
        query: {
          ...currentQuery,
          ...query,
        },
      });
    },
    getUrlWithPersistedQueryParams: (url: string, paramsToPersist?: string[]) => {
      const { query } = router;

      let queryKeys = Object.keys(query);
      if (paramsToPersist) {
        queryKeys = queryKeys.filter(k => paramsToPersist.includes(k));
      }

      return `${url}${queryKeys.length ? '?' + queryKeys.map(k => `${k}=${encodeURIComponent(query[k] as string)}`).join('&') : ''}`;
    },
    updateQuery: (query: Record<string, any>, removeOldQuery: boolean = false) => {
      const { pathname, query: currentQuery } = router;
      router.replace({
        pathname,
        query: {
          ...removeOldQuery ? {} : currentQuery,
          ...query,
        },
      }, undefined, { shallow: true, scroll: false });
    },
  };
}
