import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

declare global {
  interface SongReactNativeI18n {}
}

type Languages = SongReactNativeI18n extends {
  languages: infer Value extends Record<string, Record<string, string>>;
}
  ? Value
  : Record<string, Record<string, string>>;
type Locale = keyof Languages & string;
type TranslationKey = keyof Languages[Locale] & string;

let _I18n: I18n | undefined;
let _locale: Locale | undefined;

export const t = (text: TranslationKey, options?: TranslateOptions) =>
  _I18n?.t(text, {
    defaultValue: text,
    locale: _locale,
    ...options,
  }) ?? text;

const I18nContext = createContext<{
  locale: Locale;
  locales: Locale[];
  setLocale: (locale?: Locale) => void;
  t: typeof t;
} | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('缺少 I18nProvider');
  return context;
};

export const I18nProvider = ({
  children,
  languages,
  locale,
  setLocale,
}: {
  children: ReactNode;
  languages: Languages;
  locale?: Locale;
  setLocale: (locale?: Locale) => void;
}) => {
  const systemLocale = getLocales()[0].languageCode;
  _I18n = useMemo(
    () =>
      new I18n(languages, {
        defaultLocale: Object.keys(languages)[0],
        enableFallback: true,
      }),
    [languages]
  );
  _locale =
    locale ||
    (systemLocale && Object.hasOwn(languages, systemLocale)
      ? (systemLocale as Locale)
      : (Object.keys(languages)[0] as Locale | undefined));

  if (!_locale) throw new Error('languages 不能为空');

  return (
    <I18nContext.Provider
      value={{
        locale: _locale,
        locales: Object.keys(languages) as Locale[],
        setLocale: value => {
          if (value !== undefined && !Object.hasOwn(languages, value))
            throw new Error(`不支持的语言: ${value}`);
          setLocale(value);
        },
        t: (text: TranslationKey, options?: TranslateOptions) =>
          _I18n?.t(text, {
            defaultValue: text,
            locale: _locale,
            ...options,
          }) ?? text,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
