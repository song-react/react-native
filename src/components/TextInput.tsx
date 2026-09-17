import { ComponentRef, ForwardedRef, forwardRef } from 'react';
import {
  TextInput as _TextInput,
  type TextInputProps as _TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native/index.js';
import { useScreen } from '../hooks/use-screen';
import { useColors } from '../providers/ColorsProvider';
import { View, ViewProps } from './View';

export type TextInputProps = Omit<_TextInputProps, 'children'> & {
  containerProps?: ViewProps;
  contentStyle?: StyleProp<ViewStyle>;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

const TextInputImp = (
  {
    containerProps,
    contentStyle,
    prefix,
    suffix,
    onFocus,
    onBlur,
    style,
    onChangeText,
    ...props
  }: TextInputProps,
  ref: ForwardedRef<ComponentRef<typeof _TextInput>>
) => {
  const colors = useColors();
  const { fix } = useScreen();
  const borderRadius = fix(8);

  return (
    <View
      {...containerProps}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.background,
          borderRadius,
          paddingHorizontal: borderRadius * 2,
          columnGap: 8,
          opacity: props.editable === false ? 0.6 : 1,
        },
        {
          borderWidth: 1,
          borderColor: 'transparent',
        },
        contentStyle,
        containerProps?.style,
      ]}>
      {prefix}
      <_TextInput
        style={[
          {
            flex: 1, // 相对前面的 prefix 和后面的 suffix 来说，这个输入框是可伸缩的, 并且避免内容过长让外层超出容器
            paddingVertical: borderRadius * 1.8,
          },
          {
            fontSize: fix(16),
            color: colors.fill,
            fontWeight: 400,
          },
          style,
        ]}
        allowFontScaling={false}
        placeholderTextColor={colors.fill}
        ref={ref}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
      {suffix}
    </View>
  );
};

export const TextInput = forwardRef(TextInputImp);
