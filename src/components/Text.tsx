import { Fragment, forwardRef, type ComponentRef, type ReactNode } from 'react';
import {
  Linking,
  Text as _Text,
  type StyleProp,
  type TextProps as _TextProps,
  type TextStyle,
} from 'react-native/index.js';

const CUSTOM = /(\[[^\]]+\])/g;
const MENTION = /(@[^\s@]+)(?=\s|$)/g;
const LINK =
  /((?:[a-z][a-z0-9+.-]*:\/\/)?(?:[\p{L}\p{N}](?:[-_\p{L}\p{N}]*[\p{L}\p{N}])?\.)+(?:[a-z]{2,24}|xn--[a-z0-9-]{2,59}|中国|中國|香港|台湾|台灣|公司|网络|網絡)(?![.a-z0-9-])(?:[/?#][-\p{L}\p{N}._~!$&'()*+;=:@%/?#]*)?)/giu;

export type TextProps = _TextProps & {
  ctx?: {
    link?: StyleProp<TextStyle>;
    mention?: StyleProp<TextStyle>;
    custom?: (name: string) => ReactNode;
  };
};

const render = (
  value: ReactNode,
  ctx: NonNullable<TextProps['ctx']>
): ReactNode => {
  if (Array.isArray(value)) return value.map(item => render(item, ctx));
  if (typeof value !== 'string') return value;

  return value.split(LINK).map((linkPart, linkIndex) =>
    linkIndex % 2 && ctx.link ? (
      <_Text
        key={`l-${linkIndex}`}
        style={ctx.link}
        suppressHighlighting
        onPress={() =>
          Linking.openURL(
            linkPart.startsWith('http') ? linkPart : `https://${linkPart}`
          )
        }
      >
        {linkPart}
      </_Text>
    ) : (
      linkPart.split(MENTION).map((mentionPart, mentionIndex) =>
        mentionIndex % 2 && ctx.mention ? (
          <_Text
            key={`m-${linkIndex}-${mentionIndex}`}
            style={ctx.mention}
          >
            {mentionPart}
          </_Text>
        ) : (
          mentionPart
            .split(CUSTOM)
            .map((customPart, customIndex) =>
              customIndex % 2 && ctx.custom ? (
                <Fragment key={`c-${linkIndex}-${mentionIndex}-${customIndex}`}>
                  {ctx.custom(customPart)}
                </Fragment>
              ) : (
                customPart
              )
            )
        )
      )
    )
  );
};

export const Text = forwardRef<ComponentRef<typeof _Text>, TextProps>(
  ({ children, style, ctx = {}, ...props }, ref) => (
    <_Text
      ref={ref}
      style={[{ fontSize: 15, fontWeight: '400' }, style]}
      {...props}
    >
      {render(children, ctx)}
    </_Text>
  )
);
