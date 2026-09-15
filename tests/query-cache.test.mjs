import { notifyManager } from '@tanstack/react-query';
import { beforeEach, expect, mock, test } from 'bun:test';

const _disk = new Map();
globalThis.window = {};
globalThis.__DEV__ = false;
mock.module('expo-file-system', () => ({
  Paths: { cache: { uri: 'file:///cache/' } },
}));
mock.module('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: key => _disk.get(key),
    set: (key, value) => _disk.set(key, value),
    remove: key => _disk.delete(key),
    getAllKeys: () => [..._disk.keys()],
    clearAll: () => _disk.clear(),
  }),
}));
const { clearQueryClient, getQueryClient } =
  await import('../src/providers/QueryProvider');
const _settle = () => new Promise(resolve => setTimeout(resolve, 20));
beforeEach(clearQueryClient);

test('普通内存回收仍可恢复磁盘数据，显式清理则移除所有查询和 mutation', async () => {
  const client = getQueryClient();
  await client.fetchQuery({ queryKey: ['profile'], queryFn: () => 'cached' });
  await _settle();
  client.removeQueries();
  const network = mock(() => 'fresh');
  expect(
    await client.fetchQuery({ queryKey: ['profile'], queryFn: network })
  ).toBe('cached');
  expect(network).not.toHaveBeenCalled();
  await client
    .getMutationCache()
    .build(client, { mutationFn: () => 'private result' })
    .execute();
  clearQueryClient();
  expect(getQueryClient()).toBe(client);
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(client.getMutationCache().getAll()).toHaveLength(0);
  expect(_disk.size).toBe(0);
  expect(
    await client.fetchQuery({ queryKey: ['profile'], queryFn: network })
  ).toBe('fresh');
  await _settle();
  expect(_disk.size).toBe(1);
});

test('清理前排队的持久化任务不覆盖新会话缓存', async () => {
  const jobs = [];
  notifyManager.setScheduler(callback => jobs.push(callback));
  try {
    await getQueryClient().fetchQuery({
      queryKey: ['profile'],
      queryFn: () => 'old',
    });
    clearQueryClient();
    await getQueryClient().fetchQuery({
      queryKey: ['profile'],
      queryFn: () => 'new',
    });
    jobs
      .splice(0)
      .reverse()
      .forEach(callback => callback());
    await _settle();
    expect(_disk.size).toBe(1);
    expect(JSON.parse([..._disk.values()][0]).state.data).toBe('new');
  } finally {
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
  }
});

test('清理时尚未结束的请求不能重新写入内存或磁盘', async () => {
  let finish;
  const request = getQueryClient()
    .fetchQuery({
      queryKey: ['profile'],
      queryFn: () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    })
    .catch(error => error);
  await _settle();
  clearQueryClient();
  finish('old');
  await request;
  await _settle();
  expect(getQueryClient().getQueryCache().getAll()).toHaveLength(0);
  expect(_disk.size).toBe(0);
});
