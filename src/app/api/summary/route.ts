import { NextResponse } from "next/server";
import type { Category } from "@/lib/categories";
import { isCategory } from "@/lib/categories";
import { emptyByCategory } from "@/lib/by-category";
import { currentYearMonth, localDateKey, parseYearMonth } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fallback = currentYearMonth();
  const year = Number(searchParams.get("year") ?? fallback.year);
  const month = Number(searchParams.get("month") ?? fallback.month);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "invalid year or month" }, { status: 400 });
  }

  const { start, end } = parseYearMonth(year, month);

  const monthExpenses = await prisma.expense.findMany({
    where: { date: { gte: start, lte: end } },
    select: { amount: true, category: true, date: true },
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
  const seriesRaw = await prisma.expense.findMany({
    where: { date: { gte: rangeStart, lte: rangeEnd } },
    select: { amount: true, date: true },
  });

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const totalsByMonth = new Map<string, number>();
  for (const e of seriesRaw) {
    const key = monthKey(new Date(e.date));
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + e.amount);
  }

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    months.push(monthKey(d));
  }

  const monthlyTotals = months.map((key) => ({
    month: key,
    total: totalsByMonth.get(key) ?? 0,
  }));

  return NextResponse.json({
    year,
    month,
    total,
    expenseCount: monthExpenses.length,
    byCategory: byCategory satisfies Record<Category, number>,
    dailyTotals,
    monthlyTotals,
  });
}
