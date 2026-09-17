import { ComponentRef, ForwardedRef, forwardRef, useEffect } from 'react';
import {
  Modal as _Modal,
  Animated,
  StyleProp,
  useAnimatedValue,
  ViewStyle,
  type ModalProps as _ModalProps,
} from 'react-native/index.js';
import { useColors } from '../hooks/use-colors';
import { useScreen } from '../hooks/use-screen';
import { Pressable } from './Pressable';
import { View } from './View';

export type ModalProps = Omit<_ModalProps, 'backdropColor'> & {
  containerStyle?: StyleProp<ViewStyle>;
};

const _ModalImp = function ModalImp(
  {
    containerStyle,
    children,
    animationType,
    onRequestClose,
    visible = true,
    ...props
  }: ModalProps,
  ref: ForwardedRef<ComponentRef<typeof _Modal>>
) {
  const colors = useColors();
  const { height, fix } = useScreen();
  const opacity = useAnimatedValue(0);

  useEffect(() => {
    opacity.setValue(0);
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    return () => opacity.stopAnimation();
  }, [opacity, visible]);

  return (
    <_Modal
      ref={ref}
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
      {...props}>
      {/* 背景：点击关闭 */}
      <Animated.View
        style={{
          position: 'absolute',
          width: '100%',
          height: height * 2,
          top: -height,
          opacity,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <Pressable
          onPress={
            onRequestClose
              ? e => {
                  Animated.timing(opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                  }).start(({ finished }) => {
                    if (finished) onRequestClose(e);
                  });
                }
              : undefined
          }
          style={{ flex: 1 }}
        />
      </Animated.View>
      {/* 内容：不在 Pressable 里，阻断冒泡 */}
      <View
        style={[
          {
            backgroundColor: colors.background,
            padding: fix(12),
            borderRadius: fix(10),
          },
          {
            position: 'absolute',
            maxHeight: '80%',
            ...(animationType !== 'slide'
              ? {
                  top: '50%',
                  left: '50%',
                  transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
                  width: 'auto',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 1,
                    height: 1,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 5,
                }
              : {
                  bottom: 0,
                  width: '100%',
                }),
          },
          containerStyle,
        ]}>
        {children}
      </View>
    </_Modal>
  );
};

export const Modal = forwardRef(_ModalImp);
