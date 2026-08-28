import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

let _I18n: I18n | undefined;
let _locale: string | undefined;

export const t = (text: string, options?: TranslateOptions) =>
  _I18n?.t(text, {
    defaultValue: text,
    locale: _locale,
    ...options,
  }) ?? text;

const I18nContext = createContext<{
  locale: string;
  locales: string[];
  setLocale: (locale?: string) => void;
  t: (text: string, options?: TranslateOptions) => string;
} | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('缺少 I18nProvider');
  return context;
};

export const I18nProvider = <Locale extends string,>({
  children,
  languages,
  locale,
  setLocale,
}: {
  children: ReactNode;
  languages: Record<Locale, Record<string, string | undefined> | undefined>;
  locale?: Locale;
  setLocale: (locale?: Locale) => void;
}) => {
  _I18n = useMemo(
    () =>
      new I18n(languages, {
        defaultLocale: Object.keys(languages)[0],
        enableFallback: true,
      }),
    [languages]
  );
  _locale =
    locale || getLocales()[0].languageTag || Object.keys(languages)[0];

  if (!_locale) throw new Error('languages 不能为空');

  return (
    <I18nContext.Provider
      value={{
        locale: _locale,
        locales: Object.keys(languages),
        setLocale: value => {
          if (value !== undefined && !Object.hasOwn(languages, value))
            throw new Error(`不支持的语言: ${value}`);
          setLocale(value as Locale | undefined);
        },
        t: (text: string, options?: TranslateOptions) =>
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
