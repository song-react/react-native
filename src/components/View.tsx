import { BlurView, type BlurViewProps } from 'expo-blur';
import { forwardRef, type ComponentRef } from 'react';
import {
  View as NativeView,
  type ViewProps as NativeViewProps,
  type ViewStyle,
} from 'react-native';

export type { ViewStyle };
export type ViewProps = NativeViewProps | BlurViewProps;

export const View = forwardRef<ComponentRef<typeof NativeView>, ViewProps>(
  ({ style, ...props }, ref) => {
    const Component = 'intensity' in props ? BlurView : NativeView;
    return <Component ref={ref} style={style} {...props} />;
  }
);
