import { useWindowDimensions } from 'react-native/index.js';

let _baseWidth = 375;

export const useScreen = () => {
  const { width, height } = useWindowDimensions();
  const _coefficient = Math.pow(width / _baseWidth, 1.3);
  return {
    /** 按配置基准缩放，默认375点；页面整体宽度仍由父布局决定。 */
    fix: (size: number) => size * _coefficient,
    xs: width >= 440,
    sm: width >= 667,
    md: width >= 774,
    lg: width >= 1133,
    xl: width >= 1280,
    xxl: width >= 1536,
    width,
    height,
    landscape: width > height,
  };
};

/** 在应用入口设置设计尺寸的缩放基准，默认375点。 */
useScreen.set = (width: number) => {
  if (!Number.isFinite(width) || width <= 0)
    throw new Error('屏幕基准宽度必须是大于0的有限数值');
  _baseWidth = width;
};
