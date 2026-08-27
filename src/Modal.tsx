import { forwardRef, type ComponentRef } from 'react';
import {
  Modal as NativeModal,
  Pressable as NativePressable,
  type ModalProps as NativeModalProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { View } from './View';

export type ModalProps = Omit<NativeModalProps, 'backdropColor'> & {
  containerStyle?: StyleProp<ViewStyle>;
};

export const Modal = forwardRef<ComponentRef<typeof NativeModal>, ModalProps>(
  (
    { children, containerStyle, animationType = 'fade', onRequestClose, ...props },
    ref
  ) => (
    <NativeModal
      ref={ref}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      {...props}
    >
      <View
        style={{
          flex: 1,
          justifyContent: animationType === 'slide' ? 'flex-end' : 'center',
          alignItems: 'center',
          paddingHorizontal: animationType === 'slide' ? 0 : 12,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <NativePressable
          onPress={onRequestClose}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View
          style={[
            {
              width: animationType === 'slide' ? '100%' : 'auto',
              maxWidth: '100%',
              maxHeight: '80%',
              padding: 12,
              borderRadius: 10,
            },
            containerStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </NativeModal>
  )
);
