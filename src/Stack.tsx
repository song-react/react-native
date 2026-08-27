import { type ViewProps } from 'react-native';
import { Pressable, type PressableProps } from './Pressable';
import { View } from './View';

type StackProps = Omit<PressableProps, 'style'> & {
  alignment?: 'start' | 'center' | 'end';
  spacing?: number;
  style?: PressableProps['style'];
};

const alignments = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

export const Column = ({ alignment, spacing = 0, onPress, disabled, style, ...props }: StackProps) =>
  onPress ? (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={state => [
        { gap: spacing, alignItems: alignment ? alignments[alignment] : undefined },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    />
  ) : (
    <View
      style={[
        { gap: spacing, alignItems: alignment ? alignments[alignment] : undefined },
        style as ViewProps['style'],
      ]}
      {...props}
    />
  );

export const Row = ({ alignment, spacing = 0, onPress, disabled, style, ...props }: StackProps) =>
  onPress ? (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={state => [
        {
          flexDirection: 'row',
          gap: spacing,
          alignItems: alignment ? alignments[alignment] : undefined,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    />
  ) : (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: spacing,
          alignItems: alignment ? alignments[alignment] : undefined,
        },
        style as ViewProps['style'],
      ]}
      {...props}
    />
  );

export const Spacer = ({ flexible, size = 0 }: { flexible?: boolean; size?: number }) => (
  <View style={flexible ? { flex: 1 } : { width: size, height: size }} />
);
