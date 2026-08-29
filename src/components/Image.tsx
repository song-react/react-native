import { Image as _Image, type ImageProps as _ImageProps } from 'expo-image';
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentRef,
  type FC,
  type ForwardedRef,
} from 'react';
import {
  Image as __Image,
  Platform,
  StyleSheet,
  type ViewStyle,
} from 'react-native/index.js';
import type { SvgProps } from 'react-native-svg';

type ImageStyle = _ImageProps['style'] &
  Pick<ViewStyle, 'aspectRatio' | 'width' | 'height'>;

export type ImageProps = Omit<_ImageProps, 'source' | 'style'> &
  Omit<SvgProps, 'height' | 'style' | 'width'> & {
    source?: _ImageProps['source'] | FC<SvgProps>;
    width?: SvgProps['width'];
    height?: SvgProps['height'];
    borderRadius?: ViewStyle['borderRadius'];
    style?: ImageStyle;
  };

const ImageImp = (
  {
    source: Source,
    width,
    height,
    borderRadius,
    style,
    onLoad,
    ...props
  }: ImageProps,
  ref: ForwardedRef<ComponentRef<typeof _Image>>
) => {
  const flatStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
  const layoutWidth = flatStyle?.width ?? width;
  const layoutHeight = flatStyle?.height ?? height;
  const measure =
    typeof Source !== 'function' &&
    !Array.isArray(Source) &&
    (layoutWidth == null || layoutHeight == null) &&
    flatStyle?.aspectRatio == null;
  const source =
    typeof Source === 'string' ? Source.replace(/^http:/, 'https:') : Source;
  const sourceSize =
    source &&
    !Array.isArray(source) &&
    typeof source === 'object' &&
    'width' in source &&
    'height' in source &&
    typeof source.width === 'number' &&
    typeof source.height === 'number' &&
    source.width > 0 &&
    source.height > 0
      ? source.width / source.height
      : undefined;
  const primitiveMeasureSource =
    typeof source === 'string' || typeof source === 'number'
      ? source
      : undefined;
  const serializedMeasureSource =
    source &&
    !Array.isArray(source) &&
    typeof source === 'object' &&
    'uri' in source &&
    typeof source.uri === 'string'
      ? JSON.stringify({
          uri: source.uri,
          cacheKey: source.cacheKey,
          headers: source.headers,
        })
      : undefined;
  const measureKey =
    serializedMeasureSource == null
      ? primitiveMeasureSource
      : `object:${serializedMeasureSource}`;
  const [measuredSource, setMeasuredSource] = useState<{
    key: typeof measureKey;
    aspectRatio: number;
  }>();

  useEffect(() => {
    if (
      !measure ||
      sourceSize ||
      (primitiveMeasureSource == null && serializedMeasureSource == null)
    )
      return;

    const measureSource = serializedMeasureSource
      ? JSON.parse(serializedMeasureSource)
      : primitiveMeasureSource!;

    let current = true;
    if (Platform.OS === 'web') {
      const uri =
        typeof measureSource === 'string'
          ? measureSource
          : typeof measureSource === 'object' && !measureSource.headers
            ? measureSource.uri
            : undefined;
      if (!uri) return;
      __Image.getSize(
        uri,
        (nextWidth, nextHeight) => {
          if (current && nextWidth > 0 && nextHeight > 0)
            setMeasuredSource({
              key: measureKey,
              aspectRatio: nextWidth / nextHeight,
            });
        },
        () => undefined,
      );
      return () => {
        current = false;
      };
    }

    void _Image
      .loadAsync(measureSource, { maxWidth: 1024 })
      .then(nextImage => {
        if (current && nextImage.width > 0 && nextImage.height > 0)
          setMeasuredSource({
            key: measureKey,
            aspectRatio: nextImage.width / nextImage.height,
          });
        nextImage.release();
      })
      .catch(() => undefined);

    return () => {
      current = false;
    };
  }, [
    measure,
    measureKey,
    primitiveMeasureSource,
    serializedMeasureSource,
    sourceSize,
  ]);

  if (typeof Source === 'function')
    return (
      <Source
        {...props}
        width={width ?? (flatStyle?.width as SvgProps['width'])}
        height={height ?? (flatStyle?.height as SvgProps['height'])}
        style={
          {
            ...flatStyle,
            ...(borderRadius == null ? undefined : { borderRadius }),
          } as SvgProps['style']
        }
      />
    );

  const measured =
    measure && measuredSource?.key === measureKey ? measuredSource : undefined;
  const imageSource = source as _ImageProps['source'];
  const remoteKeys = (Array.isArray(source) ? source : [source]).flatMap(item => {
    if (typeof item === 'string' && /^https?:\/\//.test(item)) return item;
    if (
      item &&
      typeof item === 'object' &&
      'uri' in item &&
      typeof item.uri === 'string' &&
      /^https?:\/\//.test(item.uri)
    )
      return typeof item.cacheKey === 'string' ? item.cacheKey : item.uri;
    return [];
  });
  const remoteProps = remoteKeys.length
    ? {
        cachePolicy: 'memory-disk' as const,
        recyclingKey: remoteKeys.join('\u0001'),
      }
    : undefined;

  return (
    <_Image
      ref={ref}
      source={imageSource}
      {...remoteProps}
      style={[
        measure
          ? { aspectRatio: sourceSize ?? measured?.aspectRatio }
          : undefined,
        {
          width: width as ViewStyle['width'],
          height: height as ViewStyle['height'],
          borderRadius,
        },
        style,
      ]}
      placeholderContentFit='cover'
      enforceEarlyResizing={!measure}
      onLoad={onLoad}
      {...props}
    />
  );
};

type ImageComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ImageProps> &
    React.RefAttributes<ComponentRef<typeof _Image>>
> & {
  clearDiskCache: typeof _Image.clearDiskCache;
  clearMemoryCache: typeof _Image.clearMemoryCache;
  getSize: typeof __Image.getSize;
};

export const Image = forwardRef(ImageImp) as ImageComponent;
Image.clearDiskCache = _Image.clearDiskCache;
Image.clearMemoryCache = _Image.clearMemoryCache;
Image.getSize = __Image.getSize;
