/// <reference path="./react-native-index.d.ts" />

export { FlashList } from '@song-react/flash-list';
export type { FlashListProps, FlashListRef } from '@song-react/flash-list';
export * from 'react-native/index.js';

export { TextInput as NativeTextInput } from 'react-native/index.js';
export type { TextInputProps as NativeTextInputProps } from 'react-native/index.js';
export { Image } from './components/Image';
export type { ImageProps as EnhancedImageProps } from './components/Image';
export { Modal } from './components/Modal';
export { Pressable } from './components/Pressable';
export { Text } from './components/Text';
export { TextInput } from './components/TextInput';
export { View } from './components/View';
export * from './providers/I18nProvider';
export * from './providers/QueryProvider';

export { ScrollView } from './components/ScrollView';
export { useScreen } from './hooks/use-screen';
export * from './providers/ColorsProvider';
