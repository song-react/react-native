import { forwardRef, type ComponentRef } from 'react';
import {
  Modal as _Modal,
  Pressable as _Pressable,
  type ModalProps as _ModalProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native/index.js';
import { View } from './View';

export type ModalProps = Omit<_ModalProps, 'backdropColor'> & {
  containerStyle?: StyleProp<ViewStyle>;
};

export const Modal = forwardRef<ComponentRef<typeof _Modal>, ModalProps>(
  (
    {
      children,
      containerStyle,
      animationType = 'fade',
      onRequestClose,
      ...props
    },
    ref
  ) => (
    <_Modal
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
        <_Pressable
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
    </_Modal>
  )
);
