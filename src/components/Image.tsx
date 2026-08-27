import {
  Image as ExpoImage,
  type ImageProps as ExpoImageProps,
} from 'expo-image';
import {
  forwardRef,
  useState,
  type ComponentRef,
  type FC,
  type ForwardedRef,
} from 'react';
import { Image as NativeImage, type ViewStyle } from 'react-native/index.js';
import type { SvgProps } from 'react-native-svg';

type ImageStyle = ExpoImageProps['style'] &
  Pick<ViewStyle, 'aspectRatio' | 'width' | 'height'>;

export type ImageProps = Omit<ExpoImageProps, 'source' | 'style'> &
  Omit<SvgProps, 'height' | 'style' | 'width'> & {
    source?: ExpoImageProps['source'] | FC<SvgProps>;
    width?: SvgProps['width'];
    height?: SvgProps['height'];
    borderRadius?: ViewStyle['borderRadius'];
    style?: ImageStyle;
  };

const ImageImpl = (
  {
    source: Source,
    width,
    height,
    borderRadius,
    style,
    onLoad,
    ...props
  }: ImageProps,
  ref: ForwardedRef<ComponentRef<typeof ExpoImage>>
) => {
  const [aspectRatio, setAspectRatio] = useState<number>();
  const measure =
    typeof Source !== 'function' &&
    !Array.isArray(style) &&
    (width == null || height == null) &&
    style?.aspectRatio == null &&
    (style?.width == null || style?.height == null);

  if (typeof Source === 'function')
    return (
      <Source
        {...props}
        width={width ?? undefined}
        height={height ?? undefined}
        style={[{ borderRadius }, style] as SvgProps['style']}
      />
    );

  return (
    <ExpoImage
      ref={ref}
      source={typeof Source === 'string' ? Source.replace(/^http:/, 'https:') : Source}
      style={[
        measure ? { aspectRatio } : undefined,
        {
          width: width as ViewStyle['width'],
          height: height as ViewStyle['height'],
          borderRadius,
        },
        style,
      ]}
      placeholderContentFit='cover'
      enforceEarlyResizing
      onLoad={event => {
        if (measure && event.source.width && event.source.height)
          setAspectRatio(event.source.width / event.source.height);
        onLoad?.(event);
      }}
      {...props}
    />
  );
};

type ImageComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ImageProps> &
    React.RefAttributes<ComponentRef<typeof ExpoImage>>
> & { getSize: typeof NativeImage.getSize };

export const Image = forwardRef(ImageImpl) as ImageComponent;
Image.getSize = NativeImage.getSize;
