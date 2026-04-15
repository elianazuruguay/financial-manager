"use client";

import type { Category } from "@/lib/categories";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { createExpense, validateCreateBody } from "@/lib/expenses-storage";
import { Plus } from "lucide-react";
import { useState } from "react";

type Props = {
  monthKey: string;
  onCreated: () => Promise<void> | void;
};

export function AddExpenseForm({ monthKey, onCreated }: Props) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("FOOD");
  const [date, setDate] = useState(() => {
    const [y, m] = monthKey.split("-").map(Number);
    const d = new Date();
    if (d.getFullYear() === y && d.getMonth() + 1 === m) {
      return d.toISOString().slice(0, 10);
    }
    return `${monthKey}-01`;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const v = validateCreateBody({
        amount: Number(amount),
        category,
        date,
        description,
      });
      if (!v.ok) {
        throw new Error(v.error);
      }
      createExpense(v.data);
      setAmount("");
      setDescription("");
      setCategory("FOOD");
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-zinc-500";

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
      <label className="flex flex-col gap-2 lg:col-span-3">
        <span className={labelCls}>Amount</span>
        <input
          required
          min={0.01}
          step="0.01"
          inputMode="decimal"
          type="number"
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          className="glass-input"
          placeholder="0.00"
        />
      </label>
      <label className="flex flex-col gap-2 lg:col-span-4">
        <span className={labelCls}>Description</span>
        <input
          required
          type="text"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          className="glass-input"
          placeholder="What did you buy?"
        />
      </label>
      <label className="flex flex-col gap-2 lg:col-span-2">
        <span className={labelCls}>Category</span>
        <select
          value={category}
          onChange={(ev) => setCategory(ev.target.value as Category)}
          className="glass-input cursor-pointer"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c} className="bg-zinc-900">
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 lg:col-span-2">
        <span className={labelCls}>Date</span>
        <input
          required
          type="date"
          value={date}
          onChange={(ev) => setDate(ev.target.value)}
          className="glass-input cursor-pointer"
        />
      </label>
      <div className="flex flex-col gap-2 lg:col-span-1">
        <span className={`${labelCls} hidden lg:block`}>Save</span>
        <button type="submit" disabled={submitting} className="btn-glass-primary h-11 lg:h-auto">
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </button>
      </div>
      {error != null ? (
        <p className="text-sm text-red-300 md:col-span-2 lg:col-span-12" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
