import { useLocales, type Locale } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

export type Languages = Record<string, Record<string, unknown>>;
export type Language<T extends Languages = Languages> = Extract<keyof T, string>;
export type Translate = (text: string, options?: TranslateOptions) => string;

type I18nValue<T extends string = string> = {
  language?: T;
  locale: T;
  languages: T[];
  setLanguage: (language?: T) => void;
  t: Translate;
};

let currentI18n: I18n | undefined;
let currentLocale: string | undefined;

export const t: Translate = (text, options) =>
  currentI18n?.t(text, {
    defaultValue: text,
    locale: currentLocale,
    ...options,
  }) ?? text;

const I18nContext = createContext<I18nValue | null>(null);

export const useI18n = <T extends string = string>() => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('缺少 I18nProvider');
  return context as I18nValue<T>;
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
  ].find(value => value && value in languages) as Language<T> | undefined;
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
  const locale =
    (language && language in languages ? language : undefined) ??
    systemLanguage(languages, deviceLocale, defaultLanguage);
  const translate = useCallback<Translate>(
    (text, options) =>
      instance.t(text, { defaultValue: text, locale, ...options }),
    [instance, locale]
  );

  currentI18n = instance;
  currentLocale = locale;

  return (
    <I18nContext.Provider
      value={{
        language,
        locale,
        languages: Object.keys(languages),
        setLanguage: value => setLanguage(value as Language<T> | undefined),
        t: translate,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
