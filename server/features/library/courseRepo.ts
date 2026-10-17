/**
 * server/features/library/courseRepo.ts
 * Repository and access-control logic for Paid Course Albums and Unlimited Classes.
 */

import { getSetting, setSetting } from "../../infra/db/settings";
import {
  listOrdersForUser,
  listEntitlements,
  getPricingConfig,
  resolveUserCandidateIds,
} from "../commerce";
import { getYouTubeEmbedUrl } from "../../../shared/mediaLinks";
import type {
  CourseId,
  CourseClass,
  CourseAlbumMeta,
  CourseAlbumResponse,
} from "../../../shared/types/library";

export const DEFAULT_ALBUM_A_CLASSES: CourseClass[] = [
  {
    id: "b2a-1",
    courseId: "basic-to-advance",
    title: "Class 01: Foundations of Institutional Order Flow & Market Anatomy",
    description: "Introduction to institutional order flow, understanding buy-side vs sell-side liquidity, and reading true price delivery mechanics.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "42 min",
    order: 1,
    isPublished: true,
    resourceLink: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b2a-2",
    courseId: "basic-to-advance",
    title: "Class 02: Candle Range Theory (CRT) & Institutional Sweeps",
    description: "Deep dive into Candle Range Theory anatomy, high-probability wick sweep validation, and targeting opposing liquidity pools.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "55 min",
    order: 2,
    isPublished: true,
    resourceLink: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b2a-3",
    courseId: "basic-to-advance",
    title: "Class 03: Fair Value Gaps (FVG) & Order Block Confirmation",
    description: "How to identify true displacement, premium/discount array filtration, and distinguishing valid imbalances from low-probability traps.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "48 min",
    order: 3,
    isPublished: true,
    resourceLink: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_ALBUM_B_CLASSES: CourseClass[] = [
  {
    id: "bp-1",
    courseId: "cycle-blueprint",
    title: "Class 01: The Algorithmic Cycle Blueprint & Power of 3 (AMD)",
    description: "Mastering the institutional Accumulation, Manipulation, and Distribution cycle across macro timeframes and daily profiles.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "58 min",
    order: 1,
    isPublished: true,
    resourceLink: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bp-2",
    courseId: "cycle-blueprint",
    title: "Class 02: Session Timing, True Day Open & Macro Killzones",
    description: "London and New York institutional algorithmic timing, midnight open filter, and targeting high-frequency macro expansion windows.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "1 hr 12 min",
    order: 2,
    isPublished: true,
    resourceLink: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bp-3",
    courseId: "cycle-blueprint",
    title: "Class 03: High-RR Top-Down Fractal Execution & Trade Management",
    description: "Framing trades from Weekly/Daily context down to 1-minute execution models with strict risk control and 1:5+ RR asymmetric setups.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "1 hr 05 min",
    order: 3,
    isPublished: true,
    resourceLink: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const inMemoryCourseClasses: Record<string, CourseClass[]> = {
  "basic-to-advance": [...DEFAULT_ALBUM_A_CLASSES],
  "cycle-blueprint": [...DEFAULT_ALBUM_B_CLASSES],
};

function getSettingKey(courseId: CourseId): string {
  return courseId === "basic-to-advance"
    ? "course_classes_basic_to_advance"
    : "course_classes_cycle_blueprint";
}

const inMemoryAlbumMeta: Record<string, CourseAlbumMeta> = {};

function getAlbumMetaSettingKey(courseId: CourseId): string {
  return `course_album_meta_${courseId}`;
}

export async function getAlbumMetadata(courseId: CourseId): Promise<CourseAlbumMeta> {
  const pricing = await getPricingConfig();
  const defaultMeta: CourseAlbumMeta =
    courseId === "basic-to-advance"
      ? {
          id: "basic-to-advance",
          title: "Cycle of Chart Basic to Advance Course",
          titleBn: "সাইকেল অফ চার্ট বেসিক টু অ্যাডভান্স কোর্স",
          subtitle: "Complete Institutional Trading Curriculum from zero to master",
          subtitleBn: "শূন্য থেকে মাস্টার লেভেল পর্যন্ত সম্পূর্ণ প্রাতিষ্ঠানিক ট্রেডিং কোর্স",
          description:
            "A complete professional video curriculum covering Market Structure, Candlestick Anatomy, Candle Range Theory (CRT), Institutional Order Flow, Liquidity Sweeps, and Risk Execution.",
          bundleId: 2,
          priceBdt: pricing.courses.basicToAdvance.priceBdt || "2499",
          priceUsd: pricing.courses.basicToAdvance.priceUsd || "19.99",
          badgeText: "Most Popular",
          features: [
            "Full Candle Range Theory (CRT) Anatomy",
            "Liquidity Sweeps & FVG Mechanics",
            "Order Flow & Execution Psychology",
            "Lifetime Class Replay & Study Material",
          ],
          thumbnailUrl: "",
          isPublished: true,
        }
      : {
          id: "cycle-blueprint",
          title: "Cycle of Chart — Professional Trading Blueprint",
          titleBn: "সাইকেল অফ চার্ট — প্রফেশনাল ট্রেডিং ব্লুপ্রিন্ট",
          subtitle: "Elite Algorithmic Models, Macro Session Timing & High-RR Execution",
          subtitleBn: "এলিট অ্যালগরিদমিক মডেল, ম্যাক্রো টাইমিং ও হাই-আরআর এক্সিকিউশন",
          description:
            "An advanced professional trading blueprint covering Algorithmic Cycles, Power of 3 (AMD), Macro Timing, HTF to LTF Fractal Confirmation, and Live Market Execution Case Studies.",
          bundleId: 4,
          priceBdt: pricing.courses.proBlueprint.priceBdt || "4999",
          priceUsd: pricing.courses.proBlueprint.priceUsd || "39.99",
          badgeText: "Elite Masterclass",
          features: [
            "Algorithmic Cycle & AMD Mechanics",
            "Macro Timing & Session Killzones",
            "High-Probability Entry Frameworks (1:5+ RR)",
            "Exclusive Institutional Case Studies",
          ],
          thumbnailUrl: "",
          isPublished: true,
        };

  // Check saved persistent settings
  try {
    const raw = await getSetting(getAlbumMetaSettingKey(courseId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...defaultMeta,
          ...parsed,
          id: courseId, // immutable
          bundleId: defaultMeta.bundleId, // immutable
        };
      }
    }
  } catch (err) {
    console.warn(`[getAlbumMetadata getSetting error for ${courseId}]:`, err);
  }

  if (inMemoryAlbumMeta[courseId]) {
    return {
      ...defaultMeta,
      ...inMemoryAlbumMeta[courseId],
      id: courseId,
      bundleId: defaultMeta.bundleId,
    };
  }

  return defaultMeta;
}

export async function updateAlbumMetadata(
  courseId: CourseId,
  data: Partial<CourseAlbumMeta>
): Promise<CourseAlbumMeta> {
  const current = await getAlbumMetadata(courseId);
  const updated: CourseAlbumMeta = {
    ...current,
    ...data,
    id: courseId,
    bundleId: current.bundleId,
  };

  try {
    await setSetting(getAlbumMetaSettingKey(courseId), JSON.stringify(updated));
  } catch (err) {
    console.warn(`[updateAlbumMetadata setSetting error for ${courseId}]:`, err);
  }

  inMemoryAlbumMeta[courseId] = updated;
  return updated;
}

export async function listCourseClasses(
  courseId: CourseId,
  includeUnpublished = false
): Promise<CourseClass[]> {
  const settingKey = getSettingKey(courseId);

  try {
    const rawSetting = await getSetting(settingKey);
    if (rawSetting) {
      const parsed = JSON.parse(rawSetting);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sorted = [...parsed].sort((a, b) => (a.order || 0) - (b.order || 0));
        return includeUnpublished
          ? sorted
          : sorted.filter((c) => c.isPublished !== false);
      }
    }
  } catch (err) {
    console.warn(`[listCourseClasses error for ${courseId}]:`, err);
  }

  // Fallback to in-memory store
  const current = inMemoryCourseClasses[courseId] || [];
  const sorted = [...current].sort((a, b) => (a.order || 0) - (b.order || 0));
  return includeUnpublished
    ? sorted
    : sorted.filter((c) => c.isPublished !== false);
}

export async function getCourseClassById(
  courseId: CourseId,
  classId: string
): Promise<CourseClass | null> {
  const classes = await listCourseClasses(courseId, true);
  return classes.find((c) => String(c.id) === String(classId)) || null;
}

export async function createCourseClass(
  courseId: CourseId,
  data: {
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order?: number;
    isPublished?: boolean;
    resourceLink?: string;
  }
): Promise<CourseClass> {
  const existing = await listCourseClasses(courseId, true);
  const now = new Date().toISOString();
  const nextOrder = data.order !== undefined && data.order > 0
    ? data.order
    : existing.length + 1;

  const newClass: CourseClass = {
    id: `class-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    courseId,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    videoUrl: data.videoUrl.trim(),
    embedUrl: getYouTubeEmbedUrl(data.videoUrl.trim()) || undefined,
    duration: data.duration?.trim() || "45 min",
    order: nextOrder,
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    resourceLink: data.resourceLink?.trim() || "",
    createdAt: now,
    updatedAt: now,
  };

  const updated = [...existing, newClass].sort((a, b) => (a.order || 0) - (b.order || 0));
  const settingKey = getSettingKey(courseId);

  try {
    await setSetting(settingKey, JSON.stringify(updated));
  } catch (err) {
    console.warn(`[createCourseClass setSetting error for ${courseId}]:`, err);
  }

  inMemoryCourseClasses[courseId] = updated;
  return newClass;
}

export async function updateCourseClass(
  courseId: CourseId,
  classId: string,
  data: Partial<Omit<CourseClass, "id" | "courseId" | "createdAt">>
): Promise<CourseClass> {
  const existing = await listCourseClasses(courseId, true);
  const index = existing.findIndex((c) => String(c.id) === String(classId));
  if (index === -1) {
    throw new Error(`Class with id ${classId} not found in ${courseId}`);
  }

  const current = existing[index];
  const now = new Date().toISOString();
  const updatedClass: CourseClass = {
    ...current,
    ...data,
    embedUrl: data.videoUrl
      ? (getYouTubeEmbedUrl(data.videoUrl) || undefined)
      : current.embedUrl,
    updatedAt: now,
  };

  existing[index] = updatedClass;
  existing.sort((a, b) => (a.order || 0) - (b.order || 0));

  const settingKey = getSettingKey(courseId);
  try {
    await setSetting(settingKey, JSON.stringify(existing));
  } catch (err) {
    console.warn(`[updateCourseClass setSetting error for ${courseId}]:`, err);
  }

  inMemoryCourseClasses[courseId] = existing;
  return updatedClass;
}

export async function deleteCourseClass(
  courseId: CourseId,
  classId: string
): Promise<boolean> {
  const existing = await listCourseClasses(courseId, true);
  const filtered = existing.filter((c) => String(c.id) !== String(classId));

  // Re-normalize sequence orders
  const resequenced = filtered.map((c, i) => ({ ...c, order: i + 1 }));

  const settingKey = getSettingKey(courseId);
  try {
    await setSetting(settingKey, JSON.stringify(resequenced));
  } catch (err) {
    console.warn(`[deleteCourseClass setSetting error for ${courseId}]:`, err);
  }

  inMemoryCourseClasses[courseId] = resequenced;
  return true;
}

export async function reorderCourseClasses(
  courseId: CourseId,
  orderedClassIds: string[]
): Promise<CourseClass[]> {
  const existing = await listCourseClasses(courseId, true);
  const map = new Map(existing.map((c) => [String(c.id), c]));
  const reordered: CourseClass[] = [];

  for (let i = 0; i < orderedClassIds.length; i++) {
    const id = String(orderedClassIds[i]);
    const item = map.get(id);
    if (item) {
      reordered.push({ ...item, order: i + 1, updatedAt: new Date().toISOString() });
      map.delete(id);
    }
  }

  // Append any classes not explicitly passed
  let nextIdx = reordered.length + 1;
  Array.from(map.values()).forEach((remaining) => {
    reordered.push({ ...remaining, order: nextIdx++, updatedAt: new Date().toISOString() });
  });

  const settingKey = getSettingKey(courseId);

  try {
    await setSetting(settingKey, JSON.stringify(reordered));
  } catch (err) {
    console.warn(`[reorderCourseClasses setSetting error for ${courseId}]:`, err);
  }

  inMemoryCourseClasses[courseId] = reordered;
  return reordered;
}

/**
 * Checks whether a specific user is authorized to view a course album.
 * Strict gating:
 * - basic-to-advance requires approved order with bundleId 2 or entitlement for bundle 2.
 * - cycle-blueprint requires approved order with bundleId 4 or 3 or entitlement for bundle 4/3.
 * - Owning one does NOT automatically unlock the other.
 */
export async function checkUserCourseAccess(
  userIdentifier: number | { id?: number; openId?: string; email?: string | null } | undefined | null,
  courseId: CourseId
): Promise<boolean> {

  if (!userIdentifier) return false;

  const normalizedUser =
    typeof userIdentifier === "number"
      ? userIdentifier
      : {
          id: userIdentifier.id,
          openId: userIdentifier.openId,
          email: userIdentifier.email || undefined,
        };

  const [ordersList, entitlementsList] = await Promise.all([
    listOrdersForUser(normalizedUser),
    listEntitlements(normalizedUser),
  ]);

  const approvedOrders = (ordersList || []).filter(
    (o: any) =>
      o.paymentStatus === "approved" ||
      o.orderStatus === "approved" ||
      o.paymentMethod === "free"
  );

  const candidateIds = await resolveUserCandidateIds(normalizedUser);
  const primaryId = typeof normalizedUser === "number" ? normalizedUser : (normalizedUser?.id || candidateIds[0] || 1);


  if (courseId === "basic-to-advance") {
    // 1. Direct approved order for Bundle 2
    const hasOrder = approvedOrders.some(
      (o: any) =>
        o.bundleId === 2 ||
        o.bundleSlug === "course-ebook" ||
        o.bundle?.slug === "course-ebook"
    );
    if (hasOrder) return true;

    // 2. Direct entitlement for Bundle 2
    const hasEntitlement = (entitlementsList || []).some(
      (e: any) => e.bundleId === 2 || e.scope === "bundle:2" || e.scope === "course"
    );
    if (hasEntitlement) return true;

    // 3. UserManagement manual course access check
    try {
      const { hasUserCourseAccess } = await import("../../userManagement");
      const hasAccess = await hasUserCourseAccess(primaryId);
      if (hasAccess) return true;
    } catch {}

    return false;
  }

  if (courseId === "cycle-blueprint") {
    // 1. Direct approved order for Bundle 4 (or 3)
    const hasOrder = approvedOrders.some(
      (o: any) =>
        o.bundleId === 4 ||
        o.bundleId === 3 ||
        o.bundleSlug === "pro-blueprint" ||
        o.bundle?.slug === "pro-blueprint"
    );
    if (hasOrder) return true;

    // 2. Direct entitlement for Bundle 4 (or 3)
    const hasEntitlement = (entitlementsList || []).some(
      (e: any) =>
        e.bundleId === 4 ||
        e.bundleId === 3 ||
        e.scope === "bundle:4" ||
        e.scope === "bundle:3" ||
        e.scope === "all_courses"
    );
    if (hasEntitlement) return true;

    return false;
  }

  return false;
}

/**
 * Returns complete course album payload for client consumption.
 * If user lacks entitlement, video URLs, embed URLs, and resources are stripped for security.
 */
export async function getCourseAlbumData(
  userIdentifier: number | { id?: number; openId?: string; email?: string | null } | undefined | null,
  courseId: CourseId,
  isAdmin = false
): Promise<CourseAlbumResponse> {


  const meta = await getAlbumMetadata(courseId);
  const isPurchased = isAdmin || (await checkUserCourseAccess(userIdentifier, courseId));
  const rawClasses = await listCourseClasses(courseId, isAdmin);

  const classes: CourseClass[] = rawClasses.map((c) => {
    if (isPurchased) {
      return {
        ...c,
        embedUrl: c.embedUrl || (c.videoUrl ? getYouTubeEmbedUrl(c.videoUrl) || undefined : undefined),
      };
    }

    // Gated/Sanitized version: DO NOT leak video URL or embed link to unpurchased users
    return {
      id: c.id,
      courseId: c.courseId,
      title: c.title,
      description: c.description,
      duration: c.duration,
      order: c.order,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      // videoUrl, embedUrl, and resourceLink omitted
    };
  });

  return {
    meta,
    isPurchased,
    classes,
    stats: {
      totalClasses: classes.length,
      totalDuration: `${classes.length * 45} mins total`,
    },
  };
}
