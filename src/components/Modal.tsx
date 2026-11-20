import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
  type ForwardedRef,
} from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import { scheduleOnRN } from 'react-native-worklets';
import { type ModalProps as _ModalProps } from 'react-native/index.js';

import { useScreen } from '../hooks/use-screen';
import { Pressable } from './Pressable';
import { View } from './View';

const AnimatedView = Animated.createAnimatedComponent(View);

export type ModalProps = Pick<
  _ModalProps,
  | 'children'
  | 'visible'
  | 'animationType'
  | 'transparent'
  | 'backdropColor'
  | 'pointerEvents'
  | 'style'
  | 'onRequestClose'
  | 'onDismiss'
> & {
  containerStyle?: ComponentProps<typeof AnimatedView>['style'];
};

/** visible 控制进退场；退出动画结束后卸载内容。直接卸载组件会立即移除窗口覆盖层。 */
const _ModalImp = function ModalImp(
  {
    children,
    visible = true,
    animationType = 'fade',
    containerStyle,
    transparent = true,
    backdropColor = 'rgba(0, 0, 0, 0.5)',
    pointerEvents,
    style,
    onRequestClose,
    onDismiss,
  }: ModalProps,
  ref: ForwardedRef<ComponentRef<typeof AnimatedView>>
) {
  const { fix, height } = useScreen();
  const [mounted, setMounted] = useState(false);
  const requestedVisible = useRef(false);
  const progress = useSharedValue(0);
  const contentHeight = useSharedValue(height);
  const dismiss = useRef(onDismiss);
  // React 19.2 的 forwardRef 不会更新 Effect Event，退场回调显式读取最新值。
  useLayoutEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const onDismissed = () => {
      requestedVisible.current = false;
      setMounted(false);
      dismiss.current?.();
    };
    if (visible) requestedVisible.current = true;
    // 分次挂载保证父窗口先就绪，子窗口随后加入，嵌套层始终显示在父层上方。
    if (visible && !mounted) {
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }
    if (!mounted) {
      if (requestedVisible.current) onDismissed();
      return;
    }
    let cancelled = false;
    const complete = () => {
      if (!cancelled) onDismissed();
    };
    progress.set(
      withTiming(
        visible ? 1 : 0,
        {
          duration: { none: 0, slide: 300, fade: visible ? 200 : 160 }[
            animationType
          ],
          easing: Easing.bezier(0.23, 1, 0.32, 1),
        },
        finished => {
          if (finished && !visible) scheduleOnRN(complete);
        }
      )
    );
    return () => {
      cancelled = true;
      cancelAnimation(progress);
    };
  }, [visible, mounted, progress, animationType]);

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: !transparent
      ? '#FFFFFF'
      : animationType !== 'none' && typeof backdropColor === 'string'
        ? interpolateColor(
            progress.get(),
            [0, 1],
            ['transparent', backdropColor]
          )
        : backdropColor,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: animationType === 'fade' ? progress.get() : 1,
    transform: [
      {
        translateY:
          animationType === 'slide'
            ? contentHeight.get() * (1 - progress.get())
            : 0,
      },
    ],
  }));

  if (!mounted) return null;
  const boxOnly = pointerEvents === 'box-only';
  return (
    <FullWindowOverlay>
      <AnimatedView
        ref={ref}
        collapsable={false}
        pointerEvents={visible ? (boxOnly ? 'auto' : pointerEvents) : 'none'}
        style={[{ flex: 1 }, backdropStyle, style]}>
        {visible &&
        pointerEvents !== 'box-none' &&
        pointerEvents !== 'none' &&
        onRequestClose ? (
          <Pressable
            onPress={onRequestClose}
            style={{ position: 'absolute', inset: 0 }}
          />
        ) : null}
        <AnimatedView
          pointerEvents={boxOnly ? 'none' : 'box-none'}
          style={[
            {
              flex: 1,
              justifyContent: animationType === 'slide' ? 'flex-end' : 'center',
              alignItems: 'center',
              paddingHorizontal: animationType === 'slide' ? 0 : fix(12),
            },
            contentStyle,
          ]}>
          <AnimatedView
            onLayout={event =>
              contentHeight.set(event.nativeEvent.layout.height)
            }
            style={[
              {
                width: animationType === 'slide' ? '100%' : 'auto',
                maxWidth: '100%',
                maxHeight: '80%',
                padding: fix(12),
                borderRadius: fix(10),
              },
              containerStyle,
            ]}>
            {children}
          </AnimatedView>
        </AnimatedView>
      </AnimatedView>
    </FullWindowOverlay>
  );
};

export const Modal = forwardRef(_ModalImp);
