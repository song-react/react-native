import { Image as _Image, type ImageProps as _ImageProps } from 'expo-image';
import React, { ComponentRef, ForwardedRef, forwardRef, useState } from 'react';
import { SvgProps } from 'react-native-svg';
import { Image as __Image, type ViewStyle } from 'react-native/index.js';

type ImageStyle = _ImageProps['style'] &
  Pick<ViewStyle, 'aspectRatio' | 'width' | 'height'>;

export type ImageProps = Omit<_ImageProps, 'source' | 'style'> &
  SvgProps & {
    source?: _ImageProps['source'] | React.FC<SvgProps>;
    style?: ImageStyle;
  };

const ImageImp = (
  { source: Source, ...props }: ImageProps,
  ref: ForwardedRef<ComponentRef<typeof _Image>>
) => {
  const [aspectRatio, setAspectRatio] = useState<undefined | number>(undefined);

  const { style, onLoad, ...rest } = props;
  const shouldMeasureAspectRatio =
    typeof Source !== 'function' &&
    !Array.isArray(style) &&
    (props.width == null || props.height == null) &&
    style?.aspectRatio == null &&
    (style?.width == null || style?.height == null);

  if (typeof Source === 'function') {
    return <Source {...props} />;
  }

  return (
    <_Image
      ref={ref}
      source={Source}
      style={[
        {
          width: props.width as ViewStyle['width'],
          height: props.height as ViewStyle['height'],
          aspectRatio: shouldMeasureAspectRatio ? aspectRatio : undefined,
        },
        style,
      ]}
      placeholderContentFit='cover'
      onLoad={e => {
        const { width, height } = e.source;
        if (shouldMeasureAspectRatio && width && height) {
          setAspectRatio(width / height);
        }
        onLoad?.(e);
      }}
      enforceEarlyResizing={true}
      // priority={'low'}
      // autoplay={false}
      // useAppleWebpCodec={false}
      // transition={null}
      {...rest}
    />
  );
};

export const Image = forwardRef(ImageImp) as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ImageProps> &
    React.RefAttributes<ComponentRef<typeof _Image>>
> & {
  clearDiskCache: typeof _Image.clearDiskCache;
  clearMemoryCache: typeof _Image.clearMemoryCache;
  getSize: typeof __Image.getSize;
};
Image.clearDiskCache = _Image.clearDiskCache;
Image.clearMemoryCache = _Image.clearMemoryCache;
Image.getSize = __Image.getSize;
