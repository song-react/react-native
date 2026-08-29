const Native = require('react-native/index.js');

const nativeDescriptors = Object.getOwnPropertyDescriptors(Native);
for (const name of [
  'Image',
  'Modal',
  'Pressable',
  'ScrollView',
  'Text',
  'TextInput',
  'View',
])
  delete nativeDescriptors[name];
Object.defineProperties(module.exports, nativeDescriptors);

const lazy = (name, load) =>
  Object.defineProperty(module.exports, name, {
    configurable: true,
    enumerable: true,
    get() {
      const value = load();
      Object.defineProperty(module.exports, name, {
        configurable: true,
        enumerable: true,
        value,
      });
      return value;
    },
  });

lazy('FlashList', () => require('@song-react/flash-list').FlashList);
lazy('Image', () => require('./components/Image').Image);
lazy('Modal', () => require('./components/Modal').Modal);
lazy('Pressable', () => require('./components/Pressable').Pressable);
lazy('ScrollView', () => require('./components/ScrollView').ScrollView);
lazy('Text', () => require('./components/Text').Text);
lazy('TextInput', () => require('./components/TextInput').TextInput);
lazy('View', () => require('./components/View').View);
lazy('NativeTextInput', () => Native.TextInput);
lazy('I18nProvider', () => require('./providers/I18nProvider').I18nProvider);
lazy('useI18n', () => require('./providers/I18nProvider').useI18n);
lazy('t', () => require('./providers/I18nProvider').t);
lazy('QueryProvider', () => require('./providers/QueryProvider').QueryProvider);
lazy('getQueryClient', () =>
  require('./providers/QueryProvider').getQueryClient
);
