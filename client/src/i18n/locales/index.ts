import { SupportedLanguage, TranslationSchema } from "../types";
import { bn } from "./bn";
import { en } from "./en";
import { ur } from "./ur";

export const LOCALES_MAP: Record<SupportedLanguage, TranslationSchema> = {
  bn,
  en,
  ur,
};

export { bn, en, ur };
