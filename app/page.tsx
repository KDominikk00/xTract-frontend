import Image from "next/image";

export default function Home() {
  return (
    // Come back to this, this dummy grid is some straight bs
    <main className="flex flex-wrap items-start pt-28 px-6 gap-2 bg-(--color-bg) min-h-2 max-w-5xl mx-auto">
      
      <div className="w-4xl min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-black text-white hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-500">Followed Stocks</h2>
        <ul className="space-y-2">
          <li className="text-gray-500">Follow stocks to get live updates and notifications </li>
        </ul>
      </div>

      <div className="w-xl max-w-3xl min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-black text-white hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-500">Trending News</h2>
        <ul className="space-y-4 text-xl">
          <li>Market rallies as tech stocks climb <span className="text-gray-500 text-xs ml-2">thedailywire.com</span></li>
          <li>Federal Reserve announces new policy <span className="text-gray-500 text-xs ml-2">thedailywire.com</span></li>
          <li>Elon Musk teases new Tesla product <span className="text-gray-500 text-xs ml-2">thedailywire.com</span></li>
        </ul>
      </div>

      <div className="w-xs max-w-3xl min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-black text-white hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-500">Market Summary</h2>
        <ul className="space-y-4 text-xl">
          <li>S&P 500: 4250 <span className="text-xs text-red-500">(-6.7%)</span></li>
          <li>DOW  10000 <span className="text-xs text-red-500">(-6.7%)</span></li>
          <li>NR3 6969 <span className="text-xs text-red-500">(-6.7%)</span></li>
        </ul>
      </div>

            <div className="w-5/12 max-w-3xl min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-black text-white hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-500">Top Losers Today</h2>
        <ul className="space-y-2 text-xl">
          <li>NVIDIA (NVDA) $100.69  <span className="text-xs text-green-500">(+3.4%)</span></li>
          <li>NVIDIA (NVDA) $100.69  <span className="text-xs text-green-500">(+3.4%)</span></li>
          <li>NVIDIA (NVDA) $100.69  <span className="text-xs text-green-500">(+3.4%)</span></li>
        </ul>
      </div>

            <div className="w-6/12 max-w-3xl min-h-56 border border-blue-500 rounded-xl shadow-md p-6 bg-black text-white hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-500">Top Gainers Today</h2>
        <ul className="space-y-2 text-xl">
          <li>NVIDIA (NVDA) $100.69  <span className="text-xs text-green-500">(+3.4%)</span></li>
          <li>NVIDIA (NVDA) $100.69  <span className="text-xs text-green-500">(+3.4%)</span></li>
          <li>NVIDIA (NVDA) $100.69  <span className="text-xs text-green-500">(+3.4%)</span></li>
        </ul>
      </div>
    </main>
  );
}
