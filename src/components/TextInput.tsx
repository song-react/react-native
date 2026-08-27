import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
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
>(
  (
    {
      containerProps,
      prefix,
      suffix,
      style,
      onChangeText,
      ...props
    },
    ref
  ) => {
    const input = useRef<_TextInput>(null);
    const initialised = useRef(false);
    useImperativeHandle(ref, () => input.current as _TextInput);

    return (
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
        ]}
      >
        {prefix}
        <_TextInput
          ref={input}
          style={[
            { flex: 1, minWidth: 0, paddingVertical: 0, fontSize: 16 },
            style,
          ]}
          onChangeText={value => {
            if (!initialised.current && value.trim()) {
              initialised.current = true;
              input.current?.setNativeProps({ text: value });
            }
            onChangeText?.(value);
          }}
          {...props}
        />
        {suffix}
      </View>
    );
  }
);
