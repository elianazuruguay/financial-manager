export const CATEGORY_ORDER = [
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "UTILITIES",
  "HEALTH",
  "SHOPPING",
  "OTHER",
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  ENTERTAINMENT: "Entertainment",
  UTILITIES: "Utilities",
  HEALTH: "Health",
  SHOPPING: "Shopping",
  OTHER: "Other",
};

export const CHART_COLORS: Record<Category, string> = {
  FOOD: "rgb(52 211 153)",
  TRANSPORT: "rgb(96 165 250)",
  ENTERTAINMENT: "rgb(192 132 252)",
  UTILITIES: "rgb(251 191 36)",
  HEALTH: "rgb(248 113 113)",
  SHOPPING: "rgb(244 114 182)",
  OTHER: "rgb(148 163 184)",
};

const allowed = new Set<string>(CATEGORY_ORDER);

export function isCategory(value: string): value is Category {
  return allowed.has(value);
}
