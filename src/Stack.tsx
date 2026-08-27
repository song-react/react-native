import { forwardRef, type ComponentRef } from 'react';
import { type ViewProps } from 'react-native';
import { Pressable, type PressableProps } from './Pressable';
import { View } from './View';

type StackProps = ViewProps & {
  alignment?: 'start' | 'center' | 'end';
  spacing?: number;
  onPress?: PressableProps['onPress'];
};

const alignments = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

export const Column = forwardRef<ComponentRef<typeof View>, StackProps>(
  ({ alignment, spacing = 0, onPress, style, ...props }, ref) => {
    const Component = onPress ? Pressable : View;
    return (
      <Component
        ref={ref}
        onPress={onPress}
        style={[{ gap: spacing, alignItems: alignment ? alignments[alignment] : undefined }, style]}
        {...props}
      />
    );
  }
);

export const Row = forwardRef<ComponentRef<typeof View>, StackProps>(
  ({ alignment, spacing = 0, onPress, style, ...props }, ref) => {
    const Component = onPress ? Pressable : View;
    return (
      <Component
        ref={ref}
        onPress={onPress}
        style={[
          {
            flexDirection: 'row',
            gap: spacing,
            alignItems: alignment ? alignments[alignment] : undefined,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

export const Spacer = ({ flexible, size = 0 }: { flexible?: boolean; size?: number }) => (
  <View style={flexible ? { flex: 1 } : { width: size, height: size }} />
);
