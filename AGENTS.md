# React Native 组件增强与接入

- 该库是 React Native 桥接库增强：扩展 `Image`、`Modal`、`Pressable`、`Text`、`TextInput`、`View`，
  导出 `FlashList`、主题／屏幕 Hook 和 Provider，其余原生 API 透传。
- 建议宿主在 `tsconfig.json` 合并路径配置，并确保运行时解析也指向本库， 宿主统一从 `react-native` 导入，类型与运行时均指向本库。

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

- 不要以 `react-native/index.js`、上游同名包或本地复制件绕过中转层。
