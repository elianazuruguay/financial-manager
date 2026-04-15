"use client";

import { AiInsightsPanel } from "@/components/ai-insights-panel";
import { SpendingDailyLineChart } from "@/components/charts/spending-daily-line";
import { SpendingPieChart } from "@/components/charts/spending-pie";
import { GlassCard } from "@/components/glass-card";
import { getAllExpenses } from "@/lib/expenses-storage";
import { computeMonthlySummary, type SummaryPayload } from "@/lib/monthly-summary";
import { CalendarDays, Loader2, PieChart as PieChartIcon, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export type { SummaryPayload };

const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

function monthKeyFromInput(value: string): { year: number; month: number; key: string } | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const [y, m] = value.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  return { year: y, month: m, key: `${y}-${String(m).padStart(2, "0")}` };
}

type Props = {
  /** When set, used as page title / aria landmark */
  title?: string;
};

export function DashboardAnalytics({ title = "Dashboard" }: Props) {
  const defaultMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [monthInput, setMonthInput] = useState(defaultMonth);
  const parsed = useMemo(() => monthKeyFromInput(monthInput), [monthInput]);

  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!parsed) return;
    setError(null);
    setLoading(true);
    try {
      const all = getAllExpenses();
      setSummary(computeMonthlySummary(all, parsed.year, parsed.month));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [parsed]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthLabel = parsed
    ? new Date(parsed.year, parsed.month - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" })
    : "";

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:gap-10 md:px-8 md:py-14">
      <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-10 md:flex-row md:items-end md:justify-between md:gap-8 md:pb-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-display-sm text-zinc-50 md:text-display">{title}</h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-zinc-400">
            Total spend for the month, category mix, and daily outflows (Chart.js).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="btn-glass">
            Full app
          </Link>
          <label className="glass-chip cursor-pointer gap-2 py-2 pl-3 pr-3 text-sm text-zinc-200">
            <CalendarDays className="h-4 w-4 text-zinc-500" aria-hidden />
            <span className="sr-only">Month</span>
            <input
              type="month"
              value={monthInput}
              onChange={(ev) => setMonthInput(ev.target.value)}
              className="bg-transparent text-sm text-zinc-100 outline-none"
            />
          </label>
        </div>
      </header>

      {error != null ? (
        <div
          className="rounded-xl border border-red-500/25 bg-red-950/35 px-5 py-4 text-sm leading-relaxed text-red-100 shadow-glass-sm backdrop-blur-md"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {!parsed ? (
        <p className="text-sm text-zinc-500">Select a valid month.</p>
      ) : (
        <>
          <section aria-labelledby="monthly-total-heading">
            <GlassCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/[0.12] via-transparent to-violet-500/[0.06] shadow-glass">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 space-y-3">
                  <p
                    id="monthly-total-heading"
                    className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500"
                  >
                    Total monthly expenses
                  </p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-5xl">
                    {loading || !summary ? "—" : money.format(summary.total)}
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {monthLabel}
                    {summary != null ? ` · ${summary.expenseCount} transaction${summary.expenseCount === 1 ? "" : "s"}` : null}
                  </p>
                </div>
                <div className="kpi-icon-wrap h-16 w-16 text-blue-300">
                  <Wallet className="h-8 w-8" aria-hidden />
                </div>
              </div>
            </GlassCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-2 lg:gap-8" aria-label="Charts">
            <GlassCard
              title="Spending by category"
              description="Pie chart (Chart.js) for the selected month."
              actions={
                <span className="btn-icon-glass text-zinc-400" aria-hidden>
                  <PieChartIcon className="h-4 w-4" />
                </span>
              }
            >
              {loading || !summary ? (
                <div className="flex h-64 items-center justify-center text-zinc-500">
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                </div>
              ) : (
                <SpendingPieChart byCategory={summary.byCategory} />
              )}
            </GlassCard>

            <GlassCard
              title="Expenses over time"
              description="Daily totals within the selected month (Chart.js line)."
              actions={
                <span className="btn-icon-glass text-zinc-400" aria-hidden>
                  <TrendingUp className="h-4 w-4" />
                </span>
              }
            >
              {loading || !summary ? (
                <div className="flex h-72 items-center justify-center text-zinc-500 md:h-80">
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                </div>
              ) : (
                <SpendingDailyLineChart dailyTotals={summary.dailyTotals} />
              )}
            </GlassCard>
          </section>

          <AiInsightsPanel />
        </>
      )}
    </div>
  );
}
