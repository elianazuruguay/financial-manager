import type { Expense } from "@/types/expense";
import { isCategory } from "@/lib/categories";

const STORAGE_KEY = "financial-manager-expenses-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isExpenseRow(x: unknown): x is Expense {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.amount === "number" &&
    typeof o.category === "string" &&
    typeof o.date === "string" &&
    typeof o.description === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.updatedAt === "string"
  );
}

function readRaw(): Expense[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isExpenseRow);
  } catch {
    return [];
  }
}

function writeAll(expenses: Expense[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

/** All expenses, newest first (same ordering as former API). */
export function getAllExpenses(): Expense[] {
  const rows = readRaw();
  return [...rows].sort((a, b) => {
    const db = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (db !== 0) return db;
    return b.id.localeCompare(a.id);
  });
}

function monthRange(ym: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}$/.test(ym)) return null;
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getExpensesForMonth(monthKey: string): Expense[] {
  const range = monthRange(monthKey);
  if (!range) return [];
  const { start, end } = range;
  return getAllExpenses().filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
}

export type CreateExpenseInput = {
  amount: number;
  category: string;
  date: string;
  description: string;
};

export function createExpense(input: CreateExpenseInput): Expense {
  const now = new Date().toISOString();
  const dateIso = new Date(input.date).toISOString();
  const expense: Expense = {
    id: isBrowser() && typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    amount: input.amount,
    category: input.category,
    date: dateIso,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };
  const all = readRaw();
  all.push(expense);
  writeAll(all);
  return expense;
}

export type UpdateExpenseInput = {
  amount: number;
  category: string;
  date: string;
  description: string;
};

export function updateExpense(id: string, input: UpdateExpenseInput): Expense | null {
  const all = readRaw();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const dateIso = new Date(input.date).toISOString();
  const updated: Expense = {
    ...all[idx]!,
    amount: input.amount,
    category: input.category,
    date: dateIso,
    description: input.description,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function deleteExpense(id: string): boolean {
  const all = readRaw();
  const next = all.filter((e) => e.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}

/** Validate create payload (mirrors former API checks). */
export function validateCreateBody(body: {
  amount: unknown;
  description: unknown;
  category: unknown;
  date: unknown;
}): { ok: true; data: CreateExpenseInput } | { ok: false; error: string } {
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categoryRaw = typeof body.category === "string" ? body.category : "";
  const dateRaw = body.date;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "amount must be a positive number" };
  }
  if (!description) {
    return { ok: false, error: "description is required" };
  }
  if (!isCategory(categoryRaw)) {
    return { ok: false, error: "invalid category" };
  }

  const date =
    typeof dateRaw === "string" && dateRaw.length > 0 ? new Date(dateRaw) : new Date();
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "invalid date" };
  }

  return {
    ok: true,
    data: {
      amount,
      category: categoryRaw,
      date: dateRaw as string,
      description,
    },
  };
}

export function validateUpdateBody(body: {
  amount: unknown;
  description: unknown;
  category: unknown;
  date: unknown;
}): { ok: true; data: UpdateExpenseInput } | { ok: false; error: string } {
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categoryRaw = typeof body.category === "string" ? body.category : "";
  const dateRaw = body.date;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "amount must be a positive number" };
  }
  if (!description) {
    return { ok: false, error: "description is required" };
  }
  if (!isCategory(categoryRaw)) {
    return { ok: false, error: "invalid category" };
  }

  const date = typeof dateRaw === "string" && dateRaw.length > 0 ? new Date(dateRaw) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return { ok: false, error: "invalid date" };
  }

  return {
    ok: true,
    data: {
      amount,
      category: categoryRaw,
      date: dateRaw as string,
      description,
    },
  };
}
