import type { ComponentProps } from 'react';
import {
  configureColors,
  ScrollView,
  TextInput,
  useColors,
  type BaseColors,
} from '../src';

const _colors = {
  light: {
    background: '#eee',
    foreground: '#fff',
    empty: '#f5f5f5',
    fill: '#111',
    primary: '#06f',
    gradient: { colors: ['#06f', '#0ff'] },
  },
  dark: {
    background: '#222',
    foreground: '#333',
    empty: '#000',
    fill: '#fff',
    primary: '#0ff',
    gradient: { colors: ['#0ff', '#06f'] },
  },
} as const;

declare global {
  interface SongReactNativeColors {
    colors: typeof _colors;
  }
}

export const useRegisteredColors = () => {
  const _palette = useColors();
  const _primary: '#06f' | '#0ff' = _palette.primary;
  const _gradient: readonly string[] = _palette.gradient.colors;
  // @ts-expect-error 未配置的业务色不能使用。
  void _palette.missing;
  // @ts-expect-error 基础色fill不能遗漏。
  const _incomplete: BaseColors = {
    background: '#eee',
    foreground: '#fff',
    empty: '#eee',
  };
  // @ts-expect-error 标题等表单装饰不属于输入框。
  const _input: ComponentProps<typeof TextInput> = { title: '标题' };
  // @ts-expect-error 不接收额外表单子节点。
  const _children: ComponentProps<typeof TextInput> = { children: '描述' };
  // @ts-expect-error 入口配置必须与注册色板一致。
  configureColors({ light: {} });
  return { _primary, _gradient, _incomplete, _input, _children };
};

configureColors(_colors);

export const verifyScrollRef = (_ref: ScrollView) => _ref.scrollTo({ y: 100 });
