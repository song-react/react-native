import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, type ComponentProps, type ComponentRef } from 'react';
import { Pressable, type PressableProps } from './Pressable';
import { Text, type TextProps } from './Text';

export type ButtonProps = PressableProps & {
  text?: string;
  textProps?: TextProps;
  iconProps?: ComponentProps<typeof Ionicons>;
};

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      text,
      textProps: { style: textStyle, ...textProps } = {},
      iconProps,
      style,
      children,
      ...props
    },
    ref
  ) => (
    <Pressable
      ref={ref}
      style={state => [
        {
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingHorizontal: 12,
          borderRadius: 6,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      {state => (
        <>
          {typeof children === 'function' ? children(state) : children}
          {iconProps ? <Ionicons size={14} {...iconProps} /> : null}
          {text ? (
            <Text style={[{ textAlign: 'center' }, textStyle]} {...textProps}>
              {text}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  )
);
