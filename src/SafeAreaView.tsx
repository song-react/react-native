import { forwardRef, type ComponentRef } from 'react';
import {
  SafeAreaView as NativeSafeAreaView,
  type SafeAreaViewProps as NativeSafeAreaViewProps,
} from 'react-native-safe-area-context';

export type SafeAreaViewProps = NativeSafeAreaViewProps;

export const SafeAreaView = forwardRef<
  ComponentRef<typeof NativeSafeAreaView>,
  SafeAreaViewProps
>(({ style, ...props }, ref) => <NativeSafeAreaView ref={ref} style={style} {...props} />);
