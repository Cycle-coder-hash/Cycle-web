export type StageDetail = {
  num: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  exercise: string;
  edge: string;
};

export const STAGES_DETAILS_EN: StageDetail[] = [
  {
    num: "01",
    title: "BASIC TRADING UNDERSTANDING",
    category: "MARKET ESSENTIALS",
    summary:
      "Trading কী? কোথা থেকে এসেছে? এবং একজন Beginner-এর কোথা থেকে শুরু করা উচিত?\n\n“আগে MARKET থেকে শেখো, তারপর MARKET থেকে আয় করো।”\n\nTrading-এর শুরু কোথা থেকে?\nTrading-এর Market কত প্রকার?\nTrading শুরু করার আগে কী কী জানতে হয় বা শিখতে হয়?",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "02",
    title: "CANDLESTICKS",
    category: "CHART ANATOMY",
    summary:
      "Market-এর price movement বুঝতে Candlestick হলো অন্যতম গুরুত্বপূর্ণ foundation। একটি candle কীভাবে তৈরি হয়, তার bullish ও bearish behaviour কীভাবে বুঝতে হয় এবং বিভিন্ন candlestick pattern কীভাবে market-এর সম্ভাব্য movement সম্পর্কে ধারণা দেয়—এসব এখান থেকেই শেখা হবে।",
    keyPoints: [
      "Candlestick কীভাবে তৈরি হয়?",
      "BULLISH VS BEARISH",
      "Candlestick Pattern-এর ধরন",
      "01 — SINGLE CANDLE",
      "02 — TWO-CANDLE",
      "03 — MULTI-CANDLE",
      "REVERSAL-TYPE",
    ],
    exercise: "",
    edge: "",
  },
  {
    num: "03",
    title: "BASIC MARKET STRUCTURE",
    category: "STRUCTURE CONTEXT",
    summary:
      "Market কীভাবে move করে এবং price movement-এর মধ্যে থাকা basic structure কীভাবে বুঝতে হয়—এই section-এ সেটাই শেখা হবে। Market-এর direction, swing এবং price-এর গুরুত্বপূর্ণ movement বুঝে chart পড়ার foundation তৈরি করা হবে।",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "04",
    title: "SUPPORT & RESISTANCE",
    category: "KEY REACTION ZONES",
    summary:
      "চার্টজুড়ে এলোমেলো লাইন টানা বন্ধ করে ইন্সটিটিউশনাল স্ট্রাকচার-ভিত্তিক রিয়েল সাপোর্ট ও রেজিস্ট্যান্স লেভেল চিহ্নিত করুন।",
    keyPoints: [
      "মেজর সুইং লেভেলস বনাম মাইনর ইন্ট্রাডে নয়েজ লেভেল",
      "পোলারিটি ফ্লিপ জোন (পূর্ববর্তী রেজিস্ট্যান্স সাপোর্টে রূপান্তর)",
      "ব্রেক অ্যান্ড রিটেস্টের সুনির্দিষ্ট কনফার্মেশন রুলস",
      "সাইকোলজিক্যাল হোল নাম্বার ও ইন্সটিটিউশনাল রিঅ্যাকশন জোন",
    ],
    exercise: "উইকলি চার্টে ৩টি মেজর লেভেল চিহ্নিত করে প্রাইস সেখানে পৌঁছালে কেমন আচরণ করে তা দেখুন।",
    edge: "সাপোর্ট ও রেজিস্ট্যান্স কোনো একক লাইন নয়; এটি হলো সাপ্লাই ও ডিমান্ডের ইন্সটিটিউশনাল জোন।",
  },
  {
    num: "05",
    title: "SMART MONEY CONCEPT (SMC) — A TO Z",
    category: "INSTITUTIONAL FOOTPRINT",
    summary:
      "Market-এর Smart Money Concepts একদম basic থেকে advanced level পর্যন্ত A to Z শেখানো হবে, যাতে একজন trader chart-এর structure, liquidity এবং price movement আরও ভালোভাবে বুঝতে পারে।",
    keyPoints: ["A TO Z SMC"],
    exercise: "",
    edge: "",
  },
  {
    num: "06",
    title: "আইসিটি (ICT) মডেলস",
    category: "TIME & PRICE THEORY",
    summary:
      "ইনার সার্কেল ট্রেডার (ICT) টাইম ও প্রাইস থিওরি, লন্ডন ও নিউইয়র্ক সেশন টাইমিং এবং অ্যালগরিদমিক কিলজোন মাস্টার করুন।",
    keyPoints: [
      "জুডাস সুইং (Judas Swing) ও সেশন ওপেনিং ম্যানিপুলেশন",
      "লন্ডন ওপেন এবং নিউ ইয়র্ক ওপেন কিলজোন টাইমিং",
      "ফিবোনাচ্চি অপটিমাল ট্রেড এন্ট্রি (OTE) মডেল (৬২% - ৭৯%)",
      "পাওয়ার অব ৩ (AMD: Accumulation, Manipulation, Distribution)",
    ],
    exercise: "টানা ৫ দিন নিউ ইয়র্ক সেশনে লন্ডন সেশনের হাই/লো সুইপ কীভাবে রিঅ্যাক্ট করে তা ট্র্যাক করুন।",
    edge: "ট্রেডিংয়ে টাইমিং সবচেয়ে গুরুত্বপূর্ণ। সেরা সেটআপগুলো দিনের নির্দিষ্ট কিলজোনেই তৈরি হয়।",
  },
  {
    num: "07",
    title: "সিআরটি (CRT) মডেল",
    category: "CYCLE SIGNATURE",
    summary:
      "সাইকেল অব চার্টের স্পেশালাইজড ক্যান্ডেল রেঞ্জ থিওরি (CRT)। ডেইলি ও উইকলি ক্যান্ডেলের এক্সপ্যানশন এবং প্রেসিসন এন্ট্রি মেকানিক্স।",
    keyPoints: [
      "ক্যান্ডেল ওপেনিং ম্যানিপুলেশন মেকানিক্স (Daily / Weekly Open)",
      "এক্সপ্যানশন ফেজ ও টার্গেট প্রজেকশন কৌশল",
      "হায়ার টাইমফ্রেম CRT-র ভেতর লোয়ার টাইমফ্রেম কনফার্মেশন",
      "ইনভ্যালিডেশন পয়েন্ট ও দ্রুত রিস্ক এক্সিট প্ল্যান",
    ],
    exercise: "১০টি উইকলি CRT ক্যান্ডেল সেটআপ ব্যাকটেস্ট করে টার্গেট হিট রেট রেকর্ড করুন।",
    edge: "CRT মডেল ক্যান্ডেলটি তৈরি হওয়ার আগেই তার সম্ভাব্য মুভমেন্টের একটি পরিষ্কার রোডম্যাপ দেয়।",
  },
  {
    num: "08",
    title: "TIME, SESSION & NEWS",
    category: "TIME & SESSION",
    summary:
      "Trading-এ শুধু price action বুঝলেই হবে না—কখন market active থাকে, কোন session-এ কোন ধরনের movement তৈরি হয় এবং গুরুত্বপূর্ণ news কীভাবে market-এর volatility ও price movement-কে প্রভাবিত করে সেটাও জানা জরুরি। সঠিক timing ও market context বুঝে better trading decisions নেওয়ার foundation তৈরি করুন।",
    keyPoints: [
      "TRADING TIME — Market কখন open, active ও slow থাকে এবং timing কেন গুরুত্বপূর্ণ",
      "MARKET SESSIONS — Asian, London ও New York Session কী এবং প্রতিটি session-এর characteristics",
      "SESSION OVERLAP — London–New York overlap কেন গুরুত্বপূর্ণ এবং liquidity কীভাবে বাড়ে",
      "SESSION HIGH & LOW — Previous session-এর High/Low কীভাবে identify ও monitor করতে হয়",
      "ECONOMIC NEWS — High-impact ও low-impact news কী এবং news-এর গুরুত্ব কীভাবে বুঝতে হয়",
      "NEWS & VOLATILITY — News release-এর আগে ও পরে market volatility কীভাবে পরিবর্তিত হতে পারে",
      "TRADING AROUND NEWS — গুরুত্বপূর্ণ news-এর সময় কখন trade avoid বা সতর্কভাবে manage করতে হয়",
    ],
    exercise: "টানা ৫ দিন Asian, London ও New York Session-এর High/Low mark করুন এবং session change ও গুরুত্বপূর্ণ news release-এর সময় price movement কীভাবে পরিবর্তিত হয় তা chart-এ track করুন।",
    edge: "Price কোথায় যাচ্ছে তার পাশাপাশি কখন move করছে সেটাও গুরুত্বপূর্ণ। Session timing, liquidity এবং high-impact news-এর context বুঝতে পারলে market-এর সম্ভাব্য volatility ও movement সম্পর্কে আরও structured ধারণা পাওয়া যায়।",
  },
  {
    num: "09",
    title: "LOT & LEVERAGE",
    category: "POSITION SIZING",
    summary:
      "Trading-এ কতটুকু position নেওয়া উচিত, Lot কীভাবে কাজ করে এবং Leverage কীভাবে profit ও loss—দুটোকেই প্রভাবিত করে তা বুঝুন। সঠিক position sizing, margin এবং leverage ব্যবহার করে unnecessary risk কমিয়ে controlled trading-এর foundation তৈরি করুন।",
    keyPoints: [
      "LOT কী এবং Lot Size কীভাবে কাজ করে",
      "Leverage কী এবং কেন ব্যবহার করা হয়",
      "Margin, Position Size ও Account Balance-এর সম্পর্ক",
      "Risk অনুযায়ী সঠিক Lot Size নির্বাচন",
    ],
    exercise: "একই setup-এ বিভিন্ন Lot Size ও Leverage ব্যবহার করে সম্ভাব্য Profit, Loss এবং Margin Requirement হিসাব করুন।",
    edge: "ভালো setup থাকলেই যথেষ্ট নয়—সঠিক position size ও controlled leverage-ই একজন trader-এর capital দীর্ঘসময় ধরে টিকিয়ে রাখতে সাহায্য করে।",
  },
  {
    num: "10",
    title: "RISK & MONEY MANAGEMENT",
    category: "SURVIVAL MATHEMATICS",
    summary:
      "একজন trader-এর সবচেয়ে গুরুত্বপূর্ণ skill হলো নিজের capital protect করা। Risk কীভাবে calculate করতে হয়, প্রতি trade-এ কতটুকু risk নেওয়া উচিত এবং account-এর capital কীভাবে দীর্ঘমেয়াদে manage করতে হয়—এসবের মাধ্যমে disciplined money management system তৈরি করুন।",
    keyPoints: [
      "Risk Per Trade ও Risk-to-Reward Ratio",
      "Stop Loss ও Position Size-এর সঠিক ব্যবহার",
      "Drawdown ও Capital Protection",
      "Consistent Risk Management Rules তৈরি",
    ],
    exercise: "একটি নির্দিষ্ট account balance ধরে বিভিন্ন setup-এর জন্য Risk %, Stop Loss এবং Position Size calculate করে একটি consistent risk plan তৈরি করুন।",
    edge: "Profit করা trader হওয়ার চেয়েও গুরুত্বপূর্ণ হলো capital ধরে রাখা। Proper risk management একটি losing streak-এর মধ্যেও account-কে survive করার সুযোগ দেয় এবং long-term consistency তৈরি করে।",
  },
  {
    num: "11",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "SYSTEM & STRATEGY",
    summary:
      "অন্যের strategy কপি না করে নিজের knowledge, market understanding এবং trading experience-এর ওপর ভিত্তি করে একটি unique trading edge তৈরি করুন। Market selection থেকে শুরু করে setup, entry, confirmation, stop loss, take profit, risk management, backtesting এবং execution—সবকিছু মিলিয়ে কীভাবে একটি complete, rule-based এবং repeatable trading system তৈরি করতে হয় তা A to Z শেখানো হবে।",
    keyPoints: [
      "FIND YOUR EDGE — কোন Market, Timeframe ও Setup-এ আপনার advantage তৈরি হচ্ছে তা identify করা",
      "BUILD YOUR SYSTEM — Market condition, setup, confirmation ও execution-এর clear rules তৈরি করা",
      "CREATE YOUR STRATEGY — Entry, Stop Loss, Take Profit ও Risk Management-এর complete framework তৈরি করা",
      "BACKTEST & OPTIMIZE — Historical chart-এ strategy test করে Win Rate, R:R, Drawdown ও Expectancy analyse করা",
      "TRADING PLAYBOOK — সব rules এক জায়গায় লিখে একটি repeatable trading plan তৈরি করা",
      "FORWARD TESTING — Live market-এ controlled risk নিয়ে system-এর real performance যাচাই করা",
      "REFINE & EXECUTE — Data ও performance অনুযায়ী system improve করে consistent execution তৈরি করা",
    ],
    exercise: "নিজের পছন্দের একটি market ও setup নির্বাচন করে complete trading strategy তৈরি করুন। কমপক্ষে 50–100টি historical setup backtest করে Entry, Stop Loss, Take Profit, Win Rate, Risk-to-Reward এবং Drawdown record করুন।",
    edge: "একজন trader-এর আসল advantage কোনো single indicator বা secret setup নয়। নিজের data, rules এবং repeatable process থেকে তৈরি করা measurable edge-ই long-term trading system-এর foundation।",
  },
  {
    num: "12",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "COMPLETE ROADMAP",
    summary:
      "একজন Beginner কীভাবে সঠিকভাবে Market শিখবে, নিজের learning process তৈরি করবে, Trading Journal-এর মাধ্যমে নিজের performance analyse করবে এবং ধাপে ধাপে একজন disciplined, professional ও profitable trader হয়ে উঠবে—এই section-এ সেই complete journey দেখানো হবে। শুধু strategy শেখা নয়, knowledge, practice, execution, review এবং mindset—সবকিছুকে একসাথে নিয়ে একজন complete trader তৈরি করার framework।",
    keyPoints: [
      "MARKET OF LEARNING — Market থেকে কীভাবে শেখা যায়, কী শিখতে হবে এবং কোন knowledge আগে ও কোনটা পরে শেখা উচিত",
      "LEARNING PROCESS — Beginner থেকে advanced level পর্যন্ত structuredভাবে শেখার সঠিক process তৈরি করা",
      "TRADING JOURNAL — প্রতিটি trade কীভাবে journal করতে হয় এবং Entry, Exit, Setup, Risk, Emotion ও Result কীভাবে record করতে হয়",
      "JOURNAL ANALYSIS — নিজের winning ও losing trades review করে ভুল, weakness এবং improvement area identify করা",
      "BUILD TRADING DISCIPLINE — Rules follow করা, patience রাখা এবং emotion-এর পরিবর্তে process অনুযায়ী decision নেওয়া",
      "PROFITABLE TRADER MINDSET — একজন profitable trader-এর thinking, patience, consistency, discipline এবং risk-focused mindset কেমন হওয়া উচিত",
      "FROM BEGINNER TO PROFESSIONAL — Knowledge → Practice → Backtesting → Execution → Journaling → Review → Improvement—এই complete cycle-এর মাধ্যমে professional trading skill তৈরি করা",
      "BECOME CONSISTENT — Profit-এর পেছনে না ছুটে একটি repeatable process ও long-term consistency তৈরি করা",
    ],
    exercise: "একটি complete Trading Journal তৈরি করুন এবং নিয়মিত নিজের trades record করুন। প্রতি সপ্তাহে Journal review করে ভুল, ভালো execution, emotional decisions, risk management এবং overall performance analyse করে পরবর্তী সপ্তাহের জন্য improvement plan তৈরি করুন।",
    edge: "Profitable trader হওয়া মানে শুধু বেশি trade জেতা নয়। একজন professional trader নিজের process, risk, emotion এবং performance নিয়ন্ত্রণ করতে পারে। শেখা → প্রয়োগ → journal → review → improvement—এই continuous cycle-ই একজন Beginner-কে ধীরে ধীরে consistent ও professional trader-এ পরিণত করে।",
  },
];

export const STAGES_DETAILS_BN: StageDetail[] = [
  {
    num: "০১",
    title: "BASIC TRADING UNDERSTANDING",
    category: "মার্কেট বেসিকস",
    summary:
      "Trading কী? কোথা থেকে এসেছে? এবং একজন Beginner-এর কোথা থেকে শুরু করা উচিত?\n\n“আগে MARKET থেকে শেখো, তারপর MARKET থেকে আয় করো।”\n\nTrading-এর শুরু কোথা থেকে?\nTrading-এর Market কত প্রকার?\nTrading শুরু করার আগে কী কী জানতে হয় বা শিখতে হয়?",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "০২",
    title: "CANDLESTICKS",
    category: "চার্ট অ্যানাটমি",
    summary:
      "Market-এর price movement বুঝতে Candlestick হলো অন্যতম গুরুত্বপূর্ণ foundation। একটি candle কীভাবে তৈরি হয়, তার bullish ও bearish behaviour কীভাবে বুঝতে হয় এবং বিভিন্ন candlestick pattern কীভাবে market-এর সম্ভাব্য movement সম্পর্কে ধারণা দেয়—এসব এখান থেকেই শেখা হবে।",
    keyPoints: [
      "Candlestick কীভাবে তৈরি হয়?",
      "BULLISH VS BEARISH",
      "Candlestick Pattern-এর ধরন",
      "01 — SINGLE CANDLE",
      "02 — TWO-CANDLE",
      "03 — MULTI-CANDLE",
      "REVERSAL-TYPE",
    ],
    exercise: "",
    edge: "",
  },
  {
    num: "০৩",
    title: "BASIC MARKET STRUCTURE",
    category: "স্ট্রাকচার কনটেক্সট",
    summary:
      "Market কীভাবে move করে এবং price movement-এর মধ্যে থাকা basic structure কীভাবে বুঝতে হয়—এই section-এ সেটাই শেখা হবে। Market-এর direction, swing এবং price-এর গুরুত্বপূর্ণ movement বুঝে chart পড়ার foundation তৈরি করা হবে।",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "০৪",
    title: "SUPPORT & RESISTANCE",
    category: "KEY REACTION ZONES",
    summary:
      "চার্টজুড়ে এলোমেলো লাইন টানা বন্ধ করে ইন্সটিটিউশনাল স্ট্রাকচার-ভিত্তিক রিয়েল সাপোর্ট ও রেজিস্ট্যান্স লেভেল চিহ্নিত করুন।",
    keyPoints: [
      "মেজর সুইং লেভেলস বনাম মাইনর ইন্ট্রাডে নয়েজ লেভেল",
      "পোলারিটি ফ্লিপ জোন (পূর্ববর্তী রেজিস্ট্যান্স সাপোর্টে রূপান্তর)",
      "ব্রেক অ্যান্ড রিটেস্টের সুনির্দিষ্ট কনফার্মেশন রুলস",
      "সাইকোলজিক্যাল হোল নাম্বার ও ইন্সটিটিউশনাল রিঅ্যাকশন জোন",
    ],
    exercise: "উইকলি চার্টে ৩টি মেজর লেভেল চিহ্নিত করে প্রাইস সেখানে পৌঁছালে কেমন আচরণ করে তা দেখুন।",
    edge: "সাপোর্ট ও রেজিস্ট্যান্স কোনো একক লাইন নয়; এটি হলো সাপ্লাই ও ডিমান্ডের ইন্সটিটিউশনাল জোন।",
  },
  {
    num: "০৫",
    title: "SMART MONEY CONCEPT (SMC) — A TO Z",
    category: "INSTITUTIONAL FOOTPRINT",
    summary:
      "Market-এর Smart Money Concepts একদম basic থেকে advanced level পর্যন্ত A to Z শেখানো হবে, যাতে একজন trader chart-এর structure, liquidity এবং price movement আরও ভালোভাবে বুঝতে পারে।",
    keyPoints: ["A TO Z SMC"],
    exercise: "",
    edge: "",
  },
  {
    num: "০৬",
    title: "আইসিটি (ICT) মডেলস",
    category: "টাইম ও প্রাইস থিওরি",
    summary:
      "ইনার সার্কেল ট্রেডার (ICT) টাইম ও প্রাইস থিওরি, লন্ডন ও নিউইয়র্ক সেশন টাইমিং এবং অ্যালগরিদমিক কিলজোন মাস্টার করুন।",
    keyPoints: [
      "জুডাস সুইং (Judas Swing) ও সেশন ওপেনিং ম্যানিপুলেশন",
      "লন্ডন ওপেন এবং নিউ ইয়র্ক ওপেন কিলজোন টাইমিং",
      "ফিবোনাচ্চি অপটিমাল ট্রেড এন্ট্রি (OTE) মডেল (৬২% - ৭৯%)",
      "পাওয়ার অব ৩ (AMD: Accumulation, Manipulation, Distribution)",
    ],
    exercise: "টানা ৫ দিন নিউ ইয়র্ক সেশনে লন্ডন সেশনের হাই/লো সুইপ কীভাবে রিঅ্যাক্ট করে তা ট্র্যাক করুন।",
    edge: "ট্রেডিংয়ে টাইমিং সবচেয়ে গুরুত্বপূর্ণ। সেরা সেটআপগুলো দিনের নির্দিষ্ট কিলজোনেই তৈরি হয়।",
  },
  {
    num: "০৭",
    title: "সিআরটি (CRT) মডেল",
    category: "সাইকেল সিগনেচার",
    summary:
      "সাইকেল অব চার্টের স্পেশালাইজড ক্যান্ডেল রেঞ্জ থিওরি (CRT)। ডেইলি ও উইকলি ক্যান্ডেলের এক্সপ্যানশন এবং প্রেসিসন এন্ট্রি মেকানিক্স।",
    keyPoints: [
      "ক্যান্ডেল ওপেনিং ম্যানিপুলেশন মেকানিক্স (Daily / Weekly Open)",
      "এক্সপ্যানশন ফেজ ও টার্গেট প্রজেকশন কৌশল",
      "হায়ার টাইমফ্রেম CRT-র ভেতর লোয়ার টাইমফ্রেম কনফার্মেশন",
      "ইনভ্যালিডেশন পয়েন্ট ও দ্রুত রিস্ক এক্সিট প্ল্যান",
    ],
    exercise: "১০টি উইকলি CRT ক্যান্ডেল সেটআপ ব্যাকটেস্ট করে টার্গেট হিট রেট রেকর্ড করুন।",
    edge: "CRT মডেল ক্যান্ডেলটি তৈরি হওয়ার আগেই তার সম্ভাব্য মুভমেন্টের একটি পরিষ্কার রোডম্যাপ দেয়।",
  },
  {
    num: "০৮",
    title: "TIME, SESSION & NEWS",
    category: "টাইম ও সেশন",
    summary:
      "Trading-এ শুধু price action বুঝলেই হবে না—কখন market active থাকে, কোন session-এ কোন ধরনের movement তৈরি হয় এবং গুরুত্বপূর্ণ news কীভাবে market-এর volatility ও price movement-কে প্রভাবিত করে সেটাও জানা জরুরি। সঠিক timing ও market context বুঝে better trading decisions নেওয়ার foundation তৈরি করুন।",
    keyPoints: [
      "TRADING TIME — Market কখন open, active ও slow থাকে এবং timing কেন গুরুত্বপূর্ণ",
      "MARKET SESSIONS — Asian, London ও New York Session কী এবং প্রতিটি session-এর characteristics",
      "SESSION OVERLAP — London–New York overlap কেন গুরুত্বপূর্ণ এবং liquidity কীভাবে বাড়ে",
      "SESSION HIGH & LOW — Previous session-এর High/Low কীভাবে identify ও monitor করতে হয়",
      "ECONOMIC NEWS — High-impact ও low-impact news কী এবং news-এর গুরুত্ব কীভাবে বুঝতে হয়",
      "NEWS & VOLATILITY — News release-এর আগে ও পরে market volatility কীভাবে পরিবর্তিত হতে পারে",
      "TRADING AROUND NEWS — গুরুত্বপূর্ণ news-এর সময় কখন trade avoid বা সতর্কভাবে manage করতে হয়",
    ],
    exercise: "টানা ৫ দিন Asian, London ও New York Session-এর High/Low mark করুন এবং session change ও গুরুত্বপূর্ণ news release-এর সময় price movement কীভাবে পরিবর্তিত হয় তা chart-এ track করুন।",
    edge: "Price কোথায় যাচ্ছে তার পাশাপাশি কখন move করছে সেটাও গুরুত্বপূর্ণ। Session timing, liquidity এবং high-impact news-এর context বুঝতে পারলে market-এর সম্ভাব্য volatility ও movement সম্পর্কে আরও structured ধারণা পাওয়া যায়।",
  },
  {
    num: "০৯",
    title: "LOT & LEVERAGE",
    category: "পজিশন সাইজিং",
    summary:
      "Trading-এ কতটুকু position নেওয়া উচিত, Lot কীভাবে কাজ করে এবং Leverage কীভাবে profit ও loss—দুটোকেই প্রভাবিত করে তা বুঝুন। সঠিক position sizing, margin এবং leverage ব্যবহার করে unnecessary risk কমিয়ে controlled trading-এর foundation তৈরি করুন।",
    keyPoints: [
      "LOT কী এবং Lot Size কীভাবে কাজ করে",
      "Leverage কী এবং কেন ব্যবহার করা হয়",
      "Margin, Position Size ও Account Balance-এর সম্পর্ক",
      "Risk অনুযায়ী সঠিক Lot Size নির্বাচন",
    ],
    exercise: "একই setup-এ বিভিন্ন Lot Size ও Leverage ব্যবহার করে সম্ভাব্য Profit, Loss এবং Margin Requirement হিসাব করুন।",
    edge: "ভালো setup থাকলেই যথেষ্ট নয়—সঠিক position size ও controlled leverage-ই একজন trader-এর capital দীর্ঘসময় ধরে টিকিয়ে রাখতে সাহায্য করে।",
  },
  {
    num: "১০",
    title: "RISK & MONEY MANAGEMENT",
    category: "টিকে থাকার গণিত",
    summary:
      "একজন trader-এর সবচেয়ে গুরুত্বপূর্ণ skill হলো নিজের capital protect করা। Risk কীভাবে calculate করতে হয়, প্রতি trade-এ কতটুকু risk নেওয়া উচিত এবং account-এর capital কীভাবে দীর্ঘমেয়াদে manage করতে হয়—এসবের মাধ্যমে disciplined money management system তৈরি করুন।",
    keyPoints: [
      "Risk Per Trade ও Risk-to-Reward Ratio",
      "Stop Loss ও Position Size-এর সঠিক ব্যবহার",
      "Drawdown ও Capital Protection",
      "Consistent Risk Management Rules তৈরি",
    ],
    exercise: "একটি নির্দিষ্ট account balance ধরে বিভিন্ন setup-এর জন্য Risk %, Stop Loss এবং Position Size calculate করে একটি consistent risk plan তৈরি করুন।",
    edge: "Profit করা trader হওয়ার চেয়েও গুরুত্বপূর্ণ হলো capital ধরে রাখা। Proper risk management একটি losing streak-এর মধ্যেও account-কে survive করার সুযোগ দেয় এবং long-term consistency তৈরি করে।",
  },
  {
    num: "১১",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "সিস্টেম ও স্ট্র্যাটেজি",
    summary:
      "অন্যের strategy কপি না করে নিজের knowledge, market understanding এবং trading experience-এর ওপর ভিত্তি করে একটি unique trading edge তৈরি করুন। Market selection থেকে শুরু করে setup, entry, confirmation, stop loss, take profit, risk management, backtesting এবং execution—সবকিছু মিলিয়ে কীভাবে একটি complete, rule-based এবং repeatable trading system তৈরি করতে হয় তা A to Z শেখানো হবে।",
    keyPoints: [
      "FIND YOUR EDGE — কোন Market, Timeframe ও Setup-এ আপনার advantage তৈরি হচ্ছে তা identify করা",
      "BUILD YOUR SYSTEM — Market condition, setup, confirmation ও execution-এর clear rules তৈরি করা",
      "CREATE YOUR STRATEGY — Entry, Stop Loss, Take Profit ও Risk Management-এর complete framework তৈরি করা",
      "BACKTEST & OPTIMIZE — Historical chart-এ strategy test করে Win Rate, R:R, Drawdown ও Expectancy analyse করা",
      "TRADING PLAYBOOK — সব rules এক জায়গায় লিখে একটি repeatable trading plan তৈরি করা",
      "FORWARD TESTING — Live market-এ controlled risk নিয়ে system-এর real performance যাচাই করা",
      "REFINE & EXECUTE — Data ও performance অনুযায়ী system improve করে consistent execution তৈরি করা",
    ],
    exercise: "নিজের পছন্দের একটি market ও setup নির্বাচন করে complete trading strategy তৈরি করুন। কমপক্ষে 50–100টি historical setup backtest করে Entry, Stop Loss, Take Profit, Win Rate, Risk-to-Reward এবং Drawdown record করুন।",
    edge: "একজন trader-এর আসল advantage কোনো single indicator বা secret setup নয়। নিজের data, rules এবং repeatable process থেকে তৈরি করা measurable edge-ই long-term trading system-এর foundation।",
  },
  {
    num: "১২",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "কমপ্লিট রোডম্যাপ",
    summary:
      "একজন Beginner কীভাবে সঠিকভাবে Market শিখবে, নিজের learning process তৈরি করবে, Trading Journal-এর মাধ্যমে নিজের performance analyse করবে এবং ধাপে ধাপে একজন disciplined, professional ও profitable trader হয়ে উঠবে—এই section-এ সেই complete journey দেখানো হবে। শুধু strategy শেখা নয়, knowledge, practice, execution, review এবং mindset—সবকিছুকে একসাথে নিয়ে একজন complete trader তৈরি করার framework।",
    keyPoints: [
      "MARKET OF LEARNING — Market থেকে কীভাবে শেখা যায়, কী শিখতে হবে এবং কোন knowledge আগে ও কোনটা পরে শেখা উচিত",
      "LEARNING PROCESS — Beginner থেকে advanced level পর্যন্ত structuredভাবে শেখার সঠিক process তৈরি করা",
      "TRADING JOURNAL — প্রতিটি trade কীভাবে journal করতে হয় এবং Entry, Exit, Setup, Risk, Emotion ও Result কীভাবে record করতে হয়",
      "JOURNAL ANALYSIS — নিজের winning ও losing trades review করে ভুল, weakness এবং improvement area identify করা",
      "BUILD TRADING DISCIPLINE — Rules follow করা, patience রাখা এবং emotion-এর পরিবর্তে process অনুযায়ী decision নেওয়া",
      "PROFITABLE TRADER MINDSET — একজন profitable trader-এর thinking, patience, consistency, discipline এবং risk-focused mindset কেমন হওয়া উচিত",
      "FROM BEGINNER TO PROFESSIONAL — Knowledge → Practice → Backtesting → Execution → Journaling → Review → Improvement—এই complete cycle-এর মাধ্যমে professional trading skill তৈরি করা",
      "BECOME CONSISTENT — Profit-এর পেছনে না ছুটে একটি repeatable process ও long-term consistency তৈরি করা",
    ],
    exercise: "একটি complete Trading Journal তৈরি করুন এবং নিয়মিত নিজের trades record করুন। প্রতি সপ্তাহে Journal review করে ভুল, ভালো execution, emotional decisions, risk management এবং overall performance analyse করে পরবর্তী সপ্তাহের জন্য improvement plan তৈরি করুন।",
    edge: "Profitable trader হওয়া মানে শুধু বেশি trade জেতা নয়। একজন professional trader নিজের process, risk, emotion এবং performance নিয়ন্ত্রণ করতে পারে। শেখা → প্রয়োগ → journal → review → improvement—এই continuous cycle-ই একজন Beginner-কে ধীরে ধীরে consistent ও professional trader-এ পরিণত করে।",
  },
];

export type DashboardRoadmapStage = StageDetail & {
  stageNumber: number; // 1 to 12
};

export function getDashboardRoadmapStages(isBn: boolean): DashboardRoadmapStage[] {
  const list = isBn ? STAGES_DETAILS_BN : STAGES_DETAILS_EN;
  return list.map((stage, idx) => ({
    ...stage,
    stageNumber: idx + 1,
  }));
}
