import { forwardRef, type ComponentRef } from 'react';
import {
  ScrollView as _ScrollView,
  type ScrollViewProps as _ScrollViewProps,
} from 'react-native/index.js';
import { useColors } from '../providers/ColorsProvider';

export type ScrollViewProps = _ScrollViewProps & {
  type?: 'default' | 'background' | 'foreground';
};

// 保留原生同名实例类型，兼容 useRef<ScrollView>。
export type ScrollView = ComponentRef<typeof _ScrollView>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ScrollView = forwardRef<
  ComponentRef<typeof _ScrollView>,
  ScrollViewProps
>(({ type = 'default', style, ...props }, ref) => {
  const colors = useColors();
  return (
    <_ScrollView
      ref={ref}
      style={[
        { backgroundColor: type === 'default' ? 'transparent' : colors[type] },
        style,
      ]}
      {...props}
    />
  );
});
