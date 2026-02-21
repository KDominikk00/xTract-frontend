"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

type FollowedSymbolRow = {
  symbol: string;
};

type FollowedStock = {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
};

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session?.access_token ?? null;
}

export default function Followed() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState<FollowedStock[]>([]);

  const loadFollowed = useCallback(async () => {
    if (!user) {
      setStocks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) {
        setStocks([]);
        return;
      }

      const followedRes = await fetch("/api/followed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const followedData = (await followedRes.json()) as { followed?: FollowedSymbolRow[] };
      if (!followedRes.ok || !Array.isArray(followedData.followed)) {
        setStocks([]);
        return;
      }

      const loaded = await Promise.all(
        followedData.followed.map(async (item) => {
          const res = await fetch(`/stocks/api/${item.symbol}`);
          if (!res.ok) return null;
          const data = (await res.json()) as {
            symbol?: string;
            name?: string;
            currentPrice?: number;
            changePercent?: number;
          };
          if (
            typeof data.symbol !== "string" ||
            typeof data.name !== "string" ||
            typeof data.currentPrice !== "number" ||
            typeof data.changePercent !== "number"
          ) {
            return null;
          }

          return {
            symbol: data.symbol,
            name: data.name,
            currentPrice: data.currentPrice,
            changePercent: data.changePercent,
          } as FollowedStock;
        })
      );

      setStocks(loaded.filter((stock): stock is FollowedStock => stock !== null));
    } catch (err) {
      console.error("Failed to load followed stocks:", err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadFollowed();
  }, [loadFollowed]);

  async function unfollow(symbol: string) {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch("/api/followed", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) return;
      setStocks((prev) => prev.filter((stock) => stock.symbol !== symbol));
    } catch (err) {
      console.error("Failed to unfollow stock:", err);
    }
  }

  return (
    <PageLayout className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6 sm:py-14">
      <h1 className="mb-4 text-3xl font-bold text-blue-500 sm:mb-6 sm:text-4xl">Followed Stocks</h1>

      {!user ? (
        <p className="max-w-xl text-sm text-gray-400 sm:text-base">
          Log in to save and view your followed stocks.
        </p>
      ) : loading ? (
        <p className="max-w-xl text-sm text-gray-400 sm:text-base">Loading your watchlist...</p>
      ) : stocks.length === 0 ? (
        <p className="max-w-xl text-sm text-gray-400 sm:text-base">
          Your watchlist is empty. Follow stocks using the star icon on each stock page.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="rounded-xl border border-blue-500 bg-[#0e111a] p-4 shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={`/stocks/${stock.symbol}`} className="min-w-0">
                  <p className="text-lg font-semibold text-white">{stock.name}</p>
                  <p className="text-sm text-gray-400">{stock.symbol}</p>
                  <p className="mt-2 text-sm text-white">${stock.currentPrice.toFixed(2)}</p>
                  <p className={stock.changePercent >= 0 ? "text-sm text-green-400" : "text-sm text-red-400"}>
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </p>
                </Link>
                <button
                  onClick={() => unfollow(stock.symbol)}
                  className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
