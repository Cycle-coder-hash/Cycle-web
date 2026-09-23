import { SupportedLanguage, TranslationSchema } from "../types";
import { en } from "./en";
import { bn } from "./bn";
import { hi } from "./hi";
import { ar } from "./ar";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { it } from "./it";
import { ja } from "./ja";
import { ru } from "./ru";
import { zh } from "./zh";
import { ur } from "./ur";
import { ko } from "./ko";

export const LOCALES_MAP: Record<SupportedLanguage, TranslationSchema> = {
  en,
  bn,
  hi,
  ar,
  es,
  fr,
  de,
  it,
  ja,
  ru,
  zh,
  ur,
  ko,
};

export { en, bn, hi, ar, es, fr, de, it, ja, ru, zh, ur, ko };
