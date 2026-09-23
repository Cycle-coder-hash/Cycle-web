export type SupportedLanguage =
  | "en" // English
  | "bn" // Bangla
  | "hi" // Hindi
  | "ar" // Arabic (RTL)
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "it" // Italian
  | "ja" // Japanese
  | "ru" // Russian
  | "zh" // Chinese
  | "ur" // Urdu (RTL)
  | "ko"; // Korean

export type TextDirection = "ltr" | "rtl";

export interface CountryLanguageOption {
  id: string;
  countryName: string;
  flag: string;
  langCode: SupportedLanguage;
  langName: string;
  nativeName: string;
  dir: TextDirection;
}

export const COUNTRY_LANGUAGE_OPTIONS: CountryLanguageOption[] = [
  {
    id: "bd-bn",
    countryName: "Bangladesh",
    flag: "🇧🇩",
    langCode: "bn",
    langName: "Bangla",
    nativeName: "বাংলা",
    dir: "ltr",
  },
  {
    id: "us-en",
    countryName: "United States",
    flag: "🇺🇸",
    langCode: "en",
    langName: "English",
    nativeName: "English (US)",
    dir: "ltr",
  },
  {
    id: "in-hi",
    countryName: "India",
    flag: "🇮🇳",
    langCode: "hi",
    langName: "Hindi",
    nativeName: "हिन्दी",
    dir: "ltr",
  },
  {
    id: "sa-ar",
    countryName: "Saudi Arabia",
    flag: "🇸🇦",
    langCode: "ar",
    langName: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
  },
  {
    id: "es-es",
    countryName: "Spain",
    flag: "🇪🇸",
    langCode: "es",
    langName: "Spanish",
    nativeName: "Español",
    dir: "ltr",
  },
  {
    id: "fr-fr",
    countryName: "France",
    flag: "🇫🇷",
    langCode: "fr",
    langName: "French",
    nativeName: "Français",
    dir: "ltr",
  },
  {
    id: "de-de",
    countryName: "Germany",
    flag: "🇩🇪",
    langCode: "de",
    langName: "German",
    nativeName: "Deutsch",
    dir: "ltr",
  },
  {
    id: "it-it",
    countryName: "Italy",
    flag: "🇮🇹",
    langCode: "it",
    langName: "Italian",
    nativeName: "Italiano",
    dir: "ltr",
  },
  {
    id: "jp-ja",
    countryName: "Japan",
    flag: "🇯🇵",
    langCode: "ja",
    langName: "Japanese",
    nativeName: "日本語",
    dir: "ltr",
  },
  {
    id: "ru-ru",
    countryName: "Russia",
    flag: "🇷🇺",
    langCode: "ru",
    langName: "Russian",
    nativeName: "Русский",
    dir: "ltr",
  },
  {
    id: "cn-zh",
    countryName: "China",
    flag: "🇨🇳",
    langCode: "zh",
    langName: "Chinese",
    nativeName: "中文",
    dir: "ltr",
  },
  {
    id: "pk-ur",
    countryName: "Pakistan",
    flag: "🇵🇰",
    langCode: "ur",
    langName: "Urdu",
    nativeName: "اردو",
    dir: "rtl",
  },
  {
    id: "gb-en",
    countryName: "United Kingdom",
    flag: "🇬🇧",
    langCode: "en",
    langName: "English",
    nativeName: "English (UK)",
    dir: "ltr",
  },
  {
    id: "ca-en",
    countryName: "Canada (EN)",
    flag: "🇨🇦",
    langCode: "en",
    langName: "English",
    nativeName: "English (CA)",
    dir: "ltr",
  },
  {
    id: "ca-fr",
    countryName: "Canada (FR)",
    flag: "🇨🇦",
    langCode: "fr",
    langName: "French",
    nativeName: "Français (CA)",
    dir: "ltr",
  },
  {
    id: "ch-de",
    countryName: "Switzerland (DE)",
    flag: "🇨🇭",
    langCode: "de",
    langName: "German",
    nativeName: "Deutsch (CH)",
    dir: "ltr",
  },
  {
    id: "ch-fr",
    countryName: "Switzerland (FR)",
    flag: "🇨🇭",
    langCode: "fr",
    langName: "French",
    nativeName: "Français (CH)",
    dir: "ltr",
  },
  {
    id: "ch-it",
    countryName: "Switzerland (IT)",
    flag: "🇨🇭",
    langCode: "it",
    langName: "Italian",
    nativeName: "Italiano (CH)",
    dir: "ltr",
  },
  {
    id: "ae-ar",
    countryName: "United Arab Emirates",
    flag: "🇦🇪",
    langCode: "ar",
    langName: "Arabic",
    nativeName: "العربية (الإمارات)",
    dir: "rtl",
  },
  {
    id: "kr-ko",
    countryName: "South Korea",
    flag: "🇰🇷",
    langCode: "ko",
    langName: "Korean",
    nativeName: "한국어",
    dir: "ltr",
  },
  {
    id: "au-en",
    countryName: "Australia",
    flag: "🇦🇺",
    langCode: "en",
    langName: "English",
    nativeName: "English (AU)",
    dir: "ltr",
  },
];

export interface TranslationSchema {
  nav: {
    roadmap: string;
    store: string;
    freeBasics: string;
    leaderboard: string;
    support: string;
    signIn: string;
    dashboard: string;
    logout: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    subtext: string;
    startRoadmap: string;
    exploreStore: string;
    trust1: string;
    trust2: string;
    trust3: string;
  };
  shift: {
    eyebrow: string;
    title1: string;
    title2: string;
    desc: string;
    hypeHeader: string;
    realityHeader: string;
  };
  roadmap: {
    eyebrow: string;
    title1: string;
    title2: string;
    desc: string;
    clickPrompt: string;
    stageOf: string;
    outOf: string;
    whatYouLearn: string;
    exercise: string;
    edge: string;
    prevStage: string;
    nextStage: string;
    close: string;
  };
  freeBasics: {
    eyebrow: string;
    title: string;
    desc: string;
    cta: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
  };
  store: {
    eyebrow: string;
    title: string;
    viewBundle: string;
    starterBadge: string;
    coreBadge: string;
    mostPopular: string;
    freeAccess: string;
    claimFreePackage: string;
    claimNow: string;
    includedNotice: string;
    productsReady: string;
  };
  platforms: {
    eyebrow: string;
    title: string;
    desc: string;
    downloadBtn: string;
  };
  founder: {
    eyebrow: string;
    title: string;
    desc: string;
    experience: string;
    students: string;
    methodology: string;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    rights: string;
  };
  dashboard: {
    welcome: string;
    activePlan: string;
    verifiedStudent: string;
    tabOverview: string;
    tabRoadmap: string;
    tabLibrary: string;
    tabJournal: string;
    tabDiscipline: string;
    tabOrders: string;
    tabSupport: string;
    totalPnl: string;
    winRate: string;
    bestSetup: string;
    totalTrades: string;
    profitFactor: string;
    recentActivity: string;
    quickActions: string;
    growthCurveTitle: string;
    growthCurveSubtitle: string;
    balanceTrajectory: string;
    growthPercent: string;
    periodPnl: string;
    daily: string;
    weekly: string;
    monthly: string;
  };
  journal: {
    title: string;
    subtitle: string;
    newTrade: string;
    pair: string;
    direction: string;
    entryPrice: string;
    exitPrice: string;
    pnl: string;
    result: string;
    win: string;
    loss: string;
    breakeven: string;
    notes: string;
    saveTrade: string;
  };
  discipline: {
    title: string;
    subtitle: string;
    dailyRoutine: string;
    mandatory: string;
    optional: string;
    workout: string;
    forexStudy: string;
    dailyReflection: string;
    completed: string;
    targetAchieved: string;
  };
  auth: {
    signInTitle: string;
    createAccountTitle: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    phoneLabel: string;
    submitSignIn: string;
    submitRegister: string;
    forgotPassword: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    verifyOtpTitle: string;
    enterCode: string;
    verifyBtn: string;
  };
  support: {
    title: string;
    subtitle: string;
    typePlaceholder: string;
    send: string;
    supportStaff: string;
    verifiedSupport: string;
    onlineStatus: string;
    emptyDialogue: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    q1: string;
    q1Placeholder: string;
    q2: string;
    q2Opt1: string;
    q2Opt2: string;
    q2Opt3: string;
    q3: string;
    yes: string;
    no: string;
    submit: string;
    saving: string;
  };
  common: {
    back: string;
    save: string;
    cancel: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    viewAll: string;
    readMore: string;
  };
}
