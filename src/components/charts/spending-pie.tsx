"use client";

import type { Category } from "@/lib/categories";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { CATEGORY_LABELS, CATEGORY_ORDER, CHART_COLORS } from "@/lib/categories";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  byCategory: Record<Category, number>;
};

export function SpendingPieChart({ byCategory }: Props) {
  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColor: string[] = [];

  for (const c of CATEGORY_ORDER) {
    const v = byCategory[c] ?? 0;
    if (v > 0) {
      labels.push(CATEGORY_LABELS[c]);
      data.push(v);
      backgroundColor.push(CHART_COLORS[c]);
    }
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#a1a1aa", boxWidth: 10, padding: 16 },
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            const value = typeof ctx.raw === "number" ? ctx.raw : 0;
            return ` $${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        No category data for this month yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Pie
        data={{
          labels,
          datasets: [
            {
              data,
              backgroundColor,
              borderWidth: 0,
            },
          ],
        }}
        options={options}
      />
    </div>
  );
}
