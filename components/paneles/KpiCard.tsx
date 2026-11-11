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
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    brand: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  }[badgeType];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {title}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {icon}
          </div>
        )}
      </div>

      <div className="my-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeStyles}`}
          >
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
    </div>
  );
}

