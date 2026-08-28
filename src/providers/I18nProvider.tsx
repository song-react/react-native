import { useLocales } from 'expo-localization';
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
  const languageKeys = Object.keys(languages) as Language<T>[];
  const selectedLanguage =
    language && Object.hasOwn(languages, language) ? language : undefined;
  const locale =
    selectedLanguage ??
    languageKeys.find(key => key.split('-')[0] === deviceLocale.languageCode) ??
    defaultLanguage ??
    languageKeys[0];
  if (!locale) throw new Error('languages 不能为空');

  currentI18n = instance;
  currentLocale = locale;

  return (
    <I18nContext.Provider
      value={{
        language: selectedLanguage,
        locale,
        languages: languageKeys,
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
