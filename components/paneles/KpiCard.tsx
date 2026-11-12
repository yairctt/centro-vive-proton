import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: string;
  badgeType?: "positive" | "warning" | "neutral" | "brand";
  icon?: React.ReactNode;
  progressPercent?: number;
  hint?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  badge,
  badgeType = "neutral",
  icon,
  progressPercent,
  hint,
}: KpiCardProps) {
  const badgeStyles = {
    positive:
      "bg-emerald-100/90 text-emerald-800 border-emerald-300 font-bold dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700",
    warning:
      "bg-amber-100/90 text-amber-800 border-amber-300 font-bold dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700",
    brand:
      "bg-teal-100/90 text-teal-800 border-teal-300 font-bold dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-700",
    neutral:
      "bg-neutral-100 text-neutral-800 border-neutral-300 font-semibold dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
  }[badgeType];

  const topBorderStyles = {
    positive: "border-t-4 border-t-emerald-500",
    warning: "border-t-4 border-t-amber-500",
    brand: "border-t-4 border-t-teal-600",
    neutral: "border-t-4 border-t-blue-500",
  }[badgeType];

  const iconAccentStyles = {
    positive:
      "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-100 text-amber-800 border border-amber-200 shadow-xs dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    brand:
      "bg-teal-100 text-teal-800 border border-teal-200 shadow-xs dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
    neutral:
      "bg-blue-100 text-blue-800 border border-blue-200 shadow-xs dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  }[badgeType];

  const progressBarColors = {
    positive: "bg-emerald-500",
    warning: "bg-amber-500",
    brand: "bg-teal-600",
    neutral: "bg-blue-500",
  }[badgeType];

  const cardBgStyles = {
    positive:
      "border-emerald-200/90 bg-gradient-to-br from-white via-white to-emerald-50/35 dark:border-emerald-900/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-emerald-950/20",
    warning:
      "border-amber-200/90 bg-gradient-to-br from-white via-white to-amber-50/35 dark:border-amber-900/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-amber-950/20",
    brand:
      "border-teal-200/90 bg-gradient-to-br from-white via-white to-teal-50/35 dark:border-teal-900/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-teal-950/20",
    neutral:
      "border-blue-200/90 bg-gradient-to-br from-white via-white to-sky-50/35 dark:border-blue-900/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/20",
  }[badgeType];

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${topBorderStyles} ${cardBgStyles}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold tracking-wider text-neutral-600 uppercase dark:text-neutral-300">
              {title}
            </span>
            {hint && (
              <p className="mt-0.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                {hint}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconAccentStyles}`}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="my-3 flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-neutral-900 tabular-nums dark:text-white">
            {value}
          </span>
          {badge && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${badgeStyles}`}
            >
              {badge}
            </span>
          )}
        </div>

        {progressPercent !== undefined && (
          <div className="mt-2 mb-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
              <span>Progreso de hoy</span>
              <span className="font-bold text-neutral-700 dark:text-neutral-300">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressBarColors}`}
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs font-medium leading-relaxed text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        {subtitle}
      </p>
    </div>
  );
}

