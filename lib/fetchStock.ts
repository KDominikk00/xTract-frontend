export type Stock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

export async function getGainers(): Promise<Stock[]> {
  const res = await fetch("http://localhost:8000/stocks/gainers");
  if (!res.ok) throw new Error("Failed to fetch gainers");
  return res.json();
}

export async function getLosers(): Promise<Stock[]> {
  const res = await fetch("http://localhost:8000/stocks/losers");
  if (!res.ok) throw new Error("Failed to fetch losers");
  return res.json();
}