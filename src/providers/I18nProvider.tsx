import { useLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

type Language = 'zh-Hans' | 'en';

let currentI18n: I18n | undefined;
let currentLocale: string | undefined;

export const t = (text: string, options?: TranslateOptions) =>
  currentI18n?.t(text, {
    defaultValue: text,
    locale: currentLocale,
    ...options,
  }) ?? text;

const I18nContext = createContext<{
  language?: Language;
  locale: Language;
  setLanguage: (language?: Language) => void;
  t: (text: string, options?: TranslateOptions) => string;
} | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('缺少 I18nProvider');
  return context;
};

export const I18nProvider = ({
  children,
  languages,
  language,
  setLanguage,
}: {
  children: ReactNode;
  languages: Record<Language, Record<string, unknown>>;
  language?: Language;
  setLanguage: (language?: Language) => void;
}) => {
  const [deviceLocale] = useLocales();
  const instance = useMemo(() => new I18n(languages), [languages]);
  const locale =
    language ?? (deviceLocale.languageCode === 'en' ? 'en' : 'zh-Hans');

  currentI18n = instance;
  currentLocale = locale;

  return (
    <I18nContext.Provider
      value={{
        language,
        locale,
        setLanguage,
        t: (text: string, options?: TranslateOptions) =>
          instance.t(text, { defaultValue: text, locale, ...options }),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
