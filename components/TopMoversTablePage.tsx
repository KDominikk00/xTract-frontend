"use client";

import { useEffect, useState } from "react";
import { motion, easeOut } from "framer-motion";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { getGainers, getLosers, type Stock } from "@/lib/fetchStock";

type TopMoversTablePageProps = {
  variant: "gainers" | "losers";
  title: string;
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export default function TopMoversTablePage({
  variant,
  title,
}: TopMoversTablePageProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStocksData() {
      try {
        setLoading(true);
        const loadStocks = variant === "gainers" ? getGainers : getLosers;
        const data = await loadStocks();
        setStocks(data);
      } catch (err) {
        console.error(`Error fetching ${variant}:`, err);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchStocksData();
  }, [variant]);

  const handleRowClick = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
  };

  return (
    <PageLayout className="mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 sm:py-14">
      <h1 className="mb-6 text-3xl font-bold text-blue-500 sm:mb-8 sm:text-4xl">{title}</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1a1f2a]">
          <table className="min-w-[44rem] w-full table-auto border-collapse">
            <thead className="bg-[#141c2f] text-left text-xs text-gray-400 sm:text-sm">
              <tr>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Change</th>
                <th className="px-4 py-2">% Change</th>
                <th className="hidden px-4 py-2 md:table-cell">Exchange</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <motion.tr
                  key={stock.symbol}
                  className="cursor-pointer border-b border-[#1a1f2a] transition-colors hover:bg-[#1f2535]"
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                  onClick={() => handleRowClick(stock.symbol)}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-500">{stock.symbol}</td>
                  <td className="max-w-[12rem] truncate px-4 py-3 sm:max-w-[18rem] md:max-w-none">{stock.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">${stock.price.toFixed(2)}</td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 font-semibold ${
                      stock.change >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 font-semibold ${
                      stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{stock.exchange}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
