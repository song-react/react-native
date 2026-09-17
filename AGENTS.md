# 接入与开发约束

配置与用法见 [README.md](./README.md)，以当前源码及导出为准。

- 宿主统一从 `react-native` 导入，类型与运行时均指向本库。
  **不能以 `react-native/index.js`、上游同名包或本地复制件绕过中转层。**
  原生输入框使用公开的 `NativeTextInput`；库内部的上游透传入口不属于宿主用法。
- 优先复用已有默认行为和官方能力，不增加空封装，不引入宿主业务逻辑。
  `TextInput` 不添加 `title`、`error`、`description` 等表单职责。
- 主题使用 RN 原生订阅，不增加重复的主题 Provider／状态；页面宽度由父子布局决定。
  保留显式样式、原生事件与 ref 语义；背景透明度不能改成整体 opacity，也不能假设颜色均为六位十六进制。
- Query client 由 Provider 持有，不增加全局客户端；持久化及会话清理由宿主负责。
  `client.clear()` 仅清理内存缓存，不能代替持久化清理。
- 组件使用 `_XxxImp` 实现和 `forwardRef` 导出；含 Hook 的实现采用具名函数表达式。
  公开 API 变更同步更新 `src/index.ts`、`src/index.js`、README 及相关类型／行为用例。
- 使用 Bun；源码修改后先执行 TypeScript Organize Imports，再执行 Prettier write/check，
  并通过相关类型、行为和 ESLint 检查。中文规范提交，按修改目的分开提交。
