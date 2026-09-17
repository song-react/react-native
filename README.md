# @song-react/react-native

React Native 桥接库：扩展 `Image`、`Modal`、`Pressable`、`Text`、`TextInput`、`View`，
导出 `FlashList`、主题／屏幕 Hook 和 Provider，其余原生 API 透传。
接入与开发约束见 [AGENTS.md](./AGENTS.md)。

## 接入

建议宿主在 `tsconfig.json` 合并路径配置，并确保运行时解析也指向本库：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "react-native": ["./node_modules/@song-react/react-native"]
    }
  }
}
```

组件、Hook 和 Provider 统一从 `react-native` 导入。

## 主题与尺寸

应用入口、首次渲染前配置一次：

```ts
import { useColors, useScreen } from 'react-native';

const colors = {
  light: {
    background: '#ECF0FA', // 背景、分割线、输入框背景
    foreground: '#FFFFFF', // 模块、卡片
    empty: '#F1F5FF', // 留空区域、大背景
    fill: '#252E3A', // 文字、图标
    primary: '#0065FF', // 自定义业务色
  },
} as const;

declare global {
  interface SongReactNativeColors {
    colors: typeof colors;
  }
}

useColors.set(colors);
useScreen.set(375); // 默认375，可省略
```

`useColors()` 自动提示基础色和业务色，跟随 RN 原生主题，无需额外 Provider。
`light` 必填，`dark` 可选；每套主题必须包含上述四个基础色，缺少深色主题时回退浅色。
`useScreen()` 返回窗口尺寸、方向、断点和 `fix(size)` 缩放方法。
两种 `set` 都用于初始化，不主动触发重渲染。

组件常用扩展：

- `View` 默认透明，支持 `type='background'`／`'foreground'`。
- `TextInput` 支持 `prefix`、`suffix`；`containerProps.style` 控制容器，`style` 控制输入框。
- `Modal` 的 `slide` 默认底部，`fade` 默认居中；遮罩为两倍窗口高度，支持淡入及点击遮罩淡出。
- `Image` 支持 Expo Image 属性及 SVG 组件作为 `source`。

## Provider

`I18nProvider` 接收非空语言表和宿主管理的语言状态：

```tsx
<I18nProvider languages={languages} locale={locale} setLocale={setLocale}>
  {children}
</I18nProvider>
```

组件内使用 `useI18n()`，普通方法使用 `t()`；`locale` 为 `undefined` 时采用系统语言，
未匹配时回退语言表第一项。增加以下类型注册即可提示语言和翻译键：

```ts
declare global {
  interface SongReactNativeI18n {
    languages: typeof languages;
  }
}
```

`QueryProvider` 接收 `QueryClientConfig`，内部创建并复用实例，构造配置仅初始化时生效：

```tsx
<QueryProvider defaultOptions={{ queries: { staleTime: 30_000 } }}>
  {children}
</QueryProvider>
```

默认查询 `staleTime` 为开发10秒／生产1分钟，`gcTime` 为5分钟，`retry` 为 `false`，
传入的查询配置按字段覆盖默认值。默认无持久化，宿主通过 `defaultOptions.queries.persister` 提供。
`onQuery`／`onMutation` 仅通知错误事件，参数为官方事件和当前 client。
组件用 `@tanstack/react-query` 的 `useQueryClient()` 获取实例，普通方法由调用方传入 client。
