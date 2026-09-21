const OFFICIAL_LOGO_URL = "/logo.jpg";

type BrandLogoProps = {
  size?: number;
  className?: string;
};

export function BrandLogo({ size = 48, className = "" }: BrandLogoProps) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/90 bg-white shadow-sm ring-2 ring-white/20 dark:border-slate-700/90 dark:bg-slate-900 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src={OFFICIAL_LOGO_URL}
        alt="Cycle of Chart Official Logo"
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        loading="eager"
        decoding="async"
        className="block size-full rounded-full object-cover"
      />
    </div>
  );
}

export default BrandLogo;
