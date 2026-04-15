import type { Category } from "@/lib/categories";
import { CATEGORY_ORDER } from "@/lib/categories";

export function emptyByCategory(): Record<Category, number> {
  return Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<Category, number>;
}
