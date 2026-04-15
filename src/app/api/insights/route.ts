import { NextResponse } from "next/server";
import { buildSimulatedInsights } from "@/lib/simulated-insights";
import { prisma } from "@/lib/prisma";

/**
 * Loads every expense and returns simulated “AI” insights as readable strings
 * (highest category, spike detection, savings suggestions). No external APIs.
 */
async function handleInsights() {
  const expenses = await prisma.expense.findMany({
    orderBy: [{ date: "asc" }, { id: "asc" }],
    select: {
      amount: true,
      category: true,
      date: true,
      description: true,
    },
  });

  const { insights, text } = buildSimulatedInsights(expenses);

  return NextResponse.json({
    source: "simulated",
    expenseCount: expenses.length,
    insights,
    text,
  });
}

/** GET /api/insights — analyze all expenses, return insights + full narrative text. */
export async function GET() {
  try {
    return await handleInsights();
  } catch {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

/**
 * POST /api/insights — same analysis as GET (body ignored for now; kept for existing clients).
 */
export async function POST() {
  try {
    return await handleInsights();
  } catch {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
