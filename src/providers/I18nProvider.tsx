import { useLocales } from 'expo-localization';
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

export const I18nProvider = <Language extends string,>({
  children,
  languages,
  language,
  setLanguage,
}: {
  children: ReactNode;
  languages: Record<Language, Record<string, string | undefined>>;
  language?: Language;
  setLanguage: (language?: Language) => void;
}) => {
  const [deviceLocale] = useLocales();
  _I18n = useMemo(() => new I18n(languages), [languages]);
  const selectedLanguage =
    language && Object.hasOwn(languages, language) ? language : undefined;
  const systemLanguage = [
    deviceLocale.languageTag,
    deviceLocale.languageCode && deviceLocale.languageScriptCode
      ? `${deviceLocale.languageCode}-${deviceLocale.languageScriptCode}`
      : undefined,
    deviceLocale.languageCode,
  ].find(value => value && Object.hasOwn(languages, value));
  _locale =
    selectedLanguage ?? systemLanguage ?? Object.keys(languages)[0];

  if (!_locale) throw new Error('languages 不能为空');

  return (
    <I18nContext.Provider
      value={{
        language: selectedLanguage,
        locale: _locale,
        setLanguage: value => {
          if (value !== undefined && !Object.hasOwn(languages, value))
            throw new Error(`不支持的语言: ${value}`);
          setLanguage(value as Language | undefined);
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
