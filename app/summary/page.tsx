"use client";

import PageLayout from "@/components/PageLayout";

export default function MarketPage() {
  return (
        <PageLayout className="max-w-5xl mx-auto px-6 py-16 text-white">
    <h1 className="text-4xl font-bold text-blue-500 mb-8 text-center md:text-left">
        Market Summary
    </h1>

      <div className="bg-[#0e111a] rounded-xl border border-blue-500 shadow-md p-8 text-center text-gray-400">
        <p>Heatmap loading</p>
      </div>
    </PageLayout>
  );
}