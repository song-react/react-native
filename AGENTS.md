# @song-react/react-native 接入与开发约束

本库是 React Native 的桥接入口。宿主使用同一个入口取得增强组件和上游透传能力；
完整示例见 [README.md](./README.md)。

## 宿主导入与路径

建议在宿主 `tsconfig.json` 合并以下配置，保留宿主已有的其它路径：

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

配置后，宿主统一使用 `import { xxx } from 'react-native'`，使类型检查和运行时解析
优先进入本桥接工程。Expo Metro 使用工程的 tsconfig 路径别名；其它构建工具需核对
对应的运行时别名，不能只配置 TypeScript 类型解析。

**宿主不能以 `react-native/index.js`、上游同名包或本地复制件绕过中转层。**
确需使用未增强的输入框时，使用本入口公开的 `NativeTextInput`。
桥接库内部为透传上游 API、避免自身循环引用而使用的原生入口属于实现细节，
不能作为宿主绕过桥接层的依据。

## 基本用法

- `Image`、`Modal`、`Pressable`、`Text`、`TextInput`、`View` 是增强组件；
  `ScrollView` 及其类型直接透传原生实现，不另建空封装。
- `View` 默认透明，支持 `type='background'` 和 `type='foreground'`。
  `TextInput` 用 `prefix`／`suffix` 组合内容，`containerProps.style` 控制容器，
  `style` 控制输入内容；不添加 `title`、`error`、`description`、`contentStyle`。
- `Modal` 的 `slide` 默认底部，`fade` 默认居中；保留两倍窗口高度遮罩和淡入淡出。
  `Image` 支持 SVG 组件作为 source、位图加载后的比例测量和缓存清理方法。
- 颜色在入口、首次渲染前 `useColors.set(colors)`；每套主题必须有
  `background`、`foreground`、`empty`、`fill`，`light` 必填、`dark` 可选。
  合并一次 `SongReactNativeColors` 接口后，`useColors()` 自动推断业务颜色。
  主题订阅使用 RN 自带的 `useColorScheme`，不加 ColorsProvider 或重复主题状态。
- `useScreen.set(375)` 在入口配置尺寸缩放基准，默认375；只接受正有限数值。
  `useScreen()` 提供真实尺寸、方向、断点和 `fix(size)`。设置基准与色板均不主动触发重渲染。
  页面整体仍采用相对布局，不能把设计画板宽度固定成页面宽度。
- `I18nProvider` 接收非空 `languages`、`locale`、`setLocale`，通过一次
  `SongReactNativeI18n` 类型注册提示语言和翻译键；组件用 `useI18n()`，普通方法用 `t()`。

## 查询客户端

- `QueryProvider` 直接接收官方 `QueryClientConfig`，内部创建独立且在挂载期间稳定的实例。
  默认开发环境 staleTime 为10秒、生产环境1分钟，gcTime 为5分钟，retry 为 false。
  `defaultOptions.queries` 按字段合并；自定义 queryCache、mutationCache 和 mutation 默认值透传。
- 构造配置仅首次创建时生效。修改 `key` 或重新挂载会创建新实例；
  使用 Suspense 时将边界放在 Provider 内部。
- 默认没有 persister。持久化由宿主通过 `defaultOptions.queries.persister` 提供；
  库不依赖 MMKV、Expo FileSystem、query-persist-client-core，不预设磁盘位置或清理策略。
- 组件／自定义 Hook 从 `@tanstack/react-query` 使用 `useQueryClient()`；
  普通方法显式接收 `QueryClient`，由调用方传入。不恢复全局 getQueryClient 或全局客户端引用。
- onQuery／onMutation 只通知对应缓存的错误事件，参数是完整事件和所属 client。
  读取错误前先收窄 event.type／event.action.type，再使用 event.action.error。
- `client.clear()` 清理内存查询和 mutation。宿主启用持久化时，负责会话切换的磁盘清理、
  旧请求防回写和页面本地状态重置；不能将内存清理等同于磁盘清理。

## 修改库时

- 保持接口和实现精简，优先使用已有组件、默认参数与官方能力，不复制宿主业务逻辑到库中。
- 基础组件使用独立 `_XxxImp` 实现和 `forwardRef` 导出；含 Hook 的实现采用
  具名函数表达式，使静态规则可识别组件，不为命名关闭 Hook 检查。
- 增减公开 API 时同步检查 `src/index.ts` 的类型导出和 `src/index.js` 的运行时导出，
  避免类型存在但运行时缺失；同步更新 README、类型用例和相关行为测试。
- 保留调用方显式样式、原生事件和 ref 的语义。背景透明度不能通过整体 opacity 替代，
  也不能假设所有颜色都是六位十六进制字符串。
- 使用 Bun；修改源码后先执行 TypeScript Organize Imports，再执行项目 Prettier write/check，
  并通过相关类型、行为和 ESLint 检查。提交使用中文规范信息，按修改目的分开提交。
