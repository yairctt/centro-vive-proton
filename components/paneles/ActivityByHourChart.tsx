"use client";

import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MoonIcon, ClockIcon } from "./icons";

interface HourlyPoint {
  hour: number;
  label: string;
  interactions: number;
  openBusinesses: number;
}

interface ActivityByHourChartProps {
  data: HourlyPoint[];
}

export function ActivityByHourChart({ data }: ActivityByHourChartProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Actividad vs. Comercios Abiertos
            </h3>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              Brecha de Horario
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Compara la actividad registrada en la app con la oferta comercial activa
          </p>
        </div>

        <div className="mt-2 sm:mt-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/70 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300">
            <MoonIcon className="h-3 w-3 text-amber-500" />
            Centro de noche (19:00+)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#d97706" }}
              domain={[0, 8]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const hourData = payload[0].payload as HourlyPoint;
                  const isNightGap = hourData.hour >= 19;
                  return (
                    <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs dark:border-neutral-700 dark:bg-neutral-800/95">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Hora: {label}
                      </p>
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="font-semibold text-teal-600 dark:text-teal-400">
                          {hourData.interactions} interacciones en app
                        </p>
                        <p className="font-semibold text-amber-600 dark:text-amber-400">
                          {hourData.openBusinesses} comercios abiertos
                        </p>
                        {isNightGap && (
                          <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                            <MoonIcon className="h-3 w-3 shrink-0 text-rose-500" />
                            <span>Brecha de noche: Alta afluencia digital con oferta cerrada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="interactions"
              name="Actividad en la app"
              stroke="#0f766e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorInteractions)"
            />
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="openBusinesses"
              name="Comercios abiertos"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ r: 3, fill: "#d97706" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="h-3.5 w-3.5 text-teal-600" />
          Pico registrado: 18:00–20:00 hrs
        </span>
        <span className="font-medium text-amber-700 dark:text-amber-400">
          Incentivo: Bono nocturno activo (&gt; 19:00)
        </span>
      </div>
    </div>
  );
}

