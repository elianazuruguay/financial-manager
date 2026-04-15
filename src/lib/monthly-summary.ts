import type { Category } from "@/lib/categories";
import { isCategory } from "@/lib/categories";
import { emptyByCategory } from "@/lib/by-category";
import { localDateKey, parseYearMonth } from "@/lib/dates";
import type { Expense } from "@/types/expense";

export type SummaryPayload = {
  year: number;
  month: number;
  total: number;
  expenseCount: number;
  byCategory: Record<Category, number>;
  dailyTotals: { date: string; total: number }[];
  monthlyTotals: { month: string; total: number }[];
};

function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Aggregates for charts / KPIs from in-memory expense list (replaces /api/summary). */
export function computeMonthlySummary(expenses: Expense[], year: number, month: number): SummaryPayload {
  const { start, end } = parseYearMonth(year, month);

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });

  const byCategory = emptyByCategory();
  let total = 0;
  const byDay = new Map<string, number>();

  for (const e of monthExpenses) {
    if (isCategory(e.category)) {
      byCategory[e.category] += e.amount;
    }
    total += e.amount;
    const dk = localDateKey(new Date(e.date));
    byDay.set(dk, (byDay.get(dk) ?? 0) + e.amount);
  }

  const lastDay = new Date(year, month, 0).getDate();
  const dailyTotals: { date: string; total: number }[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month - 1, day);
    const key = localDateKey(d);
    dailyTotals.push({ date: key, total: byDay.get(key) ?? 0 });
  }

  const rangeEnd = end;
  const rangeStart = new Date(year, month - 1 - 5, 1);
  const seriesRaw = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= rangeStart && d <= rangeEnd;
  });

  const totalsByMonth = new Map<string, number>();
  for (const e of seriesRaw) {
    const key = monthKeyFromDate(new Date(e.date));
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + e.amount);
  }

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    months.push(monthKeyFromDate(d));
  }

  const monthlyTotals = months.map((key) => ({
    month: key,
    total: totalsByMonth.get(key) ?? 0,
  }));

  return {
    year,
    month,
    total,
    expenseCount: monthExpenses.length,
    byCategory,
    dailyTotals,
    monthlyTotals,
  };
}
