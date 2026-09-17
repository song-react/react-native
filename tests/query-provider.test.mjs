import { MutationCache, QueryCache } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, mock, test } from 'bun:test';
import * as React from 'react';

let _state;
let _effects;
const _cleanups = [];
globalThis.__DEV__ = false;
mock.module('react', () => ({
  ...React,
  useState: init => [(_state ??= init())],
  useEffect: effect => _effects.push(effect),
}));
const { QueryProvider } = await import('../src/providers/QueryProvider');
const _render = (props = {}) => QueryProvider(props).props.client;
const _commit = () =>
  _effects.splice(0).forEach(effect => _cleanups.push(effect()));
beforeEach(() => {
  _state = undefined;
  _effects = [];
});
afterEach(() => {
  _cleanups.splice(0).forEach(cleanup => cleanup?.());
  _state?.clear();
});

test('默认仅配置内存缓存，重渲染复用实例，重新挂载创建独立实例', () => {
  const _first = _render();
  expect(_first.getDefaultOptions().queries).toEqual({
    staleTime: 60_000,
    gcTime: 300_000,
    retry: false,
  });
  _first.setQueryData(['member'], 'first');
  expect(_render({ defaultOptions: { queries: { staleTime: 123 } } })).toBe(
    _first
  );
  expect(_first.getDefaultOptions().queries.staleTime).toBe(60_000);
  _state = undefined;
  const _second = _render();
  expect(_second).not.toBe(_first);
  expect(_second.getQueryData(['member'])).toBeUndefined();
  _first.clear();
});

test('官方配置按层覆盖默认值，保留自定义缓存与 mutation 配置，persister由宿主提供', async () => {
  const _persister = mock((fn, context) => fn(context));
  const _queryCache = new QueryCache();
  const _mutationCache = new MutationCache();
  const _client = _render({
    queryCache: _queryCache,
    mutationCache: _mutationCache,
    defaultOptions: {
      queries: { staleTime: 0, persister: _persister },
      mutations: { retry: 2 },
    },
  });
  expect(_client.getQueryCache()).toBe(_queryCache);
  expect(_client.getMutationCache()).toBe(_mutationCache);
  expect(_client.getDefaultOptions()).toEqual({
    queries: {
      staleTime: 0,
      gcTime: 300_000,
      retry: false,
      persister: _persister,
    },
    mutations: { retry: 2 },
  });
  expect(
    await _client.fetchQuery({ queryKey: ['value'], queryFn: () => 'data' })
  ).toBe('data');
  expect(_persister).toHaveBeenCalledTimes(1);
});

test('错误订阅传递完整事件和对应client，并在卸载时取消订阅', async () => {
  const _query = mock();
  const _mutation = mock();
  const _client = _render({ onQuery: _query, onMutation: _mutation });
  _commit();
  const _error = Object.assign(new Error('维护中'), { code: 50302 });
  await _client
    .fetchQuery({
      queryKey: ['failed'],
      queryFn: () => {
        throw _error;
      },
    })
    .catch(() => {});
  await _client
    .getMutationCache()
    .build(_client, {
      mutationFn: async () => {
        throw _error;
      },
    })
    .execute()
    .catch(() => {});
  expect(_query).toHaveBeenCalledTimes(1);
  expect(_mutation).toHaveBeenCalledTimes(1);
  for (const _callback of [_query, _mutation]) {
    expect(_callback.mock.calls[0][0]).toMatchObject({
      type: 'updated',
      action: { type: 'error', error: _error },
    });
    expect(_callback.mock.calls[0][1]).toBe(_client);
  }
  _cleanups.splice(0).forEach(cleanup => cleanup?.());
  await _client
    .fetchQuery({
      queryKey: ['after'],
      queryFn: () => {
        throw _error;
      },
    })
    .catch(() => {});
  await _client
    .getMutationCache()
    .build(_client, {
      mutationFn: async () => {
        throw _error;
      },
    })
    .execute()
    .catch(() => {});
  expect(_query).toHaveBeenCalledTimes(1);
  expect(_mutation).toHaveBeenCalledTimes(1);
});
