import { Image as _Image, type ImageProps as _ImageProps } from 'expo-image';
import {
  forwardRef,
  useState,
  type ComponentRef,
  type FC,
  type ForwardedRef,
} from 'react';
import { Image as __Image, type ViewStyle } from 'react-native/index.js';
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
    <_Image
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
    React.RefAttributes<ComponentRef<typeof _Image>>
> & { getSize: typeof __Image.getSize };

export const Image = forwardRef(ImageImp) as ImageComponent;
Image.getSize = __Image.getSize;
