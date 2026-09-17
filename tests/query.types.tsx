import { MutationCache, QueryCache } from '@tanstack/react-query';
import { QueryProvider } from '../src/providers/QueryProvider';

export const queryConfig = (
  <QueryProvider
    queryCache={new QueryCache()}
    mutationCache={new MutationCache()}
    defaultOptions={{ queries: { staleTime: 0 }, mutations: { retry: 1 } }}
    onQuery={(event, client) => {
      if (event.type === 'updated' && event.action.type === 'error')
        client.setQueryData(['error'], event.action.error);
      // @ts-expect-error 完整事件没有顶层code，必须先读取action.error。
      void event.code;
    }}
    onMutation={(event, client) => {
      if (event.type === 'updated' && event.action.type === 'error')
        client.setQueryData(['error'], event.action.error);
    }}
  />
);
