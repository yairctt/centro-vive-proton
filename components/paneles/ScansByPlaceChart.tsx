"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MapPinIcon, TrendUpIcon } from "./icons";

interface PlaceScan {
  placeId: string;
  placeName: string;
  scans: number;
}

interface ScansByPlaceChartProps {
  data: PlaceScan[];
}

const BAR_COLORS = [
  "#0f766e", // teal
  "#2563eb", // blue
  "#d97706", // amber
  "#e11d48", // rose
  "#7c3aed", // violet
  "#059669", // emerald
];

export function ScansByPlaceChart({ data }: ScansByPlaceChartProps) {
  // Sort descending
  const sortedData = [...data].sort((a, b) => b.scans - a.scans);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Escaneos QR por Lugar
          </h3>
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
            Puntos Clave
          </span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Distribución de interacciones registradas en cada punto de validación
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <YAxis
              type="category"
              dataKey="placeName"
              width={140}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#374151" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as PlaceScan;
                  return (
                    <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs dark:border-neutral-700 dark:bg-neutral-800/95">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                        {item.placeName}
                      </p>
                      <p className="mt-1 text-sm font-bold text-teal-600 dark:text-teal-400">
                        {item.scans}{" "}
                        <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                          escaneos validados
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="scans" radius={[0, 6, 6, 0]}>
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.placeId}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-400 dark:border-neutral-800">
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="h-3.5 w-3.5 text-teal-600" />
          Puntos monitoreados en tiempo real
        </span>
        <span className="flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
          <TrendUpIcon className="h-3.5 w-3.5" />
          Líder: {sortedData[0]?.placeName ?? "—"}
        </span>
      </div>
    </div>
  );
}

