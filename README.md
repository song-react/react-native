# @song-react/react-native-basic

一组面向 Expo/React Native 的轻量基础组件。组件不依赖业务主题，不缩放设计尺寸，只提供根属性透传、默认样式与外部样式合并；颜色和具体尺寸由业务工程覆盖。

```tsx
import { Button, Text, TextInput, View } from '@song-react/react-native-basic';

<View style={{ gap: 12 }}>
  <Text style={{ color: '#252E3A' }}>金额</Text>
  <TextInput contentStyle={{ backgroundColor: '#fff' }} />
  <Button text='确认' style={{ backgroundColor: '#0065FF' }} />
</View>;
```

导出：`Button`、`Image`、`Modal`、`Pressable`、`SafeAreaView`、`ScrollView`、`Text`、`TextInput`、`Video`、`View`，以及轻量的 `Row`、`Column`、`Spacer`。
