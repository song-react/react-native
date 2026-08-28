import { useLocales, type Locale } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

export type Languages = Record<string, Record<string, unknown>>;
export type Language<T extends Languages = Languages> = Extract<
  keyof T,
  string
>;
export type Translate = (text: string, options?: TranslateOptions) => string;

let currentI18n: I18n | undefined;
let currentLocale: string | undefined;

export const t: Translate = (text, options) =>
  currentI18n?.t(text, {
    defaultValue: text,
    locale: currentLocale,
    ...options,
  }) ?? text;

const I18nContext = createContext<{
  language?: string;
  locale: string;
  languages: string[];
  setLanguage: (language?: string) => void;
  t: Translate;
} | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('缺少 I18nProvider');
  return context;
};

const systemLanguage = <T extends Languages>(
  languages: T,
  locale: Locale,
  defaultLanguage?: Language<T>
) => {
  const keys = Object.keys(languages) as Language<T>[];
  const matched = [
    locale.languageTag,
    locale.languageCode && locale.languageScriptCode
      ? `${locale.languageCode}-${locale.languageScriptCode}`
      : undefined,
    locale.languageCode,
  ].find(value => value && Object.hasOwn(languages, value)) as
    | Language<T>
    | undefined;
  const fallback =
    matched ??
    (locale.languageCode
      ? keys.find(key => key.startsWith(`${locale.languageCode}-`))
      : undefined) ??
    defaultLanguage ??
    keys[0];
  if (!fallback) throw new Error('languages 不能为空');
  return fallback;
};

export const I18nProvider = <T extends Languages>({
  children,
  languages,
  language,
  setLanguage,
  defaultLanguage,
}: {
  children: ReactNode;
  languages: T;
  language?: Language<T>;
  setLanguage: (language?: Language<T>) => void;
  defaultLanguage?: Language<T>;
}) => {
  const [deviceLocale] = useLocales();
  const instance = useMemo(() => new I18n(languages), [languages]);
  const selectedLanguage =
    language && Object.hasOwn(languages, language) ? language : undefined;
  const locale =
    selectedLanguage ??
    systemLanguage(languages, deviceLocale, defaultLanguage);

  currentI18n = instance;
  currentLocale = locale;

  return (
    <I18nContext.Provider
      value={{
        language: selectedLanguage,
        locale,
        languages: Object.keys(languages),
        setLanguage: (value?: string) => {
          if (value !== undefined && !Object.hasOwn(languages, value))
            throw new Error(`不支持的语言: ${value}`);
          setLanguage(value as Language<T> | undefined);
        },
        t: (text: string, options?: TranslateOptions) =>
          instance.t(text, { defaultValue: text, locale, ...options }),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
