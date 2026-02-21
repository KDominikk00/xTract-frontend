"use client";

import {
  type AITier,
  getQuotaWindowKey,
} from "@/lib/aiPlan";

type SuggestionRecord = {
  label: string;
  reason: string;
  generatedAt: string;
};

type SuggestionStore = Record<string, SuggestionRecord>;
type MarketSummaryRecord = {
  signature: string;
  middayReport: string;
  closingReport: string;
  generatedAt: string;
  cachedAt: string;
};
type MarketSummaryStore = Partial<Record<AITier, MarketSummaryRecord>>;

const SUGGESTION_STORAGE_KEY = "xtract-ai-suggestion-v1";
const MARKET_SUMMARY_STORAGE_KEY = "xtract-ai-market-summary-v1";
const MARKET_SUMMARY_TTL_MS = 2 * 60 * 60 * 1000;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function buildSuggestionKey(tier: AITier, symbol: string, now = new Date()): string {
  // Key includes plan+window so cache naturally expires when quota window or tier changes.
  return `${tier}:${getQuotaWindowKey(tier, now)}:${symbol.toUpperCase()}`;
}

export function getCachedSuggestion(tier: AITier, symbol: string): SuggestionRecord | null {
  if (typeof window === "undefined") return null;
  const store = readJson<SuggestionStore>(SUGGESTION_STORAGE_KEY, {});
  const key = buildSuggestionKey(tier, symbol);
  return store[key] ?? null;
}

export function setCachedSuggestion(
  tier: AITier,
  symbol: string,
  suggestion: SuggestionRecord
): void {
  if (typeof window === "undefined") return;
  const store = readJson<SuggestionStore>(SUGGESTION_STORAGE_KEY, {});
  const key = buildSuggestionKey(tier, symbol);
  store[key] = suggestion;
  writeJson(SUGGESTION_STORAGE_KEY, store);
}

export function getCachedMarketSummary(
  tier: AITier,
  signature: string
): Omit<MarketSummaryRecord, "signature" | "cachedAt"> | null {
  if (typeof window === "undefined") return null;
  const store = readJson<MarketSummaryStore>(MARKET_SUMMARY_STORAGE_KEY, {});
  const record = store[tier];
  if (!record) return null;
  if (record.signature !== signature) return null;

  // Short TTL keeps summaries fresh while still reducing repeated AI calls.
  const cachedAtMs = Date.parse(record.cachedAt);
  if (!Number.isFinite(cachedAtMs)) return null;
  if (Date.now() - cachedAtMs > MARKET_SUMMARY_TTL_MS) return null;

  return {
    middayReport: record.middayReport,
    closingReport: record.closingReport,
    generatedAt: record.generatedAt,
  };
}

export function setCachedMarketSummary(
  tier: AITier,
  signature: string,
  summary: {
    middayReport: string;
    closingReport: string;
    generatedAt: string;
  }
): void {
  if (typeof window === "undefined") return;
  const store = readJson<MarketSummaryStore>(MARKET_SUMMARY_STORAGE_KEY, {});
  store[tier] = {
    signature,
    middayReport: summary.middayReport,
    closingReport: summary.closingReport,
    generatedAt: summary.generatedAt,
    cachedAt: new Date().toISOString(),
  };
  writeJson(MARKET_SUMMARY_STORAGE_KEY, store);
}
