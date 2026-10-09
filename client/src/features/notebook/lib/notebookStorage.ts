import { NotebookTemplate, NotebookPage, NotebookUserData, ContentBlock } from "@/types/notebook";

const DB_NAME = "CycleTraderNotebookDB";
const DB_VERSION = 1;
const STORE_NAME = "user_notebooks";

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "userId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function createDefaultSeedData(userId: string): NotebookUserData {
  const t1Id = `tmpl_ict_${Date.now()}`;
  const t2Id = `tmpl_psych_${Date.now() + 1}`;

  const p1Id = `page_liq_${Date.now()}`;
  const p1Sub1Id = `page_bsl_${Date.now() + 1}`;
  const p1Sub2Id = `page_ssl_${Date.now() + 2}`;

  const p2Id = `page_struct_${Date.now() + 3}`;
  const p2Sub1Id = `page_bos_${Date.now() + 4}`;
  const p2Sub2Id = `page_choch_${Date.now() + 5}`;

  const p3Id = `page_fvg_${Date.now() + 6}`;

  const p4Id = `page_rules_${Date.now() + 7}`;
  const p5Id = `page_discipline_${Date.now() + 8}`;

  const templates: NotebookTemplate[] = [
    {
      id: t1Id,
      userId,
      name: "ICT Learning & Concepts",
      description: "Smart Money Concepts, Liquidity Engineering, and Algorithmic Order Flow",
      icon: "🎯",
      color: "#0284c7",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: t2Id,
      userId,
      name: "Trading Psychology & Strategy Playbook",
      description: "Execution rules, mental models, and daily mindset checklists",
      icon: "🧠",
      color: "#10b981",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const pages: NotebookPage[] = [
    // Template 1 Pages
    {
      id: p1Id,
      notebookId: t1Id,
      parentPageId: null,
      title: "Liquidity & Order Flow",
      icon: "💧",
      blocks: [
        {
          id: "b_1",
          type: "heading",
          content: "Institutional Liquidity Theory",
          meta: { level: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_2",
          type: "text",
          content:
            "Price moves from liquidity pool to liquidity pool. Algorithms hunt resting stop orders placed above swing highs (BSL) and below swing lows (SSL) before generating real expansion.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_3",
          type: "quote",
          content: "If you cannot identify where retail liquidity is resting, you ARE the liquidity.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_4",
          type: "todo",
          content: "Map HTF Asian Range High & Low before London Open",
          meta: { checked: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_5",
          type: "todo",
          content: "Confirm liquidity sweep with 5m/15m Displacement Candle",
          meta: { checked: false },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p1Sub1Id,
      notebookId: t1Id,
      parentPageId: p1Id,
      title: "Buy-side Liquidity (BSL)",
      icon: "📈",
      blocks: [
        {
          id: "b_sub1_1",
          type: "heading",
          content: "Buy-Side Liquidity Setup Protocol",
          meta: { level: 2 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_sub1_2",
          type: "text",
          content:
            "Buy-side liquidity consists of Buy Stop orders placed by short sellers protecting their capital, as well as breakout buyers entering long. When price sweeps BSL and rapidly rejects, institutional sell programs are primed.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_sub1_3",
          type: "bullet_list",
          content: "Equal Highs (EQH) are the strongest magnet for Buy-side runs.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_sub1_4",
          type: "bullet_list",
          content: "Previous Day High (PDH) and Previous Week High (PWH) represent key algorithmic targets.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p1Sub2Id,
      notebookId: t1Id,
      parentPageId: p1Id,
      title: "Sell-side Liquidity (SSL)",
      icon: "📉",
      blocks: [
        {
          id: "b_sub2_1",
          type: "heading",
          content: "Sell-Side Liquidity Mechanics",
          meta: { level: 2 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_sub2_2",
          type: "text",
          content:
            "Sell-side liquidity rests below swing lows and relative equal lows (EQL). Smart money pairs their massive buy orders against the flood of retail stop-losses triggered below these levels.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p2Id,
      notebookId: t1Id,
      parentPageId: null,
      title: "Market Structure",
      icon: "🏛️",
      blocks: [
        {
          id: "b_struct_1",
          type: "heading",
          content: "Algorithmic Market Structure Shifts",
          meta: { level: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_struct_2",
          type: "text",
          content: "A genuine structure shift requires decisive candle body closure beyond a prominent swing point with strong displacement, leaving an imbalance behind.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p2Sub1Id,
      notebookId: t1Id,
      parentPageId: p2Id,
      title: "BOS (Break of Structure)",
      icon: "⚡",
      blocks: [
        {
          id: "b_bos_1",
          type: "heading",
          content: "Break of Structure (Trend Continuation)",
          meta: { level: 2 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_bos_2",
          type: "text",
          content: "BOS confirms the prevailing order flow remains in control. Look for re-tests of Order Blocks or Fair Value Gaps in the direction of the trend.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p2Sub2Id,
      notebookId: t1Id,
      parentPageId: p2Id,
      title: "CHOCH (Change of Character)",
      icon: "🔄",
      blocks: [
        {
          id: "b_choch_1",
          type: "heading",
          content: "Change of Character (Reversal Indication)",
          meta: { level: 2 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_choch_2",
          type: "text",
          content: "The first sign that supply or demand is losing control. Always seek confluence with a higher-timeframe point of interest.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p3Id,
      notebookId: t1Id,
      parentPageId: null,
      title: "Fair Value Gaps (FVG)",
      icon: "✨",
      blocks: [
        {
          id: "b_fvg_1",
          type: "heading",
          content: "Fair Value Gap & Imbalance Mechanics",
          meta: { level: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_fvg_2",
          type: "text",
          content: "A 3-candle sequence where Candle 1 high and Candle 3 low do not overlap (Bullish FVG), creating an inefficient pricing vacuum.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Template 2 Pages
    {
      id: p4Id,
      notebookId: t2Id,
      parentPageId: null,
      title: "Daily Mindset Checklist",
      icon: "🧘",
      blocks: [
        {
          id: "b_m1",
          type: "heading",
          content: "Pre-Session Psychological Preparedness",
          meta: { level: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_m2",
          type: "todo",
          content: "I accept that the outcome of any single trade is completely random, while my edge is statistical over 100 setups.",
          meta: { checked: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_m3",
          type: "todo",
          content: "I will not revenge trade if stopped out during Killzone.",
          meta: { checked: false },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_m4",
          type: "todo",
          content: "I will shut down my trading terminal after hitting daily max risk (-2%).",
          meta: { checked: false },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: p5Id,
      notebookId: t2Id,
      parentPageId: null,
      title: "Execution Rules & Risk Guard",
      icon: "🛡️",
      blocks: [
        {
          id: "b_e1",
          type: "heading",
          content: "Non-Negotiable Execution Rules",
          meta: { level: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_e2",
          type: "numbered_list",
          content: "Maximum risk per execution is strictly 1% of account balance.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_e3",
          type: "numbered_list",
          content: "Minimum Risk to Reward target must be at least 1:2.5.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "b_e4",
          type: "numbered_list",
          content: "Never take entries outside designated algorithmic Killzones.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    templates,
    pages,
    activeTemplateId: t1Id,
    activePageId: p1Id,
  };
}

function sanitizeLoadedNotebook(data: NotebookUserData, safeUserId: string): NotebookUserData {
  if (!data || !Array.isArray(data.templates)) {
    return { templates: [], pages: [], activeTemplateId: null, activePageId: null };
  }
  // Filter out any legacy auto-seeded demo templates
  const personalTemplates = data.templates.filter(
    (t) =>
      t.id !== `tmpl_core_${safeUserId}` &&
      t.id !== `tmpl_journal_${safeUserId}` &&
      !t.id.startsWith("tmpl_core_") &&
      !t.id.startsWith("tmpl_journal_")
  );

  if (personalTemplates.length === 0) {
    return {
      templates: [],
      pages: [],
      activeTemplateId: null,
      activePageId: null,
    };
  }

  const validTemplateIds = new Set(personalTemplates.map((t) => t.id));
  const personalPages = (data.pages || []).filter((p) => validTemplateIds.has(p.notebookId));

  const activeTemplateId = personalTemplates.some((t) => t.id === data.activeTemplateId)
    ? data.activeTemplateId
    : personalTemplates[0].id;
  const activePageId = personalPages.some((p) => p.id === data.activePageId)
    ? data.activePageId
    : personalPages.find((p) => p.notebookId === activeTemplateId)?.id || null;

  return {
    templates: personalTemplates,
    pages: personalPages,
    activeTemplateId,
    activePageId,
  };
}

/**
 * Load user notebook data from IndexedDB with localStorage fallback
 */
export async function loadUserNotebookData(userId: string): Promise<NotebookUserData> {
  const safeUserId = userId || "default_user";

  // 1. Try IndexedDB
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const result = await new Promise<any>((resolve, reject) => {
      const req = store.get(safeUserId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (result && result.data && Array.isArray(result.data.templates)) {
      return sanitizeLoadedNotebook(result.data as NotebookUserData, safeUserId);
    }
  } catch (err) {
    console.warn("[NotebookStorage] IndexedDB read error, checking localStorage fallback:", err);
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(`cycle_notebook_${safeUserId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.templates)) {
        return sanitizeLoadedNotebook(parsed as NotebookUserData, safeUserId);
      }
    }
  } catch {}

  // 3. For new students: return a clean, empty workspace (no auto-seeded samples)
  const emptyData: NotebookUserData = {
    templates: [],
    pages: [],
    activeTemplateId: null,
    activePageId: null,
  };
  return emptyData;
}

// Auto-save debounce timer
let saveTimeout: any = null;

/**
 * Save user notebook data to IndexedDB and sync to localStorage
 */
export async function saveUserNotebookData(
  userId: string,
  data: NotebookUserData
): Promise<void> {
  const safeUserId = userId || "default_user";

  // Update localStorage cache synchronously for immediate fallback availability
  try {
    localStorage.setItem(`cycle_notebook_${safeUserId}`, JSON.stringify(data));
  } catch (err) {
    console.warn("[NotebookStorage] localStorage write limit, relying on IndexedDB:", err);
  }

  // Persist to IndexedDB
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ userId: safeUserId, data, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[NotebookStorage] IndexedDB write error:", err);
  }

  // Broadcast update event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cycle_notebook_updated", {
        detail: { userId: safeUserId },
      })
    );
  }
}

/**
 * Debounced save to prevent excessive disk writes during active typing
 */
export function debouncedSaveNotebookData(
  userId: string,
  data: NotebookUserData,
  delay = 350
): Promise<void> {
  return new Promise((resolve) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await saveUserNotebookData(userId, data);
      resolve();
    }, delay);
  });
}

/**
 * Validate video duration (strictly maximum 10 minutes = 600 seconds)
 */
export function validateVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/")) {
      reject(new Error("Selected file is not a valid video."));
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const duration = Math.round(video.duration);
      if (duration > 600) {
        reject(
          new Error(
            `Video duration (${Math.floor(duration / 60)}m ${duration % 60}s) exceeds the strict 10-minute maximum limit.`
          )
        );
      } else {
        resolve(duration);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read video metadata. Please ensure the format is valid (MP4, WEBM)."));
    };

    video.src = objectUrl;
  });
}
