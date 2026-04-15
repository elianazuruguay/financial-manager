import { NextResponse } from "next/server";
import { isCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/** PUT /api/expenses/:id — replace expense fields (full update). */
export async function PUT(request: Request, context: Params) {
  const { id } = await context.params;
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
        : null;
    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "invalid date" }, { status: 400 });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        amount,
        category: categoryRaw,
        date,
        description,
      },
    });

    return NextResponse.json({ expense });
  } catch {
    return NextResponse.json({ error: "not found or invalid body" }, { status: 404 });
  }
}

/** DELETE /api/expenses/:id */
export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  try {
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
