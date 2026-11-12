import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: string;
  badgeType?: "positive" | "warning" | "neutral" | "brand";
  icon?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  subtitle,
  badge,
  badgeType = "neutral",
  icon,
}: KpiCardProps) {
  const badgeStyles = {
    positive:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    brand:
      "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    neutral:
      "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  }[badgeType];

  const iconAccentStyles = {
    positive:
      "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
    warning:
      "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
    brand:
      "bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/40",
    neutral:
      "bg-neutral-100/90 text-neutral-600 border border-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700/60",
  }[badgeType];

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {title}
        </span>
        {icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${iconAccentStyles}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="my-3.5 flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-neutral-900 tabular-nums dark:text-white">
          {value}
        </span>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeStyles}`}
          >
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs font-normal leading-relaxed text-neutral-500 dark:text-neutral-400">
        {subtitle}
      </p>
    </div>
  );
}

