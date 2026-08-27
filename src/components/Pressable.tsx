import { forwardRef, type ComponentRef } from 'react';
import {
  Pressable as _Pressable,
  type PressableProps as _PressableProps,
} from 'react-native/index.js';

export type PressableProps = _PressableProps;

export const Pressable = forwardRef<
  ComponentRef<typeof _Pressable>,
  PressableProps
>(({ style, disabled, ...props }, ref) => (
  <_Pressable
    ref={ref}
    disabled={disabled}
    style={
      typeof style === 'function'
        ? state => [disabled ? { opacity: 0.5 } : undefined, style(state)]
        : [disabled ? { opacity: 0.5 } : undefined, style]
    }
    {...props}
  />
));
