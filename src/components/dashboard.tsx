"use client";

import type { Expense } from "@prisma/client";
import type { Category } from "@/lib/categories";
import { BarChart3, CalendarDays, Loader2, PiggyBank, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiInsightsPanel } from "@/components/ai-insights-panel";
import { SpendingDailyLineChart } from "@/components/charts/spending-daily-line";
import { SpendingPieChart } from "@/components/charts/spending-pie";
import { AddExpenseForm } from "@/components/expenses/add-expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { GlassCard } from "@/components/glass-card";

type SummaryResponse = {
  year: number;
  month: number;
  total: number;
  expenseCount: number;
  byCategory: Record<Category, number>;
  dailyTotals: { date: string; total: number }[];
  monthlyTotals: { month: string; total: number }[];
};

const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

function monthKeyFromInput(value: string): { year: number; month: number; key: string } | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const [y, m] = value.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  return { year: y, month: m, key: `${y}-${String(m).padStart(2, "0")}` };
}

export function Dashboard() {
  const defaultMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [monthInput, setMonthInput] = useState(defaultMonth);
  /** Stable object per `monthInput` — a new object every render broke `useCallback`/`useEffect` and re-fetched APIs in a loop. */
  const parsed = useMemo(() => monthKeyFromInput(monthInput), [monthInput]);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!parsed) return;
    setError(null);
    setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        fetch(`/api/expenses?month=${parsed.key}`),
        fetch(`/api/summary?year=${parsed.year}&month=${parsed.month}`),
      ]);
      if (!expRes.ok) throw new Error("Failed to load expenses");
      if (!sumRes.ok) throw new Error("Failed to load summary");
      const expJson = (await expRes.json()) as { expenses: Expense[] };
      const sumJson = (await sumRes.json()) as SummaryResponse;
      setExpenses(expJson.expenses);
      setSummary(sumJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [parsed]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:gap-10 md:px-8 md:py-14">
      <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-10 md:flex-row md:items-end md:justify-between md:gap-8 md:pb-12">
        <div className="max-w-2xl space-y-4">
          <div className="glass-chip text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-300/95" aria-hidden />
            Smart Personal Finance Dashboard
          </div>
          <h1 className="text-display-sm text-zinc-50 md:text-display">Your money, at a glance</h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-zinc-400">
            Track spending by category, review monthly trends, and surface AI-style insights from your data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="btn-glass">
            Charts only
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
          <button type="button" onClick={() => void refreshData()} className="btn-glass">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
            Refresh
          </button>
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
        <p className="text-sm text-zinc-500">Pick a valid month to continue.</p>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-3 md:gap-6">
            <GlassCard>
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Month total</p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-4xl">
                    {loading || !summary ? "—" : money.format(summary.total)}
                  </p>
                </div>
                <div className="kpi-icon-wrap text-blue-300">
                  <PiggyBank className="h-6 w-6" aria-hidden />
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Transactions</p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-4xl">
                    {loading || !summary ? "—" : summary.expenseCount}
                  </p>
                </div>
                <div className="kpi-icon-wrap text-violet-300">
                  <BarChart3 className="h-6 w-6" aria-hidden />
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Avg / entry</p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-4xl">
                    {loading || !summary || summary.expenseCount === 0
                      ? "—"
                      : money.format(summary.total / summary.expenseCount)}
                  </p>
                </div>
                <div className="kpi-icon-wrap text-emerald-300">
                  <Sparkles className="h-6 w-6" aria-hidden />
                </div>
              </div>
            </GlassCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <GlassCard title="Spending by category" description="Pie chart (Chart.js) for the selected month.">
              {loading || !summary ? (
                <div className="flex h-64 items-center justify-center text-zinc-500">
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                </div>
              ) : (
                <SpendingPieChart byCategory={summary.byCategory} />
              )}
            </GlassCard>
            <GlassCard title="Expenses over time" description="Daily totals within the selected month (Chart.js line).">
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

          <GlassCard title="Add expense" description="New entries use the category you pick and appear in charts for their date month.">
            <AddExpenseForm monthKey={parsed.key} onCreated={refreshData} />
          </GlassCard>

          <GlassCard title="All expenses" description={`Showing ${parsed.key}. Edit or delete inline.`}>
            {loading ? (
              <div className="flex justify-center py-16 text-zinc-500">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              </div>
            ) : (
              <ExpenseList expenses={expenses} onChanged={refreshData} />
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}
