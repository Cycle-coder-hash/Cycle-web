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
      "What is trading? Where did it originate, and where should a beginner start?\n\n“Learn from the market before you attempt to earn from the market.”\n\nUnderstand market types, participants, and the essential foundation required before risking real capital.",
    keyPoints: [
      "Origin and purpose of financial markets",
      "Types of financial markets: Forex, Indices, Commodities, Crypto",
      "Market participants: Central Banks, Institutions, and Retail traders",
      "Essential requirements before placing your first live trade",
    ],
    exercise: "Choose one major pair (e.g. EUR/USD or XAU/USD), observe price movements during market hours, and note down major high/low points without trading.",
    edge: "Professional trading is a probabilistic process, not gambling. Building market literacy before depositing capital protects you from early wipeouts.",
  },
  {
    num: "02",
    title: "CANDLESTICKS",
    category: "CHART ANATOMY",
    summary:
      "Candlesticks are the visual language of price action. Understand how a candle is formed, the interplay of Open, High, Low, and Close (OHLC), and how bullish and bearish momentum reveals institutional intent.",
    keyPoints: [
      "How candlesticks form: Anatomy of Open, High, Low, Close (OHLC)",
      "Bullish vs. Bearish momentum and rejection wicks",
      "Single-candle patterns: Pin bars, engulfing, and indecision candles",
      "Multi-candle sequences and structural momentum",
    ],
    exercise: "Identify 10 clean reversal candles on the 4-hour timeframe and mark the reaction zone immediately preceding each candle.",
    edge: "Never trade candlestick patterns in isolation. Context, market structure, and liquidity zones dictate whether a pattern holds real edge.",
  },
  {
    num: "03",
    title: "BASIC MARKET STRUCTURE",
    category: "STRUCTURE CONTEXT",
    summary:
      "Market structure provides the compass for all price direction. Learn how price creates trending waves, swing highs, swing lows, and structural shifts to trade with market flow rather than against it.",
    keyPoints: [
      "Higher Highs (HH) & Higher Lows (HL) in an uptrend",
      "Lower Highs (LH) & Lower Lows (LL) in a downtrend",
      "Identifying valid swing highs and swing lows",
      "Ranges and consolidation behavior",
    ],
    exercise: "Map out the daily swing structure of EUR/USD or XAU/USD over the past 3 months, highlighting every valid structural swing point.",
    edge: "Trading with higher timeframe market structure keeps you on the same side as institutional order flow.",
  },
  {
    num: "04",
    title: "SUPPORT & RESISTANCE",
    category: "KEY REACTION ZONES",
    summary:
      "Stop drawing random horizontal lines across your chart. Identify institutional support and resistance zones grounded in high-probability reaction levels and supply/demand dynamics.",
    keyPoints: [
      "Major swing levels vs. minor intraday noise",
      "Polarity flips: Prior resistance converting into future support",
      "Break and retest confirmation criteria",
      "Psychological round numbers and institutional reaction zones",
    ],
    exercise: "Mark 3 major weekly levels on your primary asset and observe price interaction and wick behavior upon touching those zones.",
    edge: "Support and resistance are dynamic supply/demand zones, not rigid single lines on a chart.",
  },
  {
    num: "05",
    title: "SMART MONEY CONCEPT (SMC) — A TO Z",
    category: "INSTITUTIONAL FOOTPRINT",
    summary:
      "Master the complete Smart Money Concepts framework from foundation to advanced execution. Learn how institutional algorithms engineer liquidity, initiate sweeps, and leave structural footprints.",
    keyPoints: [
      "Break of Structure (BOS) vs. Change of Character (CHoCH)",
      "Fair Value Gaps (FVG) and market imbalance mitigation",
      "Order Blocks (OB) and institutional sponsorship levels",
      "Buy-side and Sell-side Liquidity Sweeps",
    ],
    exercise: "Locate 5 recent Liquidity Sweeps that led to an immediate Break of Structure and Fair Value Gap formation on the 15-minute chart.",
    edge: "Institutions require counterpart liquidity to enter massive positions. Understanding liquidity sweeps prevents you from becoming their exit liquidity.",
  },
  {
    num: "06",
    title: "ICT MODELS",
    category: "TIME & PRICE THEORY",
    summary:
      "Inner Circle Trader (ICT) time and price theory, session timing, and algorithmic killzones. Master the convergence of precise time windows with institutional price delivery.",
    keyPoints: [
      "Judas Swing and session opening manipulation",
      "London Open and New York Open Killzone windows",
      "Optimal Trade Entry (OTE) Fibonacci model (62% – 79%)",
      "Power of 3 (AMD: Accumulation, Manipulation, Distribution)",
      "Understanding IPDA (Interbank Price Delivery Algorithm): 20/40/60-day lookback ranges and price delivery",
      "Understanding MMXM (Market Maker Model): Market Maker Buy/Sell Model phases and trade application",
    ],
    exercise: "Track the London Open high/low sweep during the New York session for 5 consecutive days and document price reactions.",
    edge: "Timing is everything in institutional trading. High-probability setups form predominantly inside algorithmic killzones.",
  },
  {
    num: "07",
    title: "CRT + TBS",
    category: "CYCLE SIGNATURE",
    summary:
      "Cycle of Chart's specialized Candle Range Theory (CRT). Understand daily and weekly candle expansion, true open manipulation, and precision execution mechanics.",
    keyPoints: [
      "Candle opening manipulation mechanics (Daily and Weekly Open)",
      "Expansion phase and algorithmic target projections",
      "Lower timeframe confirmation within Higher Timeframe CRT envelopes",
      "Structural invalidation levels and swift risk containment",
    ],
    exercise: "Backtest 10 weekly CRT candle setups and record the target hit rate and drawdown profile.",
    edge: "CRT provides a deterministic roadmap for the prospective candle before the expansion leg initiates.",
  },
  {
    num: "08",
    title: "TIME, SESSION & NEWS",
    category: "TIMING & SESSIONS",
    summary:
      "Technical price action alone is incomplete without time context. Learn session characteristics, overlap liquidity, and how macroeconomic news releases drive market volatility.",
    keyPoints: [
      "Market session hours: Asian, London, and New York characteristics",
      "London–New York session overlap liquidity injection",
      "Monitoring previous session highs and lows",
      "High-impact macroeconomic data (CPI, NFP, FOMC, Interest Rates)",
      "Risk mitigation and execution rules around high-impact news",
    ],
    exercise: "Mark Asian, London, and New York session high/low boundaries for 5 trading sessions and observe session transitions.",
    edge: "When price moves is just as vital as where price moves. Session timing combined with liquidity context elevates execution precision.",
  },
  {
    num: "09",
    title: "LOT & LEVERAGE",
    category: "POSITION SIZING",
    summary:
      "Understand contract specifications, standard/mini/micro lots, and how financial leverage impacts margin, profit, and loss. Eliminate oversized gambling risk through disciplined sizing.",
    keyPoints: [
      "Contract definitions and Lot Size mechanics",
      "Financial leverage and margin calculation",
      "Relationship between account balance, lot size, and stop loss pips",
      "Mathematical formula for controlled risk per trade",
    ],
    exercise: "Calculate the exact lot size required for 1% risk on a $5,000 account across 20-pip, 35-pip, and 50-pip stop loss scenarios.",
    edge: "Edge is meaningless if poor lot sizing blows your account. Controlled leverage protects your trading longevity.",
  },
  {
    num: "10",
    title: "RISK & MONEY MANAGEMENT",
    category: "SURVIVAL MATHEMATICS",
    summary:
      "The paramount skill of any professional trader is capital preservation. Establish an unyielding risk protocol, manage drawdowns, and build mathematical expectancy.",
    keyPoints: [
      "Strict 1% – 2% Risk Per Trade rule",
      "Minimum 1:2 and 1:3 Risk:Reward expectancy",
      "Managing drawdowns and psychological reset rules",
      "Trailing stops, partial profit scaling, and capital defense",
    ],
    exercise: "Draft your personal written Risk Management Rules including maximum daily loss limits and maximum weekly drawdown thresholds.",
    edge: "Surviving a losing streak with your capital intact allows mathematical edge to compound over hundreds of executions.",
  },
  {
    num: "11",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "SYSTEM & STRATEGY",
    summary:
      "Stop copying external signals. Construct an authentic, rule-based, and repeatable trading system aligned with your personality, schedule, and institutional edge.",
    keyPoints: [
      "Define your advantage: Chosen pairs, timeframes, and specific setups",
      "Unambiguous entry, stop loss, and take profit rules",
      "Backtesting and forward testing methodology",
      "Quantifying win rate, average R:R, drawdown, and expectancy",
      "Constructing a formal Trading Playbook",
    ],
    exercise: "Backtest a single setup across at least 50 historical charts and log Entry, Stop Loss, Target, and R:R outcome into your journal.",
    edge: "True trading confidence originates from verified historical data, strictly defined rules, and personal execution mastery.",
  },
  {
    num: "12",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "COMPLETE ROADMAP",
    summary:
      "The complete professional transformation roadmap: Knowledge → Practice → Backtesting → Execution → Journaling → Review → Refinement. Cultivate an institutional trader mindset.",
    keyPoints: [
      "Structured learning progression from foundational to algorithmic",
      "Daily trade journaling: Documenting setup, risk, emotion, and outcome",
      "Weekly journal review to identify leakages and behavioral traps",
      "Emotional detachment, patience, and non-negotiable discipline",
      "Focusing on process excellence over monetary vanity",
    ],
    exercise: "Maintain a complete trading journal for 20 consecutive live or demo trades and complete a comprehensive weekend performance audit.",
    edge: "A professional trader masters self-regulation, risk parameters, and continuous improvement. The continuous journal-review cycle is where mastery is forged.",
  },
];

export const STAGES_DETAILS_BN: StageDetail[] = [
  {
    num: "০১",
    title: "BASIC TRADING UNDERSTANDING",
    category: "মার্কেট বেসিকস",
    summary:
      "Trading কী? কোথা থেকে এসেছে? এবং একজন Beginner-এর কোথা থেকে শুরু করা উচিত?\n\n“আগে MARKET থেকে শেখো, তারপর MARKET থেকে আয় করো।”\n\nTrading-এর শুরু কোথা থেকে?\nTrading-এর Market কত প্রকার?\nTrading শুরু করার আগে কী কী জানতে হয় বা শিখতে হয়?",
    keyPoints: [
      "ট্রেডিংয়ের সূচনা ও আর্থিক বাজারের মূল উদ্দেশ্য",
      "মার্কেটের প্রকারভেদ: Forex, Indices, Commodities, Crypto",
      "মার্কেট পার্টিসিপেন্টস: সেন্ট্রাল ব্যাংক, ইন্সটিটিউশন ও রিটেইল ট্রেডার",
      "লাইভ ট্রেড শুরু করার আগে আবশ্যিক পূর্বশর্তসমূহ",
    ],
    exercise: "একটি প্রধান পেয়ার নির্বাচন করে মার্কেট আওয়ারে প্রাইস মুভমেন্ট পর্যবেক্ষণ করুন এবং ট্রেড না নিয়ে শুধু সুইং হাই/লো পয়েন্টগুলো নোট করুন।",
    edge: "ট্রেডিং কোনো জুয়া নয়, এটি একটি সম্ভাব্যতা ও সুনির্দিষ্ট নিয়মের খেলা। ডিপোজিট করার আগে মার্কেট লিটারেসি গড়ে তুলুন।",
  },
  {
    num: "০২",
    title: "CANDLESTICKS",
    category: "চার্ট অ্যানাটমি",
    summary:
      "Market-এর price movement বুঝতে Candlestick হলো অন্যতম গুরুত্বপূর্ণ foundation। একটি candle কীভাবে তৈরি হয়, তার bullish ও bearish behaviour কীভাবে বুঝতে হয় এবং বিভিন্ন candlestick pattern কীভাবে market-এর সম্ভাব্য movement সম্পর্কে ধারণা দেয়—এসব এখান থেকেই শেখা হবে।",
    keyPoints: [
      "Candlestick কীভাবে তৈরি হয়: Open, High, Low, Close (OHLC)",
      "Bullish বনাম Bearish মোমেন্টাম ও রিজেকশন উইক",
      "সিঙ্গেল ক্যান্ডেলস্টিক প্যাটার্ন: পিনবার, এনগালফিং ও ইনডিসিশন ক্যান্ডেল",
      "মাল্টি-ক্যান্ডেল সিকোয়েন্স ও স্ট্রাকচারাল রিভার্সাল",
    ],
    exercise: "৪-ঘণ্টার টাইমফ্রেমে ১০টি স্পষ্ট রিভার্সাল ক্যান্ডেল চিহ্নিত করুন এবং প্রতিটির আগের রিঅ্যাকশন জোন মার্ক করুন।",
    edge: "কখনোই বিচ্ছিন্নভাবে ক্যান্ডেলস্টিক প্যাটার্ন ট্রেড করবেন না। মার্কেট স্ট্রাকচার ও লিকুইডিটি কনটেক্সটই আসল এজ প্রদান করে।",
  },
  {
    num: "০৩",
    title: "BASIC MARKET STRUCTURE",
    category: "স্ট্রাকচার কনটেক্সট",
    summary:
      "Market কীভাবে move করে এবং price movement-এর মধ্যে থাকা basic structure কীভাবে বুঝতে হয়—এই section-এ সেটাই শেখা হবে। Market-এর direction, swing এবং price-এর গুরুত্বপূর্ণ movement বুঝে chart পড়ার foundation তৈরি করা হবে।",
    keyPoints: [
      "আপট্রেন্ডে Higher Highs (HH) ও Higher Lows (HL)",
      "ডাউনট্রেন্ডে Lower Highs (LH) ও Lower Lows (LL)",
      "ভ্যালিড সুইং হাই ও সুইং লো চিহ্নিতকরণ",
      "রেঞ্জ মার্কেট ও কনসোলিডেশন আচরণ",
    ],
    exercise: "বিগত ৩ মাসের EUR/USD বা XAU/USD ডেইলি চার্টে প্রতি সুইং পয়েন্ট সঠিকভাবে ম্যাপিং করুন।",
    edge: "হায়ার টাইমফ্রেম মার্কেট স্ট্রাকচারের সাথে ট্রেড করা আপনাকে সবসময় প্রাতিষ্ঠানিক ফ্লো-এর অনুকূলে রাখে।",
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
    keyPoints: [
      "Break of Structure (BOS) বনাম Change of Character (CHoCH)",
      "Fair Value Gap (FVG) ও মার্কেট ইমব্যালেন্স মিটিগেশন",
      "Order Block (OB) ও প্রাতিষ্ঠানিক স্পনসরশিপ লেভেল",
      "বাই-সাইড ও সেল-সাইড Liquidity Sweeps",
    ],
    exercise: "১৫-মিনিট চার্টে এমন ৫টি সাম্প্রতিক লিকুইডিটি সুইপ খুঁজুন যা তাৎক্ষণিক BOS ও FVG তৈরি করেছে।",
    edge: "বড় প্রতিষ্ঠানগুলো বড় অর্ডার এক্সিকিউট করতে লিকুইডিটি হান্ট করে। এটি বুঝলে আপনি ফাঁদে পড়া থেকে বাঁচবেন।",
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
      "IPDA (Interbank Price Delivery Algorithm) বোঝা: ২০/৪০/৬০ দিনের লুকব্যাক রেঞ্জ ও প্রাইস ডেলিভারির ধারণা",
      "MMXM (Market Maker Model) বোঝা: মার্কেট মেকার বাই/সেল মডেলের ধাপ ও ট্রেডে প্রয়োগ",
    ],
    exercise: "টানা ৫ দিন নিউ ইয়র্ক সেশনে লন্ডন সেশনের হাই/লো সুইপ কীভাবে রিঅ্যাক্ট করে তা ট্র্যাক করুন।",
    edge: "ট্রেডিংয়ে টাইমিং সবচেয়ে গুরুত্বপূর্ণ। সেরা সেটআপগুলো দিনের নির্দিষ্ট কিলজোনেই তৈরি হয়।",
  },
  {
    num: "০৭",
    title: "CRT + TBS",
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
      "Trading-এ শুধু price action বুঝলেই হবে না—কখন market active থাকে, কোন session-এ কোন ধরনের movement তৈরি হয় এবং গুরুত্বপূর্ণ news কীভাবে market-এর volatility ও price movement-কে প্রভাবিত করে সেটাও জানা জরুরি।",
    keyPoints: [
      "TRADING TIME — Market কখন open, active ও slow থাকে",
      "MARKET SESSIONS — Asian, London ও New York Session-এর বৈশিষ্ট্য",
      "SESSION OVERLAP — London–New York overlap কেন গুরুত্বপূর্ণ",
      "SESSION HIGH & LOW — Previous session-এর High/Low মনিটরিং",
      "ECONOMIC NEWS — হাই-ইমপ্যাক্ট নিউজ রিলিজ ও রিস্ক প্রটোকল",
    ],
    exercise: "টানা ৫ দিন সেশন ওপেনিং হাই/লো মার্ক করুন এবং নিউজ রিলিজের সময়ের প্রাইস অ্যাকশন ট্র্যাক করুন।",
    edge: "Price কোথায় যাচ্ছে তার পাশাপাশি কখন move করছে সেটাও সমান গুরুত্বপূর্ণ।",
  },
  {
    num: "০৯",
    title: "LOT & LEVERAGE",
    category: "পজিশন সাইজিং",
    summary:
      "Trading-এ কতটুকু position নেওয়া উচিত, Lot কীভাবে কাজ করে এবং Leverage কীভাবে profit ও loss—দুটোকেই প্রভাবিত করে তা বুঝুন। সঠিক position sizing, margin এবং leverage ব্যবহার করে অপ্রয়োজনীয় ঝুঁকি নির্মূল করুন।",
    keyPoints: [
      "LOT কী এবং Lot Size কীভাবে কাজ করে",
      "Leverage কী এবং মার্জিনের সঠিক ব্যবহার",
      "Margin, Position Size ও Account Balance-এর গাণিতিক সম্পর্ক",
      "রিস্ক পার্সেন্টেজ অনুযায়ী সুনির্দিষ্ট Lot Size ক্যালকুলেশন",
    ],
    exercise: "একটি $৫,০০০ অ্যাকাউন্টে ১% রিস্কের জন্য ২০-পিপ এবং ৫০-পিপ স্টপ লসে লট সাইজ হিসাব করুন।",
    edge: "সঠিক পজিশন সাইজ ও নিয়ন্ত্রিত লেভারেজ একজন ট্রেডারের মূলধন দীর্ঘমেয়াদে টিকিয়ে রাখার মূল চাবিকাঠি।",
  },
  {
    num: "১০",
    title: "RISK & MONEY MANAGEMENT",
    category: "টিকে থাকার গণিত",
    summary:
      "একজন trader-এর সবচেয়ে গুরুত্বপূর্ণ skill হলো নিজের capital protect করা। Risk কীভাবে calculate করতে হয়, প্রতি trade-এ কতটুকু risk নেওয়া উচিত এবং account-এর capital কীভাবে দীর্ঘমেয়াদে manage করতে হয় তা শিখুন।",
    keyPoints: [
      "Risk Per Trade (১% - ২% কঠোর রুল)",
      "মিনিমাম ১:২ বা ১:৩ Risk:Reward এক্সপেক্ট্যান্সি",
      "Drawdown কন্ট্রোল ও সাইকোলজিক্যাল রিসেট মেকানিজম",
      "ট্রেইলিং স্টপ লস ও ক্যাপিটাল সুরক্ষা স্ট্র্যাটেজি",
    ],
    exercise: "একটি নির্দিষ্ট account balance ধরে বিভিন্ন setup-এর জন্য Risk %, Stop Loss এবং Position Size calculate করে একটি consistent risk plan তৈরি করুন।",
    edge: "Profit করার চেয়েও গুরুত্বপূর্ণ হলো capital ধরে রাখা। Proper risk management দীর্ঘমেয়াদী সফলতার ভিত্তি।",
  },
  {
    num: "১১",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "সিস্টেম ও স্ট্র্যাটেজি",
    summary:
      "অন্যের strategy কপি না করে নিজের knowledge, market understanding এবং trading experience-এর ওপর ভিত্তি করে একটি unique trading edge তৈরি করুন।",
    keyPoints: [
      "FIND YOUR EDGE — কোন Market ও Setup-এ আপনার সুবিধা তৈরি হচ্ছে তা চিহ্নিত করা",
      "BUILD YOUR SYSTEM — স্পষ্ট এন্ট্রি, কনফার্মেশন ও এক্সিট রুলস তৈরি করা",
      "BACKTEST & OPTIMIZE — হিস্টোরিক্যাল ডেটাতে উইনরেট ও ড্রডাউন যাচাই করা",
      "TRADING PLAYBOOK — সুনির্দিষ্ট রুলস এক জায়গায় লিখে রিপিটেবল প্ল্যান তৈরি করা",
    ],
    exercise: "কমপক্ষে ৫০-১০০টি হিস্টোরিক্যাল সেটআপ ব্যাকটেস্ট করে উইন রেট ও রিস্ক-রিওয়ার্ড রেকর্ড করুন।",
    edge: "নিজের ডেটা ও রুলস থেকে তৈরি করা সুনির্দিষ্ট এজই আসল প্রাতিষ্ঠানিক সুবিধা।",
  },
  {
    num: "১২",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "কমপ্লিট রোডম্যাপ",
    summary:
      "একজন Beginner কীভাবে ধাপে ধাপে একজন disciplined, professional ও profitable trader হয়ে উঠবে—এই section-এ সেই complete journey দেখানো হয়েছে।",
    keyPoints: [
      "স্ট্রাকচার্ড লার্নিং সাইকেল: জ্ঞান → ব্যাকটেস্টিং → লাইভ এক্সিকিউশন",
      "TRADING JOURNAL — প্রতিটি ট্রেডের সেটআপ, রিস্ক ও ইমোশন রেকর্ড করা",
      "JOURNAL ANALYSIS — উইনিং ও লুজিং ট্রেড নিয়মিত রিভিউ করে ভুল সংশোধন",
      "ইমোশন নিয়ন্ত্রণ ও প্রসেস-ভিত্তিক সিদ্ধান্ত গ্রহণের মানসিকতা",
    ],
    exercise: "একটি সম্পূর্ণ ট্রেডিং জার্নাল তৈরি করুন এবং টানা ২০টি ট্রেড রেকর্ড করে উইকেন্ডে পারফরম্যান্স অডিট করুন।",
    edge: "প্রফেশনাল ট্রেডার হওয়া মানে বেশি ট্রেড জেতা নয়; বরং নিজের প্রসেস, রিস্ক ও ইমোশনকে শতভাগ নিয়ন্ত্রণ করা।",
  },
];

export const STAGES_DETAILS_UR: StageDetail[] = [
  {
    num: "01",
    title: "BASIC TRADING UNDERSTANDING",
    category: "مارکیٹ کی بنیادی باتیں",
    summary:
      "ٹریڈنگ کیا ہے؟ یہ کہاں سے شروع ہوئی، اور ایک مبتدی کو کہاں سے آغاز کرنا چاہیے؟\n\n“پہلے مارکیٹ سے سیکھیں، پھر مارکیٹ سے کمانے کا سوچیں۔”\n\nمارکیٹ کی اقسام، حصہ داروں، اور حقیقی سرمایہ لگانے سے پہلے درکار بنیادی اصولوں کو سمجھیں۔",
    keyPoints: [
      "مالیاتی مارکیٹوں کا آغاز اور بنیادی مقصد",
      "مارکیٹ کی اقسام: Forex, Indices, Commodities, Crypto",
      "مارکیٹ کے حصہ دار: مرکزی بینک، ادارے، اور ریٹیل ٹریڈرز",
      "پہلی لائیو ٹریڈ سے پہلے درکار ضروری شرائط",
    ],
    exercise: "ایک بڑا کرنسی پیئر منتخب کریں (مثلاً EUR/USD یا XAU/USD) اور بغیر ٹریڈ لیے لائیو مارکیٹ میں ہائی اور لو پوائنٹس نوٹ کریں۔",
    edge: "پیشہ ورانہ ٹریڈنگ ایک باقاعدہ نظام ہے، جوا نہیں۔ ڈپازٹ کرنے سے پہلے مارکیٹ کا علم حاصل کرنا آپ کو نقصانات سے محفوظ رکھتا ہے۔",
  },
  {
    num: "02",
    title: "CANDLESTICKS",
    category: "چارٹ ایناٹمی",
    summary:
      "کینڈل اسٹکس پرائس ایکشن کی بنیادی زبان ہیں۔ سمجھیں کہ ایک کینڈل کیسے بنتی ہے، Open, High, Low, Close (OHLC) کا آپسی تعلق کیا ہے اور ادارہ جاتی ارادے کس طرح ظاہر ہوتے ہیں۔",
    keyPoints: [
      "کینڈل کی تشکیل: Open, High, Low, Close (OHLC) کی ایناٹمی",
      "Bullish اور Bearish مومینٹم اور ریجیکشن وکس (Wicks)",
      "سنگل کینڈل پیٹرنز: پن بار، انگلفنگ، اور ان ڈیسیشن کینڈلز",
      "ملٹی کینڈل سیکوئنس اور اسٹرکچرل ریورسلز",
    ],
    exercise: "4 گھنٹے کے ٹائم فریم پر 10 واضح ریورسل کینڈلز تلاش کریں اور ان سے پہلے کے ری ایکشن زون کو نشان زد کریں۔",
    edge: "کبھی بھی کینڈل اسٹک پیٹرنز کو تنہا ٹریڈ نہ کریں۔ مارکیٹ اسٹرکچر اور لیکویڈیٹی کا سیاق و سباق ہی اصل برتری دیتا ہے۔",
  },
  {
    num: "03",
    title: "BASIC MARKET STRUCTURE",
    category: "اسٹرکچر کا تناظر",
    summary:
      "مارکیٹ اسٹرکچر قیمت کی سمت کے لیے قطب نما ہے۔ سیکھیں کہ قیمت کس طرح سوئنگ ہائی، سوئنگ لو اور اسٹرکچرل شفٹس بناتی ہے تاکہ آپ مارکیٹ کے بہاؤ کے ساتھ چل سکیں۔",
    keyPoints: [
      "اپ ٹرینڈ میں Higher Highs (HH) اور Higher Lows (HL)",
      "ڈاؤن ٹرینڈ میں Lower Highs (LH) اور Lower Lows (LL)",
      "درست سوئنگ ہائی اور سوئنگ لو کی نشاندہی",
      "رینج مارکیٹ اور کنسولیڈیشن کا رویہ",
    ],
    exercise: "گزشتہ 3 ماہ کے ڈیلی چارٹ پر ہر درست سوئنگ پوائنٹ کو میپ کریں۔",
    edge: "ہائر ٹائم فریم اسٹرکچر کے ساتھ ٹریڈ کرنا آپ کو ہمیشہ ادارہ جاتی بہاؤ کی سمت میں رکھتا ہے۔",
  },
  {
    num: "04",
    title: "SUPPORT & RESISTANCE",
    category: "اہم ری ایکشن زونز",
    summary:
      "چارٹ پر بے مقصد لکیریں کھینچنا بند کریں اور ادارہ جاتی اسٹرکچر پر مبنی حقیقی سپورٹ اور ریزسٹنس زونز کی نشاندہی کریں۔",
    keyPoints: [
      "بڑے سوئنگ لیولز بمقابلہ معمولی انٹرا ڈے شور",
      "پولیرٹی فلپ: سابقہ ریزسٹنس کا بعد میں سپورٹ میں تبدیل ہونا",
      "بریک اور ری ٹیسٹ کی تصدیقی شرائط",
      "نفسیاتی گول نمبرز اور ادارہ جاتی ردعمل کے زونز",
    ],
    exercise: "ویکلی چارٹ پر 3 اہم لیولز نشان زد کریں اور قیمت وہاں پہنچنے پر کینڈل کا رویہ دیکھیں۔",
    edge: "سپورٹ اور ریزسٹنس کوئی ایک لکیر نہیں، بلکہ سپلائی اور ڈیمانڈ کے ادارہ جاتی زونز ہیں۔",
  },
  {
    num: "05",
    title: "SMART MONEY CONCEPT (SMC) — A TO Z",
    category: "ادارہ جاتی نقوش",
    summary:
      "اسمارٹ منی کانسیپٹس کا مکمل فریم ورک بنیادی سے ایڈوانسڈ سطح تک سیکھیں۔ سمجھیں کہ کس طرح الگورتھمز لیکویڈیٹی تلاش کرتے ہیں اور چارٹ پر نشان چھوڑتے ہیں۔",
    keyPoints: [
      "Break of Structure (BOS) بمقابلہ Change of Character (CHoCH)",
      "Fair Value Gap (FVG) اور مارکیٹ کے عدم توازن کو پورا کرنا",
      "Order Block (OB) اور ادارہ جاتی اسپانسرشپ لیولز",
      "بائی سائیڈ اور سیل سائیڈ Liquidity Sweeps",
    ],
    exercise: "15 منٹ کے چارٹ پر 5 حالیہ لیکویڈیٹی سوئپس تلاش کریں جن کے بعد فوری BOS اور FVG بنا ہو۔",
    edge: "بڑے ادارے بڑے آرڈرز کے لیے لیکویڈیٹی سویپ کرتے ہیں۔ اسے سمجھ کر آپ ان کے جال سے بچ سکتے ہیں۔",
  },
  {
    num: "06",
    title: "ICT MODELS",
    category: "وقت اور قیمت کی تھیوری",
    summary:
      "انر سرکل ٹریڈر (ICT) وقت اور قیمت کی تھیوری، سیشنز کی ٹائمنگ اور الگورتھمک کل زونز میں مہارت حاصل کریں۔",
    keyPoints: [
      "Judas Swing اور سیشن اوپننگ کی ہیرا پھیری",
      "لندن اوپن اور نیویارک اوپن کل زون کی ٹائمنگ",
      "فیبوناچی Optimal Trade Entry (OTE) ماڈل (62% – 79%)",
      "پاور آف 3 (AMD: Accumulation, Manipulation, Distribution)",
      "IPDA (Interbank Price Delivery Algorithm) کو سمجھنا: 20/40/60 دن کی لُک بیک رینجز اور پرائس ڈیلیوری کا تصور",
      "MMXM (Market Maker Model) کو سمجھنا: مارکیٹ میکر بائی/سیل ماڈل کے مراحل اور ٹریڈ میں اطلاق",
    ],
    exercise: "مسلسل 5 دن نیویارک سیشن کے دوران لندن سیشن کے ہائی/لو سویپ پر مارکیٹ کا ردعمل ٹریک کریں۔",
    edge: "ٹریڈنگ میں ٹائمنگ سب سے اہم ہے۔ بہترین سیٹ اپس دن کے مخصوص کل زونز میں ہی بنتے ہیں۔",
  },
  {
    num: "07",
    title: "CRT + TBS",
    category: "سائیکل سگنیچر",
    summary:
      "سائیکل آف چارٹ کی خصوصی کینڈل رینج تھیوری (CRT)۔ ڈیلی اور ویکلی کینڈل کی توسیع اور درست انٹری کے میکانکس کو سمجھیں۔",
    keyPoints: [
      "کینڈل اوپننگ میکانکس (Daily / Weekly Open)",
      "توسیعی مرحلہ اور ٹارگٹ پروجیکشن",
      "ہائر ٹائم فریم CRT کے اندر لوئر ٹائم فریم کی تصدیق",
      "ان ویلیڈیشن پوائنٹس اور فوری رسک مینجمنٹ",
    ],
    exercise: "10 ویکلی CRT کینڈل سیٹ اپس بیک ٹیسٹ کریں اور ٹارگٹ ہٹ ریٹ نوٹ کریں۔",
    edge: "CRT ماڈل کینڈل بننے سے پہلے ہی اس کی ممکنہ حرکت کا ایک واضح روڈ میپ فراہم کرتا ہے۔",
  },
  {
    num: "08",
    title: "TIME, SESSION & NEWS",
    category: "ٹائم اور سیشنز",
    summary:
      "صرف پرائس ایکشن کافی نہیں، وقت کا سیاق و سباق بھی ضروری ہے۔ سیکھیں کہ کون سا سیشن کیسی حرکت پیدا کرتا ہے اور اہم معاشی خبریں کس طرح مارکیٹ پر اثر انداز ہوتی ہیں۔",
    keyPoints: [
      "ٹریڈنگ ٹائم: مارکیٹ کب متحرک اور کب سست ہوتی ہے",
      "مارکیٹ سیشنز: Asian, London, اور New York کی خصوصیات",
      "سیشن اوورلیپ: London–New York اوورلیپ میں لیکویڈیٹی کا اضافہ",
      "پچھلے سیشن کے High اور Low کی مانیٹرنگ",
      "ہائی امپیکٹ معاشی خبریں اور رسک پروٹوکولز",
    ],
    exercise: "5 دن تک سیشنز کے ہائی اور لو نشان زد کریں اور خبروں کے اجرا کے وقت پرائس ایکشن کا جائزہ لیں۔",
    edge: "قیمت کہاں جا رہی ہے کے ساتھ ساتھ یہ بھی اہم ہے کہ وہ کب حرکت کر رہی ہے۔",
  },
  {
    num: "09",
    title: "LOT & LEVERAGE",
    category: "پوزیشن سائزنگ",
    summary:
      "سمجھیں کہ ٹریڈنگ میں کتنی پوزیشن لینی چاہیے، لاٹ کیسے کام کرتی ہے اور لیوریج نفع و نقصان پر کس طرح اثر انداز ہوتی ہے۔ غیر ضروری خطرہ ختم کریں۔",
    keyPoints: [
      "لاٹ کیا ہے اور لاٹ سائز کیسے کام کرتا ہے",
      "لیوریج اور مارجن کا باقاعدہ استعمال",
      "مارجن، پوزیشن سائز اور اکاؤنٹ بیلنس کا تعلق",
      "رسک فیصد کے مطابق درست لاٹ سائز کا حساب",
    ],
    exercise: "$5,000 کے اکاؤنٹ پر 1% رسک کے تحت 20 پپس اور 50 پپس اسٹاپ لاس کے لیے لاٹ سائز کا حساب لگائیں۔",
    edge: "درست پوزیشن سائز اور کنٹرول شدہ لیوریج ہی ایک ٹریڈر کے سرمائے کو طویل عرصے تک محفوظ رکھتی ہے۔",
  },
  {
    num: "10",
    title: "RISK & MONEY MANAGEMENT",
    category: "بقا کی ریاضی",
    summary:
      "ایک پیشہ ور ٹریڈر کی سب سے اہم صلاحیت اپنے سرمائے کا تحفظ ہے۔ رسک مینجمنٹ کا سخت اصول بنائیں اور طویل مدتی نظم و ضبط قائم کریں۔",
    keyPoints: [
      "سخت 1% – 2% رسک فی ٹریڈ کا اصول",
      "کم از کم 1:2 یا 1:3 کا Risk:Reward تناسب",
      "ڈرا ڈاؤن کنٹرول اور نفسیاتی بحالی",
      "ٹریلنگ اسٹاپ لاس اور کیپیٹل پروٹیکشن کی حکمت عملی",
    ],
    exercise: "اپنے لیے تحریری رسک مینجمنٹ رولز بنائیں جن میں زیادہ سے زیادہ یومیہ اور ہفتہ وار نقصان کی حد مقرر ہو۔",
    edge: "نقصان کے سلسلے میں بھی اپنے سرمائے کو بچانا ہی طویل مدتی کامیابی کا راز ہے۔",
  },
  {
    num: "11",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "سسٹم اور حکمت عملی",
    summary:
      "دوسروں کی حکمت عملی نقل کرنا بند کریں۔ اپنے علم اور مارکیٹ کے فہم کی بنیاد پر ایک منفرد، باقاعدہ اور بار بار دہرائے جانے والا ٹریڈنگ سسٹم بنائیں۔",
    keyPoints: [
      "اپنی برتری تلاش کریں: پیئرز، ٹائم فریمز اور مخصوص سیٹ اپس",
      "انٹری، کنفرمیشن اور ایگزٹ کے واضح اصول",
      "بیک ٹیسٹنگ اور فارورڈ ٹیسٹنگ کا طریقہ کار",
      "ون ریٹ اور رسک ٹو ریوارڈ کا تجزیہ",
      "ٹریڈنگ پلے بک کی تیاری",
    ],
    exercise: "کم از کم 50 سے 100 تاریخی سیٹ اپس بیک ٹیسٹ کریں اور نتائج کو ریکارڈ کریں۔",
    edge: "اپنے ڈیٹا اور اصولوں سے حاصل کردہ برتری ہی طویل مدتی ٹریڈنگ کا اصل ستون ہے۔",
  },
  {
    num: "12",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "مکمل روڈ میپ",
    summary:
      "مبتدی سے پیشہ ور اور منافع بخش ٹریڈر بننے کا مکمل سفر: علم → مشق → بیک ٹیسٹنگ → لائیو عمل درآمد → جرنلنگ → جائزہ → بہتری۔",
    keyPoints: [
      "منظم طریقہ کار: علم حاصل کرنا اور درست ٹریڈنگ کی مشق",
      "TRADING JOURNAL: ہر ٹریڈ کے سیٹ اپ، رسک اور جذبات کا ریکارڈ",
      "JOURNAL ANALYSIS: جیتنے والی اور ہارنے والی ٹریڈز کا باقاعدہ جائزہ",
      "جذباتی کنٹرول اور نتائج کے بجائے عمل پر توجہ",
    ],
    exercise: "ایک مکمل ٹریڈنگ جرنل بنائیں اور مسلسل 20 ٹریڈز کا ریکارڈ رکھ کر ہفتے کے اختتام پر جائزہ لیں۔",
    edge: "ایک پیشہ ور ٹریڈر اپنے جذبات، رسک اور نظام پر مکمل کنٹرول رکھتا ہے۔ جرنلنگ ہی اس کا سب سے بڑا ہتھیار ہے۔",
  },
];

export type DashboardRoadmapStage = StageDetail & {
  stageNumber: number; // 1 to 12
};

export function getDashboardRoadmapStages(langOrIsBn: string | boolean = "en"): DashboardRoadmapStage[] {
  let list = STAGES_DETAILS_EN;
  if (langOrIsBn === true || langOrIsBn === "bn") {
    list = STAGES_DETAILS_BN;
  } else if (langOrIsBn === "ur") {
    list = STAGES_DETAILS_UR;
  }
  return list.map((stage, idx) => ({
    ...stage,
    stageNumber: idx + 1,
  }));
}
