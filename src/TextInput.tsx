import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import {
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type ViewStyle,
} from 'react-native';
import { Text, type TextProps } from './Text';
import { View, type ViewProps } from './View';

export type TextInputProps = NativeTextInputProps & {
  containerProps?: ViewProps;
  contentStyle?: StyleProp<ViewStyle>;
  title?: string;
  tips?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  children?: ReactNode;
  titleStyle?: TextProps['style'];
  tipsStyle?: TextProps['style'];
  errorStyle?: TextProps['style'];
};

export const TextInput = forwardRef<ComponentRef<typeof NativeTextInput>, TextInputProps>(
  (
    {
      containerProps,
      contentStyle,
      title,
      tips,
      error,
      prefix,
      suffix,
      children,
      titleStyle,
      tipsStyle,
      errorStyle,
      onFocus,
      onBlur,
      style,
      onChangeText,
      ...props
    },
    ref
  ) => {
    const input = useRef<NativeTextInput>(null);
    const initialised = useRef(false);
    useImperativeHandle(ref, () => input.current as NativeTextInput);

    return (
      <View {...containerProps} style={[{ gap: 6 }, containerProps?.style]}>
        {title ? <Text style={[{ fontSize: 14 }, titleStyle]}>{title}</Text> : null}
        <View
          style={[
            {
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
            },
            contentStyle,
          ]}>
          {prefix}
          <NativeTextInput
            ref={input}
            style={[{ flex: 1, minWidth: 0, paddingVertical: 0, fontSize: 16 }, style]}
            onChangeText={value => {
              if (!initialised.current && value.trim()) {
                initialised.current = true;
                input.current?.setNativeProps({ text: value });
              }
              onChangeText?.(value);
            }}
            onFocus={event => {
              onFocus?.(event);
            }}
            onBlur={event => {
              onBlur?.(event);
            }}
            {...props}
          />
          {suffix}
        </View>
        {tips ? <Text style={[{ fontSize: 12 }, tipsStyle]}>{tips}</Text> : null}
        {error ? <Text style={[{ fontSize: 12 }, errorStyle]}>{error}</Text> : null}
        {children}
      </View>
    );
  }
);
