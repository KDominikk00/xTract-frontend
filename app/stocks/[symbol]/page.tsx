"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import CandlestickChart from "@/components/CandlestickChart";
import MiniChart from "@/components/MiniChart";

interface StockData {
  name: string;
  symbol: string;
  currentPrice: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  previousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  beta?: number;
  earningsTimestamp?: number;
  earningsDate?: string;
  sector?: string;
  industry?: string;
  description?: string;
}

export default function StockPage() {
  const params = useParams();
  const symbolParam = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const stockSymbol = symbolParam?.toUpperCase() || "TBD";

  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedStocks, setRelatedStocks] = useState<StockData[]>([]);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    async function fetchStock() {
      setLoading(true);
      try {
        const res = await fetch(`/stocks/api/${stockSymbol}`);
        if (!res.ok) throw new Error("Failed to fetch stock data");
        const data: StockData = await res.json();
        setStock(data);

        const allSymbols = ["AAPL", "JPM", "XOM", "KO", "JNJ", "TSLA", "BAC", "CVX", "PG", "PFE", "V", "MA", "DIS", "NFLX", "WMT", "MCD"];
        const filteredSymbols = allSymbols.filter(s => s !== stockSymbol);

        const shuffled = filteredSymbols.sort(() => 0.5 - Math.random());
        const recommendedSymbols = shuffled.slice(0, 4);

        const recommendedData: StockData[] = await Promise.all(
          recommendedSymbols.map(async (sym) => {
            const r = await fetch(`/stocks/api/${sym}`);
            if (!r.ok) throw new Error(`Failed to fetch stock ${sym}`);
            return r.json();
          })
        );

        setRelatedStocks(recommendedData);

      } catch (err) {
        console.error(err);
        setStock(null);
        setRelatedStocks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStock();
  }, [stockSymbol]);

  if (loading) return (
    <PageLayout className="max-w-7xl mx-auto px-6 py-16 text-white">
      <p className="text-center text-gray-400">Loading {stockSymbol} data...</p>
    </PageLayout>
  );

  if (!stock) return (
    <PageLayout className="max-w-7xl mx-auto px-6 py-16 text-white">
      <p className="text-center text-red-500">Failed to load stock data.</p>
    </PageLayout>
  );

  return (
    <PageLayout className="max-w-7xl mx-auto px-6 pt-16 text-white">
    <div className="mb-8 sm:mb-16 text-left">
      <div className="flex flex-row items-baseline justify-between gap-2 sm:gap-8 mb-14">
        <div className="flex flex-row flex-wrap items-baseline gap-2 sm:gap-4 min-w-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-blue-500 truncate">
            {stock.name} ({stock.symbol})
          </h1>

          <div className="flex flex-row flex-wrap items-baseline gap-1 sm:gap-2 text-white font-semibold min-w-0">
            <span className="text-xl sm:text-2xl">${stock.currentPrice.toLocaleString()}</span>
            <span className={`text-lg sm:text-xl ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <button
          className={`rounded-full text-2xl sm:text-3xl transition-colors duration-200 whitespace-nowrap ${
            followed ? "text-yellow-400 hover:text-yellow-300" : "text-gray-400 hover:text-yellow-400"
          }`}
          onClick={() => setFollowed(!followed)}
        >
          {followed ? "★" : "☆"}
        </button>
      </div>
    </div>

      <div id="container" className="w-full h-80 sm:h-96 rounded-xl shadow-md flex items-center justify-center sm:mb-8">
        <CandlestickChart />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Open", value: stock.open },
          { label: "Close", value: stock.close },
          { label: "High", value: stock.high },
          { label: "Low", value: stock.low },
          { label: "Volume", value: stock.volume.toLocaleString() },
          { label: "Market Cap", value: stock.marketCap?.toLocaleString() },
          { label: "Previous Close", value: stock.previousClose },
        ].map(item => item.value != null && (
          <div key={item.label} className="p-4 bg-[#0e111a] rounded-xl shadow-md text-center">
            <p className="text-gray-400">{item.label}</p>
            <p className="text-white font-bold">{item.value}</p>
          </div>
        ))}
        <div className="p-4 bg-[#0e111a] rounded-xl shadow-md text-center">
          <p className="text-gray-400">Change</p>
          <p className={`font-bold ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
          </p>
        </div>
                <div className="p-4 bg-[#1a274d] rounded-xl shadow-md text-center">
          <p className="text-gray-400">AI Suggestion</p>
          <strong className="text-green-500">Strong buy</strong>
        </div>
      </div>

      <div className="mb-8 p-6 bg-[#141c2f] rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">Fundamentals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "52W High", value: stock.fiftyTwoWeekHigh },
            { label: "52W Low", value: stock.fiftyTwoWeekLow },
            { label: "Trailing P/E", value: stock.trailingPE },
            { label: "Forward P/E", value: stock.forwardPE },
            { label: "Dividend Yield", value: stock.dividendYield },
            { label: "Beta", value: stock.beta },
            { label: "Earnings Date", value: stock.earningsDate },
            { label: "Sector", value: stock.sector },
            { label: "Industry", value: stock.industry },
            { label: "Description", value: stock.description },
          ].map(item => item.value != null && (
            <div key={item.label} className="p-4 bg-[#0e111a] rounded-xl shadow-md">
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className="text-white text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:mb-10">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">Recommended Stocks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {relatedStocks.map((rel) => (
            <Link
              key={rel.symbol}
              href={`/stocks/${rel.symbol}`}
              className="p-4 bg-[#0e111a] rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col hover:bg-[#141c2f] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="min-h-12">
                  <p className="text-white font-semibold wrap-break-word leading-snug">
                    {rel.name}
                  </p>
                  <p className="text-gray-400 text-sm">{rel.symbol}</p>
                </div>
                <div
                  className={`font-bold ${
                    rel.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${rel.close.toLocaleString()}
                </div>
              </div>

              <div className="text-right font-semibold mb-2">
                <span
                  className={rel.change >= 0 ? "text-green-500" : "text-red-500"}
                >
                  {rel.change >= 0 ? "+" : ""}
                  {rel.change.toFixed(2)} (
                  {rel.changePercent >= 0 ? "+" : ""}
                  {rel.changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="w-full h-40 bg-[#141c2f] rounded-md flex items-center justify-center mt-auto">
                <MiniChart symbol={rel.symbol} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}