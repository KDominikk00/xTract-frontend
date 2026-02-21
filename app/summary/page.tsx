"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/AuthProvider";
import { getUserTier } from "@/lib/aiPlan";
import { getSummary, type MarketSummary } from "@/lib/fetchStock";
import { getCachedMarketSummary, setCachedMarketSummary } from "@/lib/aiQuotaClient";
import { getAccessToken } from "@/lib/getAccessToken";

type AIReportsResponse = {
  middayReport?: string;
  closingReport?: string;
  generatedAt?: string;
  error?: string;
};

export default function MarketPage() {
  const container = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const tier = useMemo(() => getUserTier(user), [user]);
  const isPaid = tier === "plus" || tier === "pro";
  const [summaryData, setSummaryData] = useState<MarketSummary[]>([]);
  const [reportState, setReportState] = useState<"idle" | "loading" | "ready" | "forbidden" | "error">("idle");
  const [middayReport, setMiddayReport] = useState("");
  const [closingReport, setClosingReport] = useState("");

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "dataSource": "SPX500",
        "blockSize": "market_cap_basic",
        "blockColor": "change",
        "grouping": "sector",
        "locale": "en",
        "colorTheme": "dark",
        "isZoomEnabled": true,
        "hasSymbolTooltip": true,
        "width": "100%",
        "height": "100%"
      }`;
    container.current.appendChild(script);
  }, []);

  useEffect(() => {
    async function fetchMarketSummaryData() {
      try {
        const summary = await getSummary();
        setSummaryData(summary);
      } catch (err) {
        console.error("Failed to fetch summary data for AI reports:", err);
        setSummaryData([]);
      }
    }

    void fetchMarketSummaryData();
  }, []);

  useEffect(() => {
    if (!user || !isPaid) {
      setReportState(user ? "forbidden" : "idle");
      setMiddayReport("");
      setClosingReport("");
      return;
    }
    if (summaryData.length === 0) return;

    async function fetchAIReports() {
      try {
        const summarySignature = JSON.stringify(
          summaryData.map((item) => ({
            symbol: item.symbol,
            price: Number(item.price.toFixed(2)),
            changePercent: Number(item.changePercent.toFixed(2)),
          }))
        );

        const cached = getCachedMarketSummary(tier, summarySignature);
        if (cached) {
          setMiddayReport(cached.middayReport);
          setClosingReport(cached.closingReport);
          setReportState("ready");
          return;
        }

        setReportState("loading");
        const token = await getAccessToken();
        if (!token) {
          setReportState("forbidden");
          return;
        }

        const res = await fetch("/api/ai/market-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ summary: summaryData }),
        });

        const data = (await res.json()) as AIReportsResponse;
        if (res.status === 403) {
          setReportState("forbidden");
          return;
        }
        if (!res.ok || !data.middayReport || !data.closingReport) {
          throw new Error(data.error ?? "Failed to load AI reports");
        }

        setMiddayReport(data.middayReport);
        setClosingReport(data.closingReport);
        setCachedMarketSummary(tier, summarySignature, {
          middayReport: data.middayReport,
          closingReport: data.closingReport,
          generatedAt: data.generatedAt ?? new Date().toISOString(),
        });
        setReportState("ready");
      } catch (err) {
        console.error("Failed to fetch AI market reports:", err);
        setReportState("error");
      }
    }

    void fetchAIReports();
  }, [user, isPaid, summaryData, tier]);

  return (
    <PageLayout className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6 sm:py-14">
      <h1 className="mb-6 text-center text-3xl font-bold text-blue-500 sm:mb-8 sm:text-4xl md:text-left">
        Market Summary
      </h1>

      <div className="h-[28rem] rounded-xl bg-[#0e111a] p-3 shadow-md sm:h-[34rem] sm:p-4 lg:h-[38rem]">
        <div
          className="tradingview-widget-container w-full h-full"
          ref={container}
        >
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </div>

      <p className="text-gray-400 text-sm mt-4 text-center">
        Live market heatmap powered by TradingView.
      </p>

      <section className="mt-10 sm:mt-12">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">
          AI Market Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0e111a] rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              Mid-Day Report
            </h3>
            {reportState === "ready" ? (
              <p className="text-gray-300 text-sm leading-relaxed">{middayReport}</p>
            ) : reportState === "loading" ? (
              <p className="text-gray-400 text-sm leading-relaxed">Generating AI report...</p>
            ) : reportState === "forbidden" ? (
              <p className="text-gray-300 text-sm leading-relaxed">
                Available on paid plans (Plus or Pro).
              </p>
            ) : reportState === "error" ? (
              <p className="text-red-300 text-sm leading-relaxed">AI report is currently unavailable.</p>
            ) : (
              <p className="text-gray-400 text-sm leading-relaxed">Log in to load AI reports.</p>
            )}
          </div>

          <div className="bg-[#0e111a] rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              Closing Report
            </h3>
            {reportState === "ready" ? (
              <p className="text-gray-300 text-sm leading-relaxed">{closingReport}</p>
            ) : reportState === "loading" ? (
              <p className="text-gray-400 text-sm leading-relaxed">Generating AI report...</p>
            ) : reportState === "forbidden" ? (
              <p className="text-gray-300 text-sm leading-relaxed">
                Available on paid plans (Plus or Pro).
              </p>
            ) : reportState === "error" ? (
              <p className="text-red-300 text-sm leading-relaxed">AI report is currently unavailable.</p>
            ) : (
              <p className="text-gray-400 text-sm leading-relaxed">Log in to load AI reports.</p>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
