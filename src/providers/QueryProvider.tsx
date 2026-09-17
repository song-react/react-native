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
        // queryCache: new QueryCache({
        //   onError: async error => {
        //   },
        // }),
        // 库默认仅内存缓存；以下以宿主配置 MMKV persister、maxAge=7天及生产参数为例：
        // t=0:    首次请求 → queryFn → 数据存入内存 + MMKV
        // t=1min: 数据变 stale,但仍在内存
        // t=1min+1s: 用户访问 → 触发 refetch(后台) → 立即返回旧数据
        // 查询无人使用持续5分钟：gcTime 到期 → 内存清除
        // 再次使用：从未过期的 MMKV 记录恢复 → 默认在 stale 时后台 refetch
        // 距数据最后更新超过7天：下次读取时记录过期 → 重新执行 queryFn
        ...config,
        defaultOptions: {
          ...config.defaultOptions,
          queries: {
            staleTime: __DEV__ ? 10 * 1000 : 60 * 1000,
            gcTime: 5 * 60 * 1000,
            // refetchOnMount: true,
            // refetchOnWindowFocus: true,
            // refetchOnReconnect: true,
            // refetchInterval: false,
            // refetchIntervalInBackground: false,
            // enabled: true,
            // select: data => data,
            // placeholderData: {},
            // initialData: undefined,
            retry: false,
            // retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // structuralSharing: true,
            // networkMode: 'always',
            // throwOnError: false,
            // experimental_prefetchInRender: true,
            // 宿主可通过 persister 传入 experimental_createQueryPersister 的 persisterFn。
            // 它按查询独立持久化，gcTime 回收内存不会删除持久化记录。
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
