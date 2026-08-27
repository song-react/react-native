import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Pressable, type PressableProps } from './Pressable';
import { Text, type TextProps } from './Text';

export type ButtonProps = PressableProps & {
  text?: string;
  textProps?: TextProps;
  icon?: ReactNode;
};

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      text,
      textProps: { style: textStyle, ...textProps } = {},
      icon,
      style,
      children,
      ...props
    },
    ref
  ) => (
    <Pressable
      ref={ref}
      style={state => {
        const externalStyle = typeof style === 'function' ? style(state) : style;
        const borderRadius = StyleSheet.flatten(externalStyle)?.borderRadius ?? 6;
        return [
          {
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            paddingVertical: borderRadius * 2,
            paddingHorizontal: borderRadius * 2,
            borderRadius,
          },
          externalStyle,
        ];
      }}
      {...props}>
      {state => (
        <>
          {typeof children === 'function' ? children(state) : children}
          {icon}
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
