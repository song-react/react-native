'use client';

import {
  QueryClient,
  QueryClientProvider,
  type MutationCacheNotifyEvent,
  type QueryCacheNotifyEvent,
  type QueryClientConfig,
} from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';

export const QueryProvider = ({
  children,
  onQuery,
  onMutation,
  ...config
}: PropsWithChildren<
  QueryClientConfig & {
    onQuery?: (event: QueryCacheNotifyEvent, client: QueryClient) => void;
    onMutation?: (event: MutationCacheNotifyEvent, client: QueryClient) => void;
  }
>) => {
  const [client] = useState(
    () =>
      new QueryClient({
        ...config,
        defaultOptions: {
          ...config.defaultOptions,
          queries: {
            staleTime: __DEV__ ? 10 * 1000 : 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: false,
            ...config.defaultOptions?.queries,
          },
        },
      })
  );

  useEffect(() => {
    const _query = onQuery
      ? client.getQueryCache().subscribe(event => {
          if (event.type === 'updated' && event.action.type === 'error')
            onQuery(event, client);
        })
      : undefined;
    const _mutation = onMutation
      ? client.getMutationCache().subscribe(event => {
          if (event.type === 'updated' && event.action.type === 'error')
            onMutation(event, client);
        })
      : undefined;
    return () => {
      _query?.();
      _mutation?.();
    };
  }, [client, onMutation, onQuery]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
