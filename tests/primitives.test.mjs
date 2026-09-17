/* eslint-disable react-hooks/rules-of-hooks -- 使用受控 Hook 替身验证组件，不经过 React 渲染器。 */
import { beforeEach, expect, mock, test } from 'bun:test';
import * as React from 'react';

let _state;
let _height;
let _width;
let _scheme;
const _light = {
  background: '#eee',
  foreground: '#fff',
  empty: '#f5f5f5',
  fill: '#111',
  brand: 'blue',
};
const _dark = {
  background: '#222',
  foreground: '#333',
  empty: '#000',
  fill: '#fff',
  brand: 'cyan',
};
let _effect;
const _animations = [];
const _opacity = { setValue: mock(), stopAnimation: mock() };
const _flatten = _style =>
  Object.assign({}, ...[_style].flat(Infinity).filter(Boolean));
const _nativeImage = { getSize: mock() };
const _expoImage = Object.assign(() => null, {
  clearDiskCache: mock(),
  clearMemoryCache: mock(),
});
mock.module('react', () => ({
  ...React,
  useState: () => [
    _state,
    _next => {
      _state = _next;
    },
  ],
  useEffect: _callback => {
    _effect = _callback;
  },
}));
mock.module('react-native', () => ({}));
mock.module('react-native/index.js', () => ({
  View: 'native-view',
  ScrollView: 'native-scroll-view',
  useColorScheme: () => _scheme,
  Text: 'native-text',
  TextInput: 'native-input',
  Pressable: 'native-pressable',
  Modal: 'native-modal',
  Image: _nativeImage,
  Linking: { openURL: mock() },
  useWindowDimensions: () => ({ width: _width, height: _height }),
  useAnimatedValue: () => _opacity,
  Animated: {
    View: 'animated-view',
    timing: (_value, _options) => ({
      start: _complete =>
        _animations.push({ ..._options, complete: _complete }),
    }),
  },
}));
mock.module('expo-image', () => ({ Image: _expoImage }));
mock.module('expo-blur', () => ({ BlurView: 'blur-view' }));
const { useColors } = await import('../src/hooks/use-colors');
const { useScreen } = await import('../src/hooks/use-screen');
const { View } = await import('../src/components/View');
const { Image } = await import('../src/components/Image');
const { Modal } = await import('../src/components/Modal');
const { Text } = await import('../src/components/Text');
const { TextInput } = await import('../src/components/TextInput');

beforeEach(() => {
  _state = undefined;
  _height = 874;
  _width = 375;
  _scheme = 'light';
  useColors.set({ light: _light, dark: _dark });
  _effect = undefined;
  _animations.length = 0;
  _opacity.setValue.mockClear();
  _opacity.stopAnimation.mockClear();
});

test('位图根宽高进入原生布局，显式style仍可覆盖', () => {
  const _image = Image.render(
    { source: 1, width: 120, height: 80, style: { width: 150 } },
    null
  ).props.children;
  expect(_image.type).toBe(_expoImage);
  expect(_flatten(_image.props.style)).toMatchObject({
    width: 150,
    height: 80,
  });
  expect(Image.getSize).toBe(_nativeImage.getSize);
});

test('位图沿用onLoad测量与调用方回调，SVG维持直接传参', () => {
  const _onLoad = mock();
  const _props = {
    source: 'https://example.com/image.png',
    style: { width: 200 },
    onLoad: _onLoad,
  };
  const _event = { source: { width: 600, height: 300 } };
  Image.render(_props, null).props.children.props.onLoad(_event);
  expect(_onLoad).toHaveBeenCalledWith(_event);
  expect(
    _flatten(Image.render(_props, null).props.children.props.style).aspectRatio
  ).toBe(2);
  const _svg = () => null;
  const _element = Image.render(
    { source: _svg, width: 16, height: 20, color: 'red' },
    null
  );
  expect(_element.type).toBe(_svg);
  expect(_element.props).toMatchObject({ width: 16, height: 20, color: 'red' });
});

test('Text保留字体、关闭字体缩放和无解析时的原文', () => {
  const _element = Text.render(
    { children: '正文', style: { fontSize: 20 } },
    null
  );
  expect(_element.type).toBe('native-text');
  expect(_element.props.children).toBe('正文');
  expect(_element.props.allowFontScaling).toBe(false);
  expect(_flatten(_element.props.style)).toMatchObject({
    fontFamily: 'PingFang SC',
    fontSize: 20,
  });
});

test('Text同时保留链接、提及与自定义内容解析', () => {
  const _custom = mock(_name => _name);
  const _element = Text.render(
    {
      children: 'example.com @react [图片]',
      ctx: {
        link: { color: 'blue' },
        mention: { color: 'red' },
        custom: _custom,
      },
    },
    null
  );
  const _texts = _element.props.children
    .flat(Infinity)
    .filter(_item => _item?.type === 'native-text');
  expect(_texts.map(_item => _item.props.children)).toEqual([
    'example.com',
    '@react',
  ]);
  expect(_custom).toHaveBeenCalledWith('[图片]');
});

test('TextInput缺省contentStyle不崩溃，containerProps与两种样式透传', () => {
  const _layout = mock();
  const _element = TextInput.render(
    {
      containerProps: { onLayout: _layout, style: { height: 44 } },
      prefix: '前',
      suffix: '后',
    },
    null
  );
  expect(_element.props.onLayout).toBe(_layout);
  expect(_flatten(_element.props.style)).toMatchObject({ height: 44 });
  expect(_element.props.children[0]).toBe('前');
  expect(_element.props.children[2]).toBe('后');
  const _styled = TextInput.render(
    {
      contentStyle: [{ backgroundColor: 'white' }, false],
      containerProps: { style: { backgroundColor: 'blue' } },
    },
    null
  );
  expect(_flatten(_styled.props.style).backgroundColor).toBe('blue');
});

test('TextInput快速输入不二次写回原生文本，ref和焦点事件保持一致', () => {
  const _write = mock();
  const _ref = { current: { setNativeProps: _write } };
  const _change = mock();
  const _focus = mock();
  const _blur = mock();
  const _input = TextInput.render(
    { value: '', onChangeText: _change, onFocus: _focus, onBlur: _blur },
    _ref
  ).props.children[1];
  expect(_input.type).toBe('native-input');
  expect(_input.props.ref).toBe(_ref);
  for (const _value of ['r', 're', 'rea', 'reac', 'react', 'react3'])
    _input.props.onChangeText(_value);
  expect(_change.mock.calls.map(_call => _call[0])).toEqual([
    'r',
    're',
    'rea',
    'reac',
    'react',
    'react3',
  ]);
  expect(_write).not.toHaveBeenCalled();
  expect(_input.props.onFocus).toBe(_focus);
  expect(_input.props.onBlur).toBe(_blur);
});

test.each([640, 874])('slide全过程遮罩覆盖%i点窗口，内容默认置底', _size => {
  _height = _size;
  const _modal = Modal.render(
    { animationType: 'slide', children: '内容' },
    null
  );
  expect(_modal.type).toBe('native-modal');
  expect(_modal.props.visible).toBe(true);
  _effect();
  expect(_animations[0]).toMatchObject({
    toValue: 1,
    duration: 150,
    useNativeDriver: true,
  });
  const [_backdrop, _content] = _modal.props.children;
  for (const _offset of [0, _size / 2, _size]) {
    expect(_backdrop.props.style.top + _offset).toBeLessThanOrEqual(0);
    expect(
      _backdrop.props.style.top + _backdrop.props.style.height + _offset
    ).toBeGreaterThanOrEqual(_size);
  }
  expect(_flatten(_content.props.style)).toMatchObject({
    bottom: 0,
    width: '100%',
  });
});

test('fade默认居中，遮罩取消动画不关闭，淡出完成才关闭', () => {
  const _close = mock();
  const _dismiss = mock();
  const _modal = Modal.render(
    { animationType: 'fade', onRequestClose: _close, onDismiss: _dismiss },
    null
  );
  const [_backdrop, _content] = _modal.props.children;
  expect(_flatten(_content.props.style)).toMatchObject({
    top: '50%',
    left: '50%',
  });
  expect(_modal.props.onRequestClose).toBe(_close);
  expect(_modal.props.onDismiss).toBe(_dismiss);
  const _event = {};
  _backdrop.props.children.props.onPress(_event);
  expect(_close).not.toHaveBeenCalled();
  _animations.at(-1).complete({ finished: false });
  expect(_close).not.toHaveBeenCalled();
  _backdrop.props.children.props.onPress(_event);
  _animations.at(-1).complete({ finished: true });
  expect(_close).toHaveBeenCalledWith(_event);
  const _cleanup = _effect();
  _cleanup();
  expect(_opacity.stopAnimation).toHaveBeenCalledTimes(1);
});

test('不依赖Provider，原生主题变化后直接选择已配置色板', () => {
  expect(useColors()).toBe(_light);
  _scheme = 'dark';
  expect(useColors()).toBe(_dark);
  expect(
    useColors([
      ['white', 'black'],
      ['blue', 'cyan'],
    ])
  ).toEqual(['black', 'cyan']);
  _scheme = 'light';
  expect(useColors()).toBe(_light);
  for (const _value of [null, 'unspecified']) {
    _scheme = _value;
    expect(useColors()).toBe(_light);
  }
});

test('缺少深色色板时回退浅色，临时颜色对仍跟随原生主题', () => {
  useColors.set({ light: _light });
  _scheme = 'dark';
  expect(useColors()).toBe(_light);
  expect(useColors([['white', 'black']])).toEqual(['black']);
});

test('切换主题后基础组件使用当前颜色，调用方样式仍优先', () => {
  for (const _palette of [_light, _dark]) {
    _scheme = _palette === _dark ? 'dark' : 'light';
    expect(_flatten(Text.render({}, null).props.style).color).toBe(
      _palette.fill
    );
    const _input = TextInput.render({}, null);
    expect(_flatten(_input.props.style).backgroundColor).toBe(
      _palette.background
    );
    expect(_flatten(_input.props.children[1].props.style).color).toBe(
      _palette.fill
    );
    expect(
      _flatten(Modal.render({}, null).props.children[1].props.style)
        .backgroundColor
    ).toBe(_palette.background);
    expect(_flatten(View.render({}, null).props.style).backgroundColor).toBe(
      'transparent'
    );
    expect(
      _flatten(View.render({ type: 'foreground' }, null).props.style)
        .backgroundColor
    ).toBe(_palette.foreground);
    expect(
      _flatten(
        View.render(
          { type: 'background', style: { backgroundColor: 'red' } },
          null
        ).props.style
      ).backgroundColor
    ).toBe('red');
  }
});

test('屏幕尺寸改变后重新计算xz缩放、方向与断点', () => {
  expect(useScreen().fix(16)).toBe(16);
  for (const [_breakpoint, _size] of Object.entries({
    xs: 440,
    sm: 667,
    md: 774,
    lg: 1133,
    xl: 1280,
    xxl: 1536,
  })) {
    _width = _size - 1;
    expect(useScreen()[_breakpoint]).toBe(false);
    _width = _size;
    expect(useScreen()[_breakpoint]).toBe(true);
  }
  _width = 874;
  _height = 402;
  expect(useScreen()).toMatchObject({
    width: 874,
    height: 402,
    landscape: true,
  });
  expect(useScreen().fix(16)).toBeCloseTo(16 * Math.pow(874 / 375, 1.3));
  expect(_flatten(Text.render({}, null).props.style).fontSize).toBeCloseTo(
    useScreen().fix(15)
  );
});
