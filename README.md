# @song-react/react-native-basic

一组面向 Expo/React Native 的轻量基础组件。组件不依赖业务主题，不缩放设计尺寸，只提供根属性透传、默认样式与外部样式合并；颜色和具体尺寸由业务工程覆盖。

```tsx
import { FlashList, Pressable, Text, TextInput, View } from '@song-react/react-native-basic';

<View style={{ gap: 12 }}>
  <Text style={{ color: '#252E3A' }}>金额</Text>
  <TextInput contentStyle={{ backgroundColor: '#fff' }} />
  <Pressable style={{ backgroundColor: '#0065FF' }}>
    <Text style={{ color: '#fff' }}>确认</Text>
  </Pressable>
</View>;
```

导出：`Image`、`Modal`、`Pressable`、`ScrollView`、`Text`、`TextInput`、`View`，以及轻量的 `Row`、`Column`、`Spacer`。

同时直接导出固定为 2.3.2 的 `FlashList` 修正版。实际实现来自
[`@song-react/flash-list`](https://github.com/song-react/flash-list)，无需宿主工程配置
`patch-package`；`patches/@shopify+flash-list+2.3.2.patch` 仅保留为修正来源记录。

`I18nProvider` 接收与 `languages.json` 相同的语言表，以及由宿主保存的语言状态：

```tsx
<I18nProvider
  languages={languages}
  language={language}
  setLanguage={setLanguage}
  defaultLanguage="zh-Hans"
>
  {children}
</I18nProvider>
```

组件内使用 `useI18n()` 获取 `language`、当前生效的 `locale`、`setLanguage` 和 `t`；非
Hook 代码可直接使用全局 `t()`。语言未指定时自动匹配系统语言，找不到时使用
`defaultLanguage` 或语言表第一项。

`QueryProvider` 内置与 `xz_rn` 一致的 `QueryClient`：开发环境 10 秒、生产环境 1 分钟
过期，5 分钟回收内存，关闭自动重试，并使用 MMKV 按 query 独立持久化 7 天。需要在
React 组件外操作缓存时使用同包导出的 `getQueryClient()`。
