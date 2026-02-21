import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

type QuotesRequestBody = {
  symbols?: unknown;
};

type QuoteResponseRow = {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
};

function parseSymbols(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const parsed = input
    .filter((value): value is string => typeof value === "string")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z.\-]{1,12}$/.test(symbol));

  return Array.from(new Set(parsed)).slice(0, 30);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuotesRequestBody;
    const symbols = parseSymbols(body.symbols);

    if (symbols.length === 0) {
      return NextResponse.json({ quotes: [] });
    }

    const yf = new YahooFinance();
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await yf.quote(symbol);
          if (
            typeof quote.symbol !== "string" ||
            typeof quote.regularMarketPrice !== "number" ||
            typeof quote.regularMarketChangePercent !== "number"
          ) {
            return null;
          }

          return {
            symbol: quote.symbol,
            name: quote.shortName || quote.longName || quote.symbol,
            currentPrice: quote.regularMarketPrice,
            changePercent: quote.regularMarketChangePercent,
          } as QuoteResponseRow;
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      quotes: results.filter((row): row is QuoteResponseRow => row !== null),
    });
  } catch (err) {
    console.error("Quotes route error:", err);
    return NextResponse.json({ error: "Unable to fetch quotes." }, { status: 500 });
  }
}
