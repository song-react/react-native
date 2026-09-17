import React, { ComponentRef, ForwardedRef, Fragment, forwardRef } from 'react';
import {
  Linking,
  StyleProp,
  TextStyle,
  Text as _Text,
  type TextProps as _TextProps,
} from 'react-native/index.js';

import { useScreen } from '../hooks/use-screen';
import { useColors } from '../providers/ColorsProvider';

const CUSTOM_TEST_REGEX = /\[[^\]]+\]/;
const CUSTOM_SPLIT_REGEX = /(\[[^\]]+\])/g;
const renderCustom = (
  val: string,
  ctx: { custom?: (name: string) => React.ReactNode }
) => {
  if (!ctx.custom || !CUSTOM_TEST_REGEX.test(val)) {
    return val; // 无图片时返回原字符串
  }
  CUSTOM_SPLIT_REGEX.lastIndex = 0;
  const parts = val.split(CUSTOM_SPLIT_REGEX);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <Fragment key={`c-${idx}`}>{ctx.custom?.(part)}</Fragment>;
    } else {
      return part;
    }
  });
};

// @xxxxx
const MENTION_TEST_REGEX = /@[^\s@]+(?:\s|$)/;
const MENTION_SPLIT_REGEX = /(@[^\s@]+)(?=\s|$)/g;
const renderMention = (
  val: string,
  ctx: {
    mention?: StyleProp<TextStyle>;
    custom?: (name: string) => React.ReactNode;
  }
): React.ReactNode => {
  if (!ctx.mention || !MENTION_TEST_REGEX.test(val)) {
    return renderCustom(val, ctx); // 无 @ 时快速返回
  }
  MENTION_SPLIT_REGEX.lastIndex = 0;
  const parts = val.split(MENTION_SPLIT_REGEX);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <_Text key={`m-${idx}`} style={ctx.mention}>
          {part}
        </_Text>
      );
    } else {
      return renderCustom(part, ctx);
    }
  });
};

// Link
const LINK_TLD_REGEX =
  '[a-z]{2,24}|xn--[a-z0-9-]{2,59}|中国|中國|香港|台湾|台灣|公司|网络|網絡';
const LINK_TEST_REGEX = new RegExp(
  `\\.(?:${LINK_TLD_REGEX})(?![.a-z0-9-])`,
  'iu'
);
const LINK_SPLIT_REGEX = new RegExp(
  `((?:[a-z][a-z0-9+.-]*:\\/\\/)?(?:[\\p{L}\\p{N}](?:[-_\\p{L}\\p{N}]*[\\p{L}\\p{N}])?\\.)+(?:${LINK_TLD_REGEX})(?![.a-z0-9-])(?:[/?#][-\\p{L}\\p{N}._~!$&'()*+;=:@%/?#]*)?)`,
  'giu'
);
const renderLink = (
  val: string,
  ctx: {
    link?: StyleProp<TextStyle>;
    mention?: StyleProp<TextStyle>;
    custom?: (name: string) => React.ReactNode;
  }
) => {
  if (!ctx.link || !LINK_TEST_REGEX.test(val)) {
    return renderMention(val, ctx); // 没有链接时才检查 @，避免多余遍历
  }
  LINK_SPLIT_REGEX.lastIndex = 0;
  const parts = val.split(LINK_SPLIT_REGEX);
  return parts.map((part, idx) => {
    if (!part) return;
    if (idx % 2 === 1) {
      return (
        <_Text
          key={`l-${idx}`}
          style={ctx.link}
          suppressHighlighting
          // @ts-expect-error Text 底层支持 touch 事件，类型未声明
          onTouchStart={event => event.stopPropagation()}
          onPress={() =>
            Linking.openURL(part.startsWith('http') ? part : `https://${part}`)
          }>
          {part}
        </_Text>
      );
    } else {
      return renderMention(part, ctx);
    }
  });
};

const renderChildren = (
  val: React.ReactNode,
  ctx: {
    link?: StyleProp<TextStyle>;
    mention?: StyleProp<TextStyle>;
    custom?: (name: string) => React.ReactNode;
  }
): React.ReactNode => {
  if (typeof val === 'string') return renderLink(val, ctx);
  if (Array.isArray(val)) return val.map(v => renderChildren(v, ctx));
  return val;
};

export type TextProps = _TextProps & {
  ctx?: {
    link?: _TextProps['style']; // 配置了就解析 link
    mention?: _TextProps['style']; // 配置了就解析 @mention
    custom?: (name: string) => React.ReactNode; // 配置了就解析图片
  };
};

const TextImp = (
  { children, style, ctx = {}, ...rest }: TextProps,
  ref: ForwardedRef<ComponentRef<typeof _Text>>
) => {
  const colors = useColors();
  const { fix } = useScreen();
  return (
    <_Text
      ref={ref}
      style={[
        { fontSize: fix(15), color: colors.fill, fontWeight: 400 },
        { fontFamily: 'PingFang SC' },
        style,
      ]}
      allowFontScaling={false}
      {...rest}>
      {renderChildren(children, ctx)}
    </_Text>
  );
};

export const Text = forwardRef(TextImp);
