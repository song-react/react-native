'use client';

import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Paths } from 'expo-file-system';
import { useEffect, type PropsWithChildren } from 'react';
import { createMMKV } from 'react-native-mmkv';

let browserQueryClient: QueryClient | undefined;
const mmkv = createMMKV({
  id: 'tanstack-query-cache',
  path: Paths.cache.uri.replace(/^file:\/\//, ''),
  mode: 'multi-process',
});

export const getQueryClient = () => {
  if (browserQueryClient) return browserQueryClient;

  const queryClient = new QueryClient({
    // 时间线：
    // t=0:      首次请求 → queryFn → 数据存入内存和 MMKV
    // t=1min:   数据变 stale，但仍在内存
    // t=1min+1s: 用户访问 → 后台 refetch，并立即返回旧数据
    // t=5min:   用户离开页面 → gcTime 到期 → 内存清除
    // t=6min:   用户返回 → 从 MMKV 恢复 → 因数据已 stale 而 refetch
    // t=7天:    MMKV 缓存过期 → 下次访问执行 queryFn
    defaultOptions: {
      queries: {
        staleTime: __DEV__ ? 10 * 1000 : 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: false,
        // 旧的 persister 持久化整个 QueryClient；当 gcTime 小于 maxAge 时，内存清理后的
        // 空缓存可能覆盖持久化数据。这里改用按 query 独立存取的 persister。
        persister: experimental_createQueryPersister({
          storage: {
            getItem: key => mmkv.getString(key) ?? null,
            setItem: (key, value) => {
              mmkv.set(key, value);
            },
            removeItem: key => {
              mmkv.remove(key);
            },
            entries: () =>
              mmkv.getAllKeys().flatMap(key => {
                const value = mmkv.getString(key);
                return value === undefined
                  ? []
                  : [[key, value] as [string, string]];
              }),
          },
          maxAge: 7 * 24 * 60 * 60 * 1000,
          serialize: data =>
            JSON.stringify(data, (_key, value) =>
              typeof value === 'bigint'
                ? `__bigint__${value.toString()}`
                : value
            ),
          deserialize: data =>
            JSON.parse(data, (_key, value) =>
              typeof value === 'string' && value.startsWith('__bigint__')
                ? BigInt(value.slice(10))
                : value
            ),
        }).persisterFn,
      },
    },
  });

  if (typeof window !== 'undefined') {
    // Browser/React Native 复用同一个实例，避免初次渲染挂起时重新创建 QueryClient。
    browserQueryClient = queryClient;
  }
  // Server 每次创建新实例，避免请求之间共享缓存。
  return queryClient;
};

export const QueryProvider = ({
  children,
  onQuery,
  onMutation,
}: PropsWithChildren<{
  onQuery?: (error: unknown) => void;
  onMutation?: (error: unknown) => void;
}>) => {
  useEffect(() => {
    const client = getQueryClient();
    const unsubQuery = onQuery
      ? client.getQueryCache().subscribe(event => {
          if (event.type === 'updated' && event.action.type === 'error') {
            onQuery(event.action.error);
          }
        })
      : undefined;
    const unsubMutation = onMutation
      ? client.getMutationCache().subscribe(event => {
          if (event.type === 'updated' && event.action.type === 'error') {
            onMutation(event.action.error);
          }
        })
      : undefined;
    return () => {
      unsubQuery?.();
      unsubMutation?.();
    };
  }, [onMutation, onQuery]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
};
