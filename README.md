[AGENTS.md](./AGENTS.md)

`Modal` 使用 iOS `FullWindowOverlay` 承载，依赖 React 19.2+、Reanimated、Worklets 和 Screens；原生包版本由宿主按 Expo SDK 配套安装。

用 `visible` 控制显隐，`onRequestClose` 通知宿主关闭，`onDismiss` 在退场完成后触发。`style` 作用于全屏背景，`containerStyle` 作用于内容，`ref` 指向全屏 View。支持 `fade`、`slide`、`none`；不透传原生 Modal 专属属性，也不负责父子关闭、页面方向或业务状态。
