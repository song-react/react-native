import { createContext, useContext, type ReactNode } from 'react';
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

const _ColorsContext = createContext<{
  colors: BaseColors;
  colorScheme: 'light' | 'dark';
} | null>(null);

export function useColors(): Palette;
export function useColors<
  T extends readonly (readonly [ColorValue, ColorValue])[],
>(colors: T): { [K in keyof T]: ColorValue };
export function useColors(
  colors?: readonly (readonly [ColorValue, ColorValue])[]
) {
  const _context = useContext(_ColorsContext);
  if (!_context) throw new Error('缺少 ColorsProvider');
  return colors
    ? colors.map(_pair => _pair[_context.colorScheme === 'dark' ? 1 : 0])
    : (_context.colors as Palette);
}

export const ColorsProvider = ({
  children,
  colors,
  colorScheme,
}: {
  children: ReactNode;
  colors: ColorsMap;
  /** 不指定或传null时跟随系统；没有深色配置时使用浅色。 */
  colorScheme?: 'light' | 'dark' | null;
}) => {
  const _systemScheme = useColorScheme();
  const _colors: ThemeMap = colors;
  const _scheme =
    (colorScheme ?? _systemScheme) === 'dark' && _colors.dark
      ? 'dark'
      : 'light';
  return (
    <_ColorsContext.Provider
      value={{
        colors: _scheme === 'dark' ? _colors.dark! : _colors.light,
        colorScheme: _scheme,
      }}>
      {children}
    </_ColorsContext.Provider>
  );
};
