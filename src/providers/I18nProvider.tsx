import { useLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

type Languages = Record<string, Record<string, unknown>>;
type Language<T extends Languages> = keyof T & string;

let currentI18n: I18n | undefined;
let currentLocale: string | undefined;

export const t = (text: string, options?: TranslateOptions) =>
  currentI18n?.t(text, {
    defaultValue: text,
    locale: currentLocale,
    ...options,
  }) ?? text;

const I18nContext = createContext<{
  language?: string;
  locale: string;
  setLanguage: (language?: string) => void;
  t: (text: string, options?: TranslateOptions) => string;
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
}: {
  children: ReactNode;
  languages: T & { zh: Record<string, unknown> };
  language?: Language<T>;
  setLanguage: (language?: Language<T>) => void;
}) => {
  const [deviceLocale] = useLocales();
  const instance = useMemo(() => new I18n(languages), [languages]);
  const selectedLanguage =
    language && Object.hasOwn(languages, language) ? language : undefined;
  const systemLanguage =
    deviceLocale.languageCode === 'zh' &&
    deviceLocale.languageScriptCode === 'Hant'
      ? 'zh-Hant'
      : deviceLocale.languageCode;
  const locale =
    selectedLanguage ??
    (systemLanguage && Object.hasOwn(languages, systemLanguage)
      ? systemLanguage
      : 'zh');

  currentI18n = instance;
  currentLocale = locale;

  return (
    <I18nContext.Provider
      value={{
        language: selectedLanguage,
        locale,
        setLanguage: value => {
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
