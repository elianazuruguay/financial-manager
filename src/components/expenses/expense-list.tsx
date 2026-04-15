"use client";

import type { Expense } from "@prisma/client";
import type { Category } from "@/lib/categories";
import { CATEGORY_LABELS, CATEGORY_ORDER, isCategory } from "@/lib/categories";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const cellInput = "glass-input py-2 text-xs";

type Props = {
  expenses: Expense[];
  onChanged: () => Promise<void> | void;
};

export function ExpenseList({ expenses, onChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    amount: string;
    description: string;
    category: Category;
    date: string;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => expenses, [expenses]);

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    const cat: Category = isCategory(expense.category) ? expense.category : "OTHER";
    setDraft({
      amount: String(expense.amount),
      description: expense.description,
      category: cat,
      date: new Date(expense.date).toISOString().slice(0, 10),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit(id: string) {
    if (!draft) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(draft.amount),
          category: draft.category,
          date: draft.date,
          description: draft.description,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      cancelEdit();
      await onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this expense?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (editingId === id) cancelEdit();
      await onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm leading-relaxed text-zinc-500">
        No expenses for this month. Add your first entry above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-black/15 shadow-inner-soft">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            <th className="py-4 pl-4 pr-4 font-semibold">Date</th>
            <th className="py-4 pr-4 font-semibold">Description</th>
            <th className="py-4 pr-4 font-semibold">Category</th>
            <th className="py-4 pr-4 text-right font-semibold">Amount</th>
            <th className="py-4 pr-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((expense) => {
            const isEditing = editingId === expense.id;
            return (
              <tr
                key={expense.id}
                className="text-zinc-200 transition-colors duration-150 hover:bg-white/[0.03]"
              >
                <td className="py-3.5 pl-4 pr-4 align-top">
                  {isEditing && draft ? (
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(ev) => setDraft({ ...draft, date: ev.target.value })}
                      className={cellInput}
                    />
                  ) : (
                    <span className="tabular-nums text-zinc-300">{new Date(expense.date).toLocaleDateString()}</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 align-top">
                  {isEditing && draft ? (
                    <input
                      type="text"
                      value={draft.description}
                      onChange={(ev) => setDraft({ ...draft, description: ev.target.value })}
                      className={cellInput}
                    />
                  ) : (
                    <span className="text-zinc-100">{expense.description}</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 align-top">
                  {isEditing && draft ? (
                    <select
                      value={draft.category}
                      onChange={(ev) => setDraft({ ...draft, category: ev.target.value as Category })}
                      className={`${cellInput} cursor-pointer`}
                    >
                      {CATEGORY_ORDER.map((c) => (
                        <option key={c} value={c} className="bg-zinc-900">
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-300 shadow-glass-sm">
                      {isCategory(expense.category) ? CATEGORY_LABELS[expense.category] : expense.category}
                    </span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-right align-top tabular-nums">
                  {isEditing && draft ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={draft.amount}
                      onChange={(ev) => setDraft({ ...draft, amount: ev.target.value })}
                      className={`${cellInput} ml-auto w-28 text-right`}
                    />
                  ) : (
                    <span className="font-semibold text-zinc-50">{money.format(expense.amount)}</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-right align-top">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(expense.id)}
                          disabled={busyId === expense.id}
                          className="btn-icon-glass text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={busyId === expense.id}
                          className="btn-icon-glass text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(expense)}
                          disabled={busyId != null}
                          className="btn-icon-glass text-zinc-400 hover:text-zinc-100 disabled:opacity-50"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(expense.id)}
                          disabled={busyId === expense.id}
                          className="btn-icon-glass text-red-400/95 hover:text-red-300 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
