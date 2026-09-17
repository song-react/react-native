# @song-react/react-native

React Native 的透明增强入口：完整导出原生能力，并以增强版 `Image`、
`Modal`、`Pressable`、`Text`、`TextInput`、`View` 覆盖同名导出。
`ScrollView` 直接透传 React Native 原生组件及类型。
基础组件沿用 `xz_rn` 的默认布局、字体和尺寸规则；业务颜色由入口配置，显式样式始终优先。
在应用入口调用一次 `useColors.set(colors)`，不需要额外 Provider。

```tsx
import { useColors, Text, TextInput, View } from 'react-native';

export const colors = {
  light: {
    background: '#ECF0FA',
    foreground: '#FFFFFF',
    empty: '#F1F5FF',
    fill: '#252E3A',
    primary: '#0065FF',
  },
} as const;

declare global {
  interface SongReactNativeColors {
    colors: typeof colors;
  }
}

useColors.set(colors);

export default () => (
  <View type='foreground'>
    <Text>金额</Text>
    <TextInput placeholder='请输入金额' />
  </View>
);
```

颜色采用与 I18n 相同的“入口配置＋一次类型注册”：各处直接调用 `useColors()`，
自动提示注册色板中的业务色和渐变对象，无需每次传泛型。`light` 必填、`dark` 可选，
每套色板都必须含以下四个基本颜色（支持 React Native `ColorValue`）：

| 色名         | 用途                         |
| ------------ | ---------------------------- |
| `background` | 背景、分割线、输入框背景     |
| `foreground` | 模块、卡片等比背景突出的表面 |
| `empty`      | 留空区域和大背景，与前景对应 |
| `fill`       | 文字、图标等内容填充色       |

`useColors.set` 在模块初始化、渲染界面前调用，用于登记静态色板，调用本身不触发界面重渲染；主题状态完全使用
React Native 的 `useColorScheme()`／`Appearance`，不增加 Context 或独立主题状态。
系统变化会更新各处 `useColors()`；应用内切换使用 `Appearance.setColorScheme('dark')`
或 `'light'`，恢复跟随系统使用 `'unspecified'`。参见
[RN Appearance](https://reactnative.dev/docs/0.86/appearance)。

缺少 `dark` 时色板回退到 `light`；未知原生主题也使用浅色。各主题业务字段宜保持一致，
`useColors()` 返回主题色板的联合类型，避免误用某一主题没有的字段。
也支持 xz 的临时颜色对：`useColors([['white', 'black']] as const)`，直接按原生主题选择，
不依赖色板配置。之前的 `ColorsProvider` 已移除，入口改用 `useColors.set` 即可。

`useScreen()` 返回当前 `width`、`height`、`landscape`、`fix(size)` 和断点状态。
`fix(size) = size × (width / 375)^1.3`，随窗口尺寸变化更新；断点依次为
`xs=440`、`sm=667`、`md=774`、`lg=1133`、`xl=1280`、`xxl=1536`。
组件默认字号、输入框间距和弹窗间距使用该缩放；调用方显式尺寸不二次缩放，页面整体宽度仍采用父子布局。

`View` 支持 `type='background'`／`'foreground'`，默认透明。
`Text` 默认使用 `fill`、PingFang SC，并关闭系统字号缩放，保留链接／提及／自定义解析。
`TextInput` 保留 `prefix`、`suffix`、`containerProps` 及原生事件／ref；
不含标题、描述、错误提示或额外表单内容，交由业务表单组合。输入文字不会被组件二次写回。
输入框禁用时使用 RN 的 `processColor` 解析普通颜色，将背景原有 alpha 乘以 `160/255`，
支持 `#RGB`、`#RRGGBB`、带 alpha 的十六进制、`rgb/rgba`、`hsl/hsla`、`hwb`、命名色及透明色。
文字及前后缀不随容器变淡，显式背景样式仍然优先。`PlatformColor` 等原生颜色对象保留原样透传，
不在 JS 中修改其 alpha，也不强行转成字符串。
`Modal` 沿用原生 `animationType`：`slide` 默认底部，`fade` 默认居中；遮罩高度为窗口两倍，
向上延伸一个窗口高度，淡入和点击遮罩淡出均为 150ms，淡出完成后调用 `onRequestClose`。
`Image` 保留 SVG 组件直传、位图加载后宽高比测量和缓存清理方法，根 `width`／`height` 进入位图布局。

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
基础层对应的 `Image`、`Modal`、`Pressable`、`Text`、`TextInput`、`View`；
不额外封装 Flex 布局组件。

同时直接导出固定为 2.3.2 的 `FlashList` 修正版。实际实现来自
[`@song-react/flash-list`](https://github.com/song-react/flash-list)，无需宿主工程配置
`patch-package`；`patches/@shopify+flash-list+2.3.2.patch` 仅保留为修正来源记录。

`I18nProvider` 接收非空 `languages.json`，语言键使用语言代码（如 `zh`、`en`、
`zh-Hant`），第一项作为系统语言不受支持时的兜底，以及由宿主保存的语言状态：

```tsx
<I18nProvider languages={languages} locale={locale} setLocale={setLocale}>
  {children}
</I18nProvider>
```

组件内使用 `useI18n()` 获取当前生效的 `locale`、语言表键 `locales`、`setLocale` 和
`t`；非 Hook 代码可直接使用全局 `t()`。传入 Provider 的 `locale` 为 `undefined` 时
跟随系统语言；系统语言不在语言表内时使用第一项，调用 `setLocale(undefined)` 可恢复
跟随系统。

宿主增加一次类型注册后，`locale` 会限制为语言表一级 key，`t()` 的首参会限制为所有
语言共同拥有的二级 key：

```ts
import languages from '@/assets/languages.json';

declare global {
  interface SongReactNativeI18n {
    languages: typeof languages;
  }
}
```

`QueryProvider` 内置与 `xz_rn` 一致的 `QueryClient`：开发环境 10 秒、生产环境 1 分钟
过期，5 分钟回收内存，关闭自动重试，并使用 MMKV 按 query 独立持久化 7 天。需要在
React 组件外操作缓存时使用同包导出的 `getQueryClient()`。可通过 `onQuery` 和
`onMutation` 分别接收全局查询、操作错误，由宿主决定日志、线路切换等业务处理。

退出登录或切换账号时调用 `clearQueryClient()`，同时清除查询、mutation 和磁盘缓存。
清理前未完成的请求及排队的持久化任务不会写回旧缓存；当前 `QueryClient` 实例继续复用。
页面内的表单、弹窗等本地状态由宿主通过会话边界重置。
