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

interface ConversionItem {
  name: string;
  valor: number;
  color: string;
}

interface ComercioConversionChartProps {
  data: ConversionItem[];
}

export function ComercioConversionChart({ data }: ComercioConversionChartProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          Embudo de Conversión de Visitas
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          De la recomendación digital a la visita presencial y canje
        </p>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ConversionItem;
                  return (
                    <div className="rounded-xl border border-neutral-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-xs dark:border-neutral-700 dark:bg-neutral-800/95">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                        {item.name}
                      </p>
                      <p
                        className="mt-1 text-xs font-bold"
                        style={{ color: item.color }}
                      >
                        {item.valor} eventos registrados
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-400 dark:border-neutral-800">
        <span>Tasa de visita presencial: ~76%</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          Conversión a canje: 34%
        </span>
      </div>
    </div>
  );
}
