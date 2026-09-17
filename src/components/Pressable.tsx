import { forwardRef, type ComponentRef, type ForwardedRef } from 'react';
import {
  Pressable as _Pressable,
  type PressableProps as _PressableProps,
} from 'react-native/index.js';

export type PressableProps = _PressableProps;

const PressableImp = (
  { style, disabled, ...props }: PressableProps,
  ref: ForwardedRef<ComponentRef<typeof _Pressable>>
) => (
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
);

export const Pressable = forwardRef(PressableImp);
