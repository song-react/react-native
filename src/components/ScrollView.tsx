import { forwardRef, type ComponentRef } from 'react';
import {
  ScrollView as _ScrollView,
  type ScrollViewProps as _ScrollViewProps,
} from 'react-native/index.js';

export type ScrollViewProps = _ScrollViewProps;

export const ScrollView = forwardRef<
  ComponentRef<typeof _ScrollView>,
  ScrollViewProps
>(({ style, ...props }, ref) => (
  <_ScrollView ref={ref} style={style} {...props} />
));
