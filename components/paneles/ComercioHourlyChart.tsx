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
} from "recharts";

interface HourlyVisit {
  hour: string;
  visitas: number;
}

interface ComercioHourlyChartProps {
  data: HourlyVisit[];
}

export function ComercioHourlyChart({ data }: ComercioHourlyChartProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          Visitas QR Registradas por Hora
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Escaneos presenciales de visitantes en este establecimiento
        </p>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-neutral-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-xs dark:border-neutral-700 dark:bg-neutral-800/95">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                        Hora: {label}
                      </p>
                      <p className="mt-1 text-xs font-bold text-teal-700 dark:text-teal-400">
                        {payload[0].value} visitas registradas
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="visitas" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-400 dark:border-neutral-800">
        <span>Horas de mayor flujo: 10:00 y 19:00</span>
        <span className="font-medium text-teal-700 dark:text-teal-400">
          Total del día: {data.reduce((acc, curr) => acc + curr.visitas, 0)} visitas
        </span>
      </div>
    </div>
  );
}

