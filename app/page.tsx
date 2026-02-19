"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { motion, easeOut } from "framer-motion";
import Link from "next/link";
import { FiCheck, FiX } from "react-icons/fi";
import { getGainers, getLosers, Stock } from "@/lib/fetchStock";

interface NewsItem {
  title: string;
  site: string;
  image: string | null;
  url: string;
  text?: string;
}

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const containerVariants = {
  hidden: {},
  show: { 
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export default function Home() {
  const { user } = useAuth();
  const isFreeTier = true; // Placeholder

  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketIndex[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    async function fetchStocks() {
      try {
        setLoadingStocks(true);
        const [gainers, losers] = await Promise.all([getGainers(5), getLosers(5)]);
        setTopGainers(gainers);
        setTopLosers(losers);
      } catch (err) {
        console.error("Failed to fetch stocks", err);
        setTopGainers([]);
        setTopLosers([]);
      } finally {
        setLoadingStocks(false);
      }
    }

    async function fetchNews() {
      try {
        setLoadingNews(true);
        const res = await fetch("http://localhost:8000/stocks/news");
        const data: NewsItem[] = await res.json();
        setTopNews(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch news", err);
        setTopNews([]);
      } finally {
        setLoadingNews(false);
      }
    }

    async function fetchSummary() {
      try {
        setLoadingSummary(true);
        const res = await fetch("http://localhost:8000/stocks/summary-data");
        const data: MarketIndex[] = await res.json();
        setMarketSummary(data);
      } catch (err) {
        console.error("Failed to fetch market summary", err);
        setMarketSummary([]);
      } finally {
        setLoadingSummary(false);
      }
    }

    fetchStocks();
    fetchNews();
    fetchSummary();
  }, []);

  const renderStockList = (stocks: Stock[]) => (
    <ul className="space-y-4 text-xl">
      {stocks.map((stock) => (
        <li key={stock.symbol}>
          {stock.symbol} ({stock.name}) ${stock.price.toFixed(2)}{" "}
          <span className={`text-xs ${stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stock.changePercent >= 0 ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </span>
        </li>
      ))}
    </ul>
  );

  const renderMarketSummary = (summary: MarketIndex[]) => (
    <ul className="space-y-4 text-xl">
      {summary.map((idx) => (
        <li key={idx.symbol}>
          <strong>{idx.name}</strong>: ${idx.price.toFixed(2)}{" "}
          <span className={idx.change >= 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
            ({idx.change >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%)
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.main
      className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-(--color-bg) min-h-2 sm:max-w-5xl m-4 my-20 sm:m-24 sm:mx-auto"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <Link href="/followed" className="sm:col-span-4 min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] text-white hover:shadow-lg transition-shadow">
        <motion.div variants={cardVariants}>
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Followed Stocks</h2>
          <p className="text-gray-500">Follow stocks to get live updates</p>
        </motion.div>
      </Link>

      <Link href="/news" className="sm:col-span-3 block min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] text-white hover:shadow-lg transition-shadow cursor-pointer">
        <motion.div variants={cardVariants}>
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Trending News</h2>
          {loadingNews ? (
            <p className="text-gray-400">Loading...</p>
          ) : topNews.length === 0 ? (
            <p className="text-gray-400">No news available</p>
          ) : (
            <ul className="space-y-4 text-xl">
              {topNews.map((news, idx) => (
                <li key={idx}>
                  <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {news.title}
                  </a>{" "}
                  <span className="text-gray-500 text-xs block sm:inline sm:ml-2">{news.site}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </Link>

      <Link href="/summary" className="col-span-1 block min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] text-white hover:shadow-lg transition-shadow cursor-pointer">
        <motion.div variants={cardVariants}>
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Market Summary</h2>
          {loadingSummary ? (
            <p className="text-gray-400">Loading...</p>
          ) : marketSummary.length === 0 ? (
            <p className="text-gray-400">No data</p>
          ) : renderMarketSummary(marketSummary)}
        </motion.div>
      </Link>

      <Link href="/stocks/losers" className="sm:col-span-2 block border border-blue-500 rounded-xl shadow-md p-6 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] text-white hover:shadow-lg transition-shadow">
        <motion.div variants={cardVariants}>
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Top Losers Today</h2>
          {loadingStocks ? <p>Loading...</p> : renderStockList(topLosers)}
        </motion.div>
      </Link>

      <Link href="/stocks/gainers" className="sm:col-span-2 block min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] text-white hover:shadow-lg transition-shadow">
        <motion.div variants={cardVariants}>
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Top Gainers Today</h2>
          {loadingStocks ? <p>Loading...</p> : renderStockList(topGainers)}
        </motion.div>
      </Link>

      <div className="sm:col-span-4 mt-16 px-4 md:px-0">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-10 md:mx-auto">
          
          <div className="flex flex-col border border-blue-500 rounded-2xl p-10 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-500 mb-2">Free</h3>
            <p className="text-white text-3xl font-bold mb-4">$0<span className="text-gray-400 text-sm">/forever</span></p>
            <ul className="space-y-2 text-white text-sm flex-1">
              <li><FiCheck className="inline text-green-500"/> Follow up to 3 stocks</li>
              <li><FiCheck className="inline text-green-500"/> AI buy/sell suggestions</li>
              <li><FiCheck className="inline text-green-500"/> Limited AI messages</li>
              <li><FiCheck className="inline text-green-500"/> Limited AI Insights</li>
              <li><FiX className="inline text-red-500"/> Custom email notifications</li>
              <li><FiX className="inline text-red-500"/> AI powered watchlist analysis</li>
              <li><FiX className="inline text-red-500"/> Mid-day &amp; closing market reports</li>
              <li><FiX className="inline text-red-500"/> AI trade sentinemt scanner</li>
              <li><FiX className="inline text-red-500"/> AI powered forecasts</li>
              <li><FiX className="inline text-red-500"/> Private beta features</li>
            </ul>
            {user && isFreeTier ? (
            <button
              className="w-full py-2 bg-gray-500 cursor-not-allowed rounded-lg font-semibold mt-6"
              disabled
            >
              Current Tier
            </button>
          ) : (
            <Link href="/signup" className="w-full">
              <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold mt-6 cursor-pointer">
                Get Started
              </button>
            </Link>
          )}
          </div>

          <div className="flex flex-col border border-blue-500 rounded-2xl p-10 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-500 mb-2">Plus</h3>
            <p className="text-white text-3xl font-bold mb-4">$5<span className="text-gray-400 text-sm">/month</span></p>
            <ul className="space-y-2 text-white text-sm flex-1">
              <li><FiCheck className="inline text-green-500"/> Follow up to 3 stocks</li>
              <li><FiCheck className="inline text-green-500"/> AI buy/sell suggestions</li>
              <li><FiCheck className="inline text-green-500"/> More AI messages</li>
              <li><FiCheck className="inline text-green-500"/> More AI Insights</li>
              <li><FiCheck className="inline text-green-500"/> Custom email notifications</li>
              <li><FiCheck className="inline text-green-500"/> AI powered watchlist analysis</li>
              <li><FiCheck className="inline text-green-500"/> Mid-day &amp; closing market reports</li>
              <li><FiX className="inline text-red-500"/> AI trade sentinemt scanner</li>
              <li><FiX className="inline text-red-500"/> AI powered forecasts</li>
              <li><FiX className="inline text-red-500"/> Private beta features</li>
            </ul>
            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors mt-6 cursor-pointer">
              Upgrade
            </button>
          </div>

          <div className="relative flex flex-col border border-blue-500 rounded-2xl p-10 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute -top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              BEST VALUE
            </div>
            <h3 className="text-xl font-bold text-blue-500 mb-2">Pro</h3>
            <p className="text-white text-3xl font-bold mb-4">$15<span className="text-gray-400 text-sm">/month</span></p>
            <ul className="space-y-2 text-white text-sm flex-1">
              <li><FiCheck className="inline text-green-500"/> Follow unlimited stocks</li>
              <li><FiCheck className="inline text-green-500"/> AI buy/sell suggestions</li>
              <li><FiCheck className="inline text-green-500"/> Unlimited AI messages</li>
              <li><FiCheck className="inline text-green-500"/> Unlimited AI Insights</li>
              <li><FiCheck className="inline text-green-500"/> Custom email notifications</li>
              <li><FiCheck className="inline text-green-500"/> AI powered watchlist analysis</li>
              <li><FiCheck className="inline text-green-500"/> Mid-day &amp; closing market reports</li>
              <li><FiCheck className="inline text-green-500"/> AI trade sentinemt scanner</li>
              <li><FiCheck className="inline text-green-500"/> AI powered forecasts</li>
              <li><FiCheck className="inline text-green-500"/> Private beta features</li>
            </ul>
            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors mt-6 cursor-pointer">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}