import { forwardRef, type ComponentRef } from 'react';
import {
  ScrollView as NativeScrollView,
  type ScrollViewProps as NativeScrollViewProps,
} from 'react-native/index.js';

export type ScrollViewProps = NativeScrollViewProps;

export const ScrollView = forwardRef<
  ComponentRef<typeof NativeScrollView>,
  ScrollViewProps
>(({ style, ...props }, ref) => (
  <NativeScrollView ref={ref} style={style} {...props} />
));
