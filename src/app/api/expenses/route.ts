import { NextResponse } from "next/server";
import { isCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

/** GET /api/expenses — optional `?month=YYYY-MM` filters by calendar month. */
function parseMonthParam(searchParams: URLSearchParams): { start?: Date; end?: Date } {
  const ym = searchParams.get("month");
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return {};
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { start, end } = parseMonthParam(searchParams);

  const expenses = await prisma.expense.findMany({
    ...(start && end ? { where: { date: { gte: start, lte: end } } } : {}),
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ expenses });
}

/** POST /api/expenses — create expense (JSON body: amount, category, date, description). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amount?: unknown;
      description?: unknown;
      category?: unknown;
      date?: unknown;
    };

    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const categoryRaw = typeof body.category === "string" ? body.category : "";
    const dateRaw = body.date;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (!isCategory(categoryRaw)) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }

    const date =
      typeof dateRaw === "string" && dateRaw.length > 0
        ? new Date(dateRaw)
        : new Date();
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "invalid date" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        category: categoryRaw,
        date,
        description,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
}
