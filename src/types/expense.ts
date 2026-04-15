/** Expense record persisted in the browser (localStorage). */
export type Expense = {
  id: string;
  amount: number;
  category: string;
  /** ISO 8601 datetime string */
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
