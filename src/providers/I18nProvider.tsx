import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

let _I18n: I18n | undefined;
let _languageCode: string | undefined;

export const t = (text: string, options?: TranslateOptions) =>
  _I18n?.t(text, {
    defaultValue: text,
    locale: _languageCode,
    ...options,
  }) ?? text;

const I18nContext = createContext<{
  languageCode: string;
  languageCodes: string[];
  setLanguageCode: (languageCode?: string) => void;
  t: (text: string, options?: TranslateOptions) => string;
} | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('缺少 I18nProvider');
  return context;
};

export const I18nProvider = <LanguageCode extends string,>({
  children,
  languages,
  languageCode,
  setLanguageCode,
}: {
  children: ReactNode;
  languages: Record<
    LanguageCode,
    Record<string, string | undefined> | undefined
  >;
  languageCode?: LanguageCode;
  setLanguageCode: (languageCode?: LanguageCode) => void;
}) => {
  _I18n = useMemo(
    () =>
      new I18n(languages, {
        defaultLocale: Object.keys(languages)[0],
        enableFallback: true,
      }),
    [languages]
  );
  _languageCode =
    languageCode || getLocales()[0].languageCode || Object.keys(languages)[0];

  if (!_languageCode) throw new Error('languages 不能为空');

  return (
    <I18nContext.Provider
      value={{
        languageCode: _languageCode,
        languageCodes: Object.keys(languages),
        setLanguageCode: value => {
          if (value !== undefined && !Object.hasOwn(languages, value))
            throw new Error(`不支持的语言代码: ${value}`);
          setLanguageCode(value as LanguageCode | undefined);
        },
        t: (text: string, options?: TranslateOptions) =>
          _I18n?.t(text, {
            defaultValue: text,
            locale: _languageCode,
            ...options,
          }) ?? text,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
