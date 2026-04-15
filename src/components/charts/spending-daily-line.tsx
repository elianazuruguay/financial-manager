"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export type DailyPoint = { date: string; total: number };

type Props = {
  dailyTotals: DailyPoint[];
};

function shortLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SpendingDailyLineChart({ dailyTotals }: Props) {
  const labels = dailyTotals.map((p) => shortLabel(p.date));
  const data = dailyTotals.map((p) => p.total);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        ticks: { color: "#a1a1aa", maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: 12 },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#a1a1aa",
          callback(value) {
            return `$${Number(value).toFixed(0)}`;
          },
        },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title(items) {
            const i = items[0]?.dataIndex;
            if (i == null) return "";
            return dailyTotals[i]?.date ?? "";
          },
          label(ctx) {
            const value = typeof ctx.raw === "number" ? ctx.raw : 0;
            return ` ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  const hasSpend = data.some((v) => v > 0);

  if (!hasSpend) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        No daily spend recorded for this month yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full md:h-80">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Daily spend",
              data,
              borderColor: "rgb(96 165 250)",
              backgroundColor: "rgba(96, 165, 250, 0.12)",
              tension: 0.25,
              fill: true,
              pointRadius: 2,
              pointHoverRadius: 5,
              pointBackgroundColor: "rgb(96 165 250)",
            },
          ],
        }}
        options={options}
      />
    </div>
  );
}
