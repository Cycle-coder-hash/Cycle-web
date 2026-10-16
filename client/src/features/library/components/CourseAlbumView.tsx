import React, { useState } from "react";
import { Link } from "wouter";
import {
  Video,
  Play,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  Download,
  Link2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@shared/mediaLinks";
import type { CourseClass, CourseId, CourseAlbumResponse } from "@shared/types/library";

interface CourseAlbumViewProps {
  courseId: CourseId;
}

export const CourseAlbumView: React.FC<CourseAlbumViewProps> = ({ courseId }) => {
  const { language, selectText } = useLanguage();
  const isBn = language === "bn";

  // Active playing class index for unlocked state
  const [activeClassIndex, setActiveClassIndex] = useState(0);

  // Query album details & security-gated classes
  const { data, isLoading } = trpc.customer.courseAlbum.useQuery(
    { courseId },
    { staleTime: 1000 * 30 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-900" />
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-500">Course information currently unavailable.</p>
      </div>
    );
  }

  const { meta, isPurchased, classes, stats } = data as CourseAlbumResponse;
  const currentClass: CourseClass | undefined = classes[activeClassIndex] || classes[0];

  const albumTitle = isBn && meta.titleBn ? meta.titleBn : meta.title;
  const albumSubtitle = isBn && meta.subtitleBn ? meta.subtitleBn : meta.subtitle;

  // Video embed URL for current class
  const videoId = currentClass?.videoUrl ? extractYouTubeVideoId(currentClass.videoUrl) : null;
  const embedUrl = currentClass?.embedUrl || (videoId ? getYouTubeEmbedUrl(videoId) : null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Course Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50/30 p-6 sm:p-8 dark:border-slate-800 dark:from-[#0a1324] dark:via-[#070e1a] dark:to-[#040913] shadow-sm">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                {meta.badgeText || "Masterclass"}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                BDT ৳{meta.priceBdt}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-slate-200/70 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Clock size={12} />
                <span>{classes.length} Classes</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {albumTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {albumSubtitle}
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {meta.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Status / CTA Box */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shrink-0 lg:w-72 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Access Status
            </div>

            {isPurchased ? (
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  <CheckCircle2 size={18} />
                  <span>Full Access Enrolled</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You are fully enrolled in this course. Enjoy unlimited lifetime replay and study materials below.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                  <Lock size={18} />
                  <span>Course Gated (Locked)</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ৳{meta.priceBdt}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">One-time</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enroll now to instantly unlock all {classes.length} video lessons and study materials.
                </p>
                <Link href={`/checkout?bundle=${meta.bundleId}`}>
                  <Button className="w-full gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md">
                    <span>Enroll Now (৳{meta.priceBdt})</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isPurchased ? (
        /* UNLOCKED STATE: Full Player & Playlist */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Main Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black aspect-video shadow-xl dark:border-slate-800">
              {embedUrl ? (
                <iframe
                  key={currentClass?.id}
                  src={embedUrl}
                  title={currentClass?.title || "Video Lesson"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Video size={40} className="mb-2 opacity-50" />
                  <p className="text-sm font-bold">Video stream is initializing...</p>
                </div>
              )}
            </div>

            {/* Video Meta Info & Controls */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-black text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                      Class #{currentClass?.order || activeClassIndex + 1}
                    </span>
                    {currentClass?.duration && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                        <Clock size={11} />
                        {currentClass.duration}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {currentClass?.title}
                  </h2>
                </div>

                {/* Prev / Next Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeClassIndex === 0}
                    onClick={() => setActiveClassIndex((prev) => Math.max(0, prev - 1))}
                    className="h-8 gap-1 text-xs font-bold border-slate-200 dark:border-slate-700 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeClassIndex >= classes.length - 1}
                    onClick={() => setActiveClassIndex((prev) => Math.min(classes.length - 1, prev + 1))}
                    className="h-8 gap-1 text-xs font-bold border-slate-200 dark:border-slate-700 disabled:opacity-30"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>

              {/* Description */}
              {currentClass?.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Class Overview & Key Concepts
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {currentClass.description}
                  </p>
                </div>
              )}

              {/* Resource / Drive Link */}
              {currentClass?.resourceLink && (
                <div className="pt-2">
                  <a
                    href={currentClass.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition-colors"
                  >
                    <Link2 size={14} />
                    <span>Download Lesson Study Material / Drive Attachment</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Course Curriculum Playlist */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-sky-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Curriculum Playlist ({classes.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {classes.map((cls, idx) => {
                const isActive = idx === activeClassIndex;
                const vId = cls.videoUrl ? extractYouTubeVideoId(cls.videoUrl) : null;
                const thumb = vId ? getYouTubeThumbnailUrl(vId) : null;

                return (
                  <div
                    key={cls.id}
                    onClick={() => setActiveClassIndex(idx)}
                    className={`flex items-start gap-3 rounded-2xl p-3 cursor-pointer transition-all border ${
                      isActive
                        ? "bg-sky-500/10 border-sky-500/30 text-sky-900 dark:bg-sky-500/15 dark:border-sky-500/40 dark:text-white shadow-xs"
                        : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 dark:bg-slate-950/40 dark:border-slate-800/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {/* Thumbnail or Number */}
                    {thumb ? (
                      <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
                        <img src={thumb} alt={cls.title} className="w-full h-full object-cover" />
                        {isActive && (
                          <div className="absolute inset-0 bg-sky-600/40 flex items-center justify-center">
                            <Play size={14} className="text-white fill-white animate-pulse" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-black text-xs ${
                          isActive ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        #{cls.order || idx + 1}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400">Class {cls.order || idx + 1}</span>
                        {cls.duration && (
                          <span className="text-[10px] font-semibold text-slate-400">{cls.duration}</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold truncate mt-0.5">{cls.title}</h4>
                      {isActive && (
                        <span className="inline-block mt-1 text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                          Now Playing
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* LOCKED STATE: Curriculum preview with locked indicators */
        <div className="space-y-6">
          {/* Big Enrollment Callout Banner */}
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 text-amber-900 dark:text-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <h3 className="text-lg font-black tracking-tight">
                  {selectText({
                    en: `Unlock Full "${albumTitle}" Video Masterclass`,
                    bn: `সম্পূর্ণ "${albumTitle}" ভিডিও মাস্টারক্লাস আনলক করুন`,
                    ur: `مکمل "${albumTitle}" ماسٹرکلاس انلاک کریں`,
                  })}
                </h3>
              </div>
              <p className="text-xs sm:text-sm opacity-90 max-w-2xl">
                {selectText({
                  en: `Enroll today for BDT ৳${meta.priceBdt} to get lifetime access to all ${classes.length} institutional lessons, high-probability frameworks, and private student community.`,
                  bn: `আজই মাত্র ৳${meta.priceBdt} টাকায় ভর্তি হয়ে সব ${classes.length}টি প্রাতিষ্ঠানিক ক্লাস ও লাইফটাইম স্টুডেন্ট কমিউনিটি অ্যাক্সেস পান।`,
                  ur: `آج ہی BDT ৳${meta.priceBdt} میں داخلہ لیں اور تمام ${classes.length} اسباق تک تاحیات رسائی حاصل کریں۔`,
                })}
              </p>
            </div>

            <Link href={`/checkout?bundle=${meta.bundleId}`} className="shrink-0 self-stretch sm:self-auto">
              <Button className="w-full sm:w-auto gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-lg text-sm px-6 py-2.5">
                <span>Enroll Now — BDT ৳{meta.priceBdt}</span>
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>

          {/* Curriculum Preview with Lock Badges */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-sky-500" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Course Curriculum & Class Syllabus ({classes.length} Classes)
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Lock size={12} />
                <span>Locked for enrolled students</span>
              </span>
            </div>

            <div className="space-y-3">
              {classes.map((cls, idx) => (
                <div
                  key={cls.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-black text-xs">
                      #{cls.order || idx + 1}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {cls.title}
                      </h4>
                      {cls.description && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {cls.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {cls.duration && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                        <Clock size={11} />
                        {cls.duration}
                      </span>
                    )}

                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      <Lock size={10} />
                      <span>Locked</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
