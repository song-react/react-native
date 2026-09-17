import { BlurView, type BlurViewProps } from 'expo-blur';
import { forwardRef, type ComponentRef } from 'react';
import {
  View as _View,
  type ViewProps as _ViewProps,
  type ViewStyle as _ViewStyle,
} from 'react-native/index.js';

import { useColors } from '../hooks/use-colors';

export type ViewStyle = _ViewStyle;
export type ViewProps = (_ViewProps | BlurViewProps) & {
  type?: 'default' | 'background' | 'foreground';
};

export const View = forwardRef<ComponentRef<typeof _View>, ViewProps>(
  ({ type = 'default', style, ...props }, ref) => {
    const colors = useColors();
    const Component = 'intensity' in props ? BlurView : _View;
    return (
      <Component
        ref={ref}
        style={[
          {
            backgroundColor: type === 'default' ? 'transparent' : colors[type],
          },
          style,
        ]}
        {...props}
      />
    );
  }
);
