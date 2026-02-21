const LOCAL_STOCK_API_BASE_URL = "http://localhost:8000";
const DEFAULT_WAKE_URL = "https://xtract-u1nk.onrender.com";
const WAKE_INTERVAL_MS = 3 * 60 * 1000;
const WAKE_FAILURE_RETRY_MS = 15 * 1000;
const WAKE_TIMEOUT_MS = 25 * 1000;

let lastWakeAttemptAt = 0;
let lastWakeSuccessAt = 0;

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function ensureScheme(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Support host:port style env values from Render/local setups.
  return `http://${value}`;
}

export function getStockApiBaseUrl(): string {
  const explicitBaseUrl = process.env.STOCK_API_BASE_URL?.trim();
  if (explicitBaseUrl) {
    return trimTrailingSlashes(explicitBaseUrl);
  }

  const hostPort = process.env.STOCK_API_HOSTPORT?.trim();
  if (hostPort) {
    return trimTrailingSlashes(ensureScheme(hostPort));
  }

  return LOCAL_STOCK_API_BASE_URL;
}

export function buildStockApiUrl(pathname: string, searchParams?: URLSearchParams): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = new URL(`${getStockApiBaseUrl()}${normalizedPath}`);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url.toString();
}

export async function wakeStockApiIfNeeded(): Promise<void> {
  const now = Date.now();
  if (now - lastWakeSuccessAt < WAKE_INTERVAL_MS) return;
  if (now - lastWakeAttemptAt < WAKE_FAILURE_RETRY_MS) return;
  lastWakeAttemptAt = now;

  const wakeUrl = (process.env.STOCK_API_WAKE_URL?.trim() || DEFAULT_WAKE_URL).replace(/\/+$/, "");

  try {
    const res = await fetch(`${wakeUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(WAKE_TIMEOUT_MS),
    });
    if (res.ok) {
      lastWakeSuccessAt = now;
    }
  } catch {
    // Ignore wake failures here; the actual proxy request will still surface a real error.
  }
}
