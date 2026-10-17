/**
 * shared/types/library.ts
 * Shared DTOs and types for the Library Management system (Free PDFs + Course Albums).
 */

export type CourseId = "basic-to-advance" | "cycle-blueprint";

export interface CourseClass {
  id: string;
  courseId: CourseId;
  title: string;
  description?: string;
  videoUrl?: string; // YouTube Unlisted URL (only present if unlocked or in admin view)
  embedUrl?: string; // Embedded iframe safe URL (e.g. youtube-nocookie.com/embed/...)
  duration?: string; // e.g. "45 min" or "1 hr 15 min"
  order: number;
  isPublished: boolean;
  resourceLink?: string; // Optional Google Drive link or PDF attachment URL
  createdAt: string;
  updatedAt: string;
}

export interface CourseAlbumMeta {
  id: CourseId;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  description: string;
  bundleId: number;
  priceBdt: string;
  priceUsd: string;
  badgeText: string;
  features: string[];
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export interface CourseAlbumResponse {
  meta: CourseAlbumMeta;
  isPurchased: boolean;
  classes: CourseClass[];
  stats: {
    totalClasses: number;
    totalDuration: string;
  };
}

export interface FreePdfItem {
  id: number;
  titleEn: string;
  titleBn?: string;
  subtitleEn: string;
  subtitleBn?: string;
  category: string;
  pages?: number;
  keyConcepts?: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  isPublished?: boolean;
  isFree?: boolean;
  price?: string;
  coverImageUrl?: string | null;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}
