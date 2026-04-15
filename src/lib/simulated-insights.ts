import type { Category } from "@/lib/categories";
import { CATEGORY_LABELS, CATEGORY_ORDER, isCategory } from "@/lib/categories";
import { localDateKey } from "@/lib/dates";

export type InsightExpense = {
  amount: number;
  category: string;
  date: Date;
  description: string;
};

function sumByCategory(rows: InsightExpense[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of rows) {
    const c = isCategory(e.category) ? e.category : "OTHER";
    m.set(c, (m.get(c) ?? 0) + e.amount);
  }
  return m;
}

function sumByDay(rows: InsightExpense[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of rows) {
    const k = localDateKey(new Date(e.date));
    m.set(k, (m.get(k) ?? 0) + e.amount);
  }
  return m;
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid]!;
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const v = mean(nums.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

/**
 * Rule-based “AI-style” insights from the full expense history (no external API).
 */
export function buildSimulatedInsights(expenses: InsightExpense[]): { insights: string[]; text: string } {
  const insights: string[] = [];

  if (expenses.length === 0) {
    insights.push(
      "No expenses on file yet. Once you add transactions, this panel will highlight your top category, unusual spend days, and savings ideas.",
    );
    return { insights, text: insights.join("\n\n") };
  }

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const avgTxn = grandTotal / expenses.length;
  const byCat = sumByCategory(expenses);
  const ranked = CATEGORY_ORDER.map((c) => ({ c, v: byCat.get(c) ?? 0 }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v);

  insights.push(
    `Across ${expenses.length} recorded expense${expenses.length === 1 ? "" : "s"}, lifetime spend is $${grandTotal.toFixed(2)} (about $${avgTxn.toFixed(2)} per line item on average).`,
  );

  // Highest spending category
  if (ranked.length > 0) {
    const top = ranked[0];
    const pct = grandTotal > 0 ? ((top.v / grandTotal) * 100).toFixed(1) : "0";
    insights.push(
      `Highest spending category: ${CATEGORY_LABELS[top.c]} at $${top.v.toFixed(2)} (${pct}% of all spend). That is the single biggest lever if you want to reshape your budget.`,
    );
  }

  // Unusual spikes — daily
  const byDay = sumByDay(expenses);
  const dailyTotals = [...byDay.values()].filter((v) => v > 0).sort((a, b) => a - b);
  const medDay = median(dailyTotals);
  const sdDay = stddev(dailyTotals);
  const spikeDays: string[] = [];
  if (medDay > 0 && dailyTotals.length >= 3) {
    const threshold = Math.max(medDay * 2.5, medDay + sdDay * 2);
    for (const [day, total] of byDay) {
      if (total >= threshold && total > medDay * 1.5) {
        spikeDays.push(`${day} ($${total.toFixed(2)})`);
      }
    }
  }
  if (spikeDays.length > 0) {
    insights.push(
      `Unusual daily spikes (well above a typical day for you): ${spikeDays.slice(0, 3).join("; ")}${spikeDays.length > 3 ? `; and ${spikeDays.length - 3} more` : ""}. Worth checking what drove those days—one-off bills vs. habits.`,
    );
  } else if (dailyTotals.length >= 5 && medDay > 0) {
    insights.push(
      `Daily spend looks relatively steady: typical active day is around $${medDay.toFixed(2)}, without extreme single-day outliers in the data.`,
    );
  }

  // Single-transaction outliers
  const amounts = expenses.map((e) => e.amount);
  const maxAmt = Math.max(...amounts);
  const maxRow = expenses.find((e) => e.amount === maxAmt);
  if (maxRow && avgTxn > 0 && maxAmt >= Math.max(avgTxn * 4, 75)) {
    const cat = isCategory(maxRow.category) ? CATEGORY_LABELS[maxRow.category as Category] : maxRow.category;
    insights.push(
      `Largest single entry: $${maxAmt.toFixed(2)} on ${localDateKey(new Date(maxRow.date))} (${cat}: “${maxRow.description.slice(0, 60)}${maxRow.description.length > 60 ? "…" : ""}”). That is roughly ${(maxAmt / avgTxn).toFixed(1)}× your average line item—treat it as a spike unless it repeats every cycle.`,
    );
  }

  // Savings suggestions (rule-based)
  const suggestions: string[] = [];
  const food = byCat.get("FOOD") ?? 0;
  const ent = byCat.get("ENTERTAINMENT") ?? 0;
  const shop = byCat.get("SHOPPING") ?? 0;
  const transport = byCat.get("TRANSPORT") ?? 0;

  if (grandTotal > 0 && food / grandTotal > 0.28) {
    suggestions.push(
      "Food is a large share of your history: try a one-week meal plan and grocery list to trim impulse dining without feeling deprived.",
    );
  }
  if (grandTotal > 0 && (ent + shop) / grandTotal > 0.22) {
    suggestions.push(
      "Entertainment and shopping add up: pick a fixed “fun budget” per month and pause discretionary buys until the next cycle.",
    );
  }
  if (grandTotal > 0 && transport / grandTotal > 0.18) {
    suggestions.push(
      "Transport is material in your data: compare recurring costs (fuel, parking, rideshare) with a transit pass or consolidated trips where possible.",
    );
  }
  if (expenses.length >= 15 && avgTxn < 40) {
    suggestions.push(
      "Many smaller purchases: a weekly 10-minute review of the last few days often catches subscriptions or duplicates you forgot about.",
    );
  }
  suggestions.push(
    "General savings move: automate a small transfer to savings on payday so spending plans compete with money that is already “gone” from checking.",
  );
  suggestions.push(
    "If a spike day was planned (travel, annual bill), add a note on future repeats so it does not look like drift in next month’s review.",
  );

  insights.push("Savings suggestions:");
  for (const s of suggestions.slice(0, 5)) {
    insights.push(s);
  }

  const text = insights.join("\n\n");
  return { insights, text };
}
