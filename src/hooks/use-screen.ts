import { useWindowDimensions } from 'react-native/index.js';

export const useScreen = () => {
  const { width, height } = useWindowDimensions();
  const _coefficient = Math.pow(width / 375, 1.3);
  return {
    /** 沿用xz的375点基准缩放；页面整体宽度仍由父布局决定。 */
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
