import { BlurView, type BlurViewProps } from 'expo-blur';
import { forwardRef, type ComponentRef } from 'react';
import {
  View as _View,
  type ViewProps as _ViewProps,
  type ViewStyle as _ViewStyle,
} from 'react-native/index.js';

export type ViewStyle = _ViewStyle;
export type ViewProps = _ViewProps | BlurViewProps;

export const View = forwardRef<ComponentRef<typeof _View>, ViewProps>(
  ({ style, ...props }, ref) => {
    const Component = 'intensity' in props ? BlurView : _View;
    return <Component ref={ref} style={style} {...props} />;
  }
);
