import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

type LanguageEnum = string;

export interface I18nResource {
  [k: string]:
    | string
    | {
        [l: string]: string | ((lang: LanguageEnum, text: string) => string);
      };
}

const i18nResource: I18nResource = {};

interface TransitionFn {
  (text: string): string;

  /** 全部字母大写 */
  u: (text: string) => string;

  /** 全部字母小写 */
  l: (text: string) => string;

  /** 首字母大写，其余小写 */
  uf: (text: string) => string;
}

const i18n: TransitionFn = (text: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { lang, keyLang, resource } = useContext(localeContext);
  let transfered = text;
  if (lang !== keyLang) {
    const value = resource?.[text];
    if (value) {
      if (typeof value === "string") {
        transfered = value;
      } else if (typeof value === "object") {
        const item = value[lang];
        if (typeof item === "string") {
          transfered = item;
        } else if (typeof item === "function") {
          transfered = item(lang, text) ?? text;
        }
      }
    }
  }
  return transfered;
};

i18n.u = (text: string) => {
  const transfered = i18n(text);
  if (transfered) {
    return transfered.toUpperCase();
  }
  return transfered;
};

i18n.l = (text: string) => {
  const transfered = i18n(text);
  if (transfered) {
    return transfered.toLowerCase();
  }
  return transfered;
};

i18n.uf = (text: string) => {
  let transfered = i18n(text);
  if (transfered) {
    transfered = transfered.toLowerCase();
    const chars = [...transfered];
    chars[0] = chars[0].toUpperCase();
    return chars.join("");
  }
  return transfered;
};

const browserLang: LanguageEnum = window.navigator.language.split(
  "-"
)[0] as LanguageEnum;

interface LangContextValue {
  lang: LanguageEnum;
  setLang?: (lang: LanguageEnum) => void;
  keyLang: LanguageEnum | null;
  dir?: string;
  resource?: I18nResource;
}

const localeContext = createContext<LangContextValue>({
  lang: browserLang,
  keyLang: null,
});

export function LocaleProvider({
  children,
  lang,
  keyLang = null,
  resource = i18nResource,
}: PropsWithChildren<{
  lang?: string;
  keyLang?: string | null;
  resource?: I18nResource;
}>) {
  const [value, setValue] = useState<LanguageEnum>(
    (lang as LanguageEnum) ?? browserLang
  );

  const setLang = useCallback((lang: LanguageEnum) => {
    if (lang) {
      setValue(lang);
    }
  }, []);

  return (
    <localeContext.Provider
      value={{
        lang: value,
        keyLang: keyLang as LanguageEnum,
        setLang,
        resource,
      }}
    >
      {children}
    </localeContext.Provider>
  );
}

export { i18n, localeContext as langContext };
export default i18n;
