import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import {
  TextInput as _TextInput,
  type TextInputProps as _TextInputProps,
} from 'react-native/index.js';
import { View, type ViewProps } from './View';

export type TextInputProps = Omit<_TextInputProps, 'children'> & {
  containerProps?: ViewProps;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const TextInput = forwardRef<
  ComponentRef<typeof _TextInput>,
  TextInputProps
>(({ containerProps, prefix, suffix, style, ...props }, ref) => (
  <View
    {...containerProps}
    style={[
      {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
      },
      containerProps?.style,
    ]}>
    {prefix}
    <_TextInput
      ref={ref}
      style={[
        { flex: 1, minWidth: 0, paddingVertical: 0, fontSize: 16 },
        style,
      ]}
      {...props}
    />
    {suffix}
  </View>
));
