# @song-react/react-native

React Native 的透明增强入口：完整导出原生能力，并以无业务主题的增强版 `Image`、
`Modal`、`Pressable`、`ScrollView`、`Text`、`TextInput`、`View` 覆盖同名导出。
组件不缩放设计尺寸，只提供根属性透传、默认样式与外部样式合并；颜色和具体尺寸由业务工程覆盖。

```tsx
import {
  FlashList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

<View style={{ gap: 12 }}>
  <Text style={{ color: '#252E3A' }}>金额</Text>
  <TextInput contentStyle={{ backgroundColor: '#fff' }} />
  <Pressable style={{ backgroundColor: '#0065FF' }}>
    <Text style={{ color: '#fff' }}>确认</Text>
  </Pressable>
</View>;
```

Expo 工程在 `tsconfig.json` 中将原生入口指向本包；Expo Metro 会读取同一别名，无需额外
修改 `metro.config.js`：

```json
{
  "compilerOptions": {
    "paths": {
      "react-native": ["./node_modules/@song-react/react-native"]
    }
  }
}
```

确实需要绕过增强版输入框时，从同一入口使用 `NativeTextInput`。

基础组件放在 `src/components/`，Provider 放在 `src/providers/`。导出与 `xz_rn`
基础层一致的 `Image`、`Modal`、`Pressable`、`ScrollView`、`Text`、`TextInput`、`View`；
不额外封装 Flex 布局组件。

同时直接导出固定为 2.3.2 的 `FlashList` 修正版。实际实现来自
[`@song-react/flash-list`](https://github.com/song-react/flash-list)，无需宿主工程配置
`patch-package`；`patches/@shopify+flash-list+2.3.2.patch` 仅保留为修正来源记录。

`I18nProvider` 接收非空 `languages.json`，语言键使用语言代码（如 `zh`、`en`、
`zh-Hant`），第一项作为系统语言不受支持时的兜底，以及由宿主保存的语言状态：

```tsx
<I18nProvider
  languages={languages}
  locale={locale}
  setLocale={setLocale}
>
  {children}
</I18nProvider>
```

组件内使用 `useI18n()` 获取当前生效的 `locale`、语言表键 `locales`、`setLocale` 和
`t`；非 Hook 代码可直接使用全局 `t()`。传入 Provider 的 `locale` 为 `undefined` 时
跟随系统语言；系统语言不在语言表内时使用第一项，调用 `setLocale(undefined)` 可恢复
跟随系统。

`QueryProvider` 内置与 `xz_rn` 一致的 `QueryClient`：开发环境 10 秒、生产环境 1 分钟
过期，5 分钟回收内存，关闭自动重试，并使用 MMKV 按 query 独立持久化 7 天。需要在
React 组件外操作缓存时使用同包导出的 `getQueryClient()`。可通过 `onQuery` 和
`onMutation` 分别接收全局查询、操作错误，由宿主决定日志、线路切换等业务处理。
