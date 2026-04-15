"use client";

import { GlassCard } from "@/components/glass-card";
import { Brain, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type InsightsResponse = {
  source: string;
  expenseCount: number;
  insights: string[];
  text: string;
};

type Props = {
  className?: string;
};

export function AiInsightsPanel({ className = "" }: Props) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const json = (await res.json()) as InsightsResponse;
      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Could not load insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  return (
    <section className={className} aria-labelledby="ai-insights-heading">
      <GlassCard
        title={
          <span id="ai-insights-heading" className="inline-flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-300/95" aria-hidden />
            <span className="text-zinc-50">AI Insights</span>
          </span>
        }
        description="Powered by /api/insights — simulated analysis of your full expense history (no external API)."
        actions={
          <button
            type="button"
            onClick={() => void fetchInsights()}
            disabled={loading}
            className="btn-glass px-3 py-2 text-xs font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden />}
            Refresh
          </button>
        }
      >
        {error != null ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}

        {loading && data == null ? (
          <div className="flex items-center gap-3 py-8 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
            <span>Loading insights from /api/insights…</span>
          </div>
        ) : null}

        {data != null ? (
          <div className="space-y-6">
            <p className="text-xs text-zinc-500">
              Analyzed <span className="font-medium text-zinc-400">{data.expenseCount}</span> expense
              {data.expenseCount === 1 ? "" : "s"}
              {data.source ? (
                <>
                  {" "}
                  · <span className="capitalize">{data.source}</span>
                </>
              ) : null}
            </p>

            <ul className="space-y-4 text-[15px] leading-relaxed text-zinc-200">
              {data.insights.map((line, i) => (
                <li key={`${i}-${line.slice(0, 48)}`} className="flex gap-3.5">
                  <Brain className="mt-0.5 h-4 w-4 shrink-0 text-violet-400/90" aria-hidden />
                  <span className="text-zinc-200/95">{line}</span>
                </li>
              ))}
            </ul>

            {data.text ? (
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Full report</p>
                <div className="glass-inset-panel max-h-64 overflow-y-auto text-[15px] text-zinc-300">
                  <pre className="whitespace-pre-wrap font-sans">{data.text}</pre>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </GlassCard>
    </section>
  );
}
