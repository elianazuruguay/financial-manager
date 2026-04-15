import type { Metadata } from "next";
import { DashboardAnalytics } from "@/components/dashboard-analytics";

export const metadata: Metadata = {
  title: "Dashboard | Smart Personal Finance",
  description: "Monthly totals, category breakdown, and spending over time.",
};

export default function DashboardPage() {
  return <DashboardAnalytics title="Analytics dashboard" />;
}
