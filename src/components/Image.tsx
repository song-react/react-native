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
import { Image as NativeImage, type ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type ImageStyle = ExpoImageProps['style'] &
  Pick<ViewStyle, 'aspectRatio' | 'width' | 'height'>;

export type ImageProps = Omit<ExpoImageProps, 'source' | 'style'> &
  SvgProps & {
    source?: ExpoImageProps['source'] | FC<SvgProps>;
    style?: ImageStyle;
  };

const ImageImpl = (
  { source: Source, style, onLoad, ...props }: ImageProps,
  ref: ForwardedRef<ComponentRef<typeof ExpoImage>>
) => {
  const [aspectRatio, setAspectRatio] = useState<number>();
  const measure =
    typeof Source !== 'function' &&
    !Array.isArray(style) &&
    (props.width == null || props.height == null) &&
    style?.aspectRatio == null &&
    (style?.width == null || style?.height == null);

  if (typeof Source === 'function') return <Source {...props} />;

  return (
    <ExpoImage
      ref={ref}
      source={Source}
      style={measure ? [{ aspectRatio }, style] : style}
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
