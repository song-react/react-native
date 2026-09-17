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
  // 宿主通过接口合并注册色板，与 I18n 的类型入口一致。
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

let _colors: ThemeMap | undefined;

/** 在应用入口、渲染组件前配置一次色板；主题切换使用原生 Appearance。 */
export const configureColors = (colors: ColorsMap) => {
  _colors = colors;
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
  if (!_colors) throw new Error('请先在应用入口调用 configureColors');
  return (_dark ? (_colors.dark ?? _colors.light) : _colors.light) as Palette;
}
