import { forwardRef, type ComponentRef } from 'react';
import {
  Pressable as NativePressable,
  type PressableProps as NativePressableProps,
} from 'react-native';

export type PressableProps = NativePressableProps;

export const Pressable = forwardRef<ComponentRef<typeof NativePressable>, PressableProps>(
  ({ style, disabled, ...props }, ref) => (
    <NativePressable
      ref={ref}
      disabled={disabled}
      style={
        typeof style === 'function'
          ? (state) => [disabled ? { opacity: 0.5 } : undefined, style(state)]
          : [disabled ? { opacity: 0.5 } : undefined, style]
      }
      {...props}
    />
  )
);
