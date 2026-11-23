import { useColorScheme, type ColorValue } from 'react-native/index.js';

export type BaseColors = {
  /** 背景、分割线及输入框背景。 */
  background: ColorValue;
  /** 比背景突出的模块、卡片表面。 */
  foreground: ColorValue;
  /** 与前景对应的留空区域、大背景。 */
  empty: ColorValue;
  /** 文字、图标等内容填充色。 */
  fill: ColorValue;
};

declare global {
  // 宿主通过接口扩展色板类型，与 I18n 的类型入口一致。
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SongReactNativeColors {}
}

type ThemeMap = { light: BaseColors; dark?: BaseColors };
type ColorsMap = SongReactNativeColors extends {
  colors: infer Value extends ThemeMap;
}
  ? Value
  : ThemeMap;
type Palette = NonNullable<ColorsMap[keyof ColorsMap & keyof ThemeMap]>;

let _colors: ThemeMap = {
  light: {
    background: '#F5F5F5',
    foreground: '#FFFFFF',
    empty: '#000000',
    fill: '#222629',
  },
  dark: {
    background: '#2A3139',
    foreground: '#222629',
    empty: '#F5F7FB',
    fill: '#DDE3EE',
  },
};

export function useColors(): Palette;
export function useColors<
  T extends readonly (readonly [ColorValue, ColorValue])[],
>(colors: T): { [K in keyof T]: ColorValue };
export function useColors(
  colors?: readonly (readonly [ColorValue, ColorValue])[]
) {
  const _dark = useColorScheme() === 'dark';
  if (colors) return colors.map(_pair => _pair[_dark ? 1 : 0]);
  return (_dark ? (_colors.dark ?? _colors.light) : _colors.light) as Palette;
}

/** 可在渲染前整体替换默认色板；主题切换使用原生 Appearance。 */
useColors.set = (colors: ColorsMap) => {
  _colors = colors;
};
