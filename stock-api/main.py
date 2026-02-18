from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SP500_TICKERS = []
SP500_NAMES = {}

@app.on_event("startup")
def load_sp500():
    """
    Load S&P 500 tickers and names from local CSV at startup.
    Ensure 'sp500.csv' is in the same folder as this file.
    """
    global SP500_TICKERS, SP500_NAMES
    df = pd.read_csv("sp500.csv")
    SP500_TICKERS = df["Symbol"].tolist()
    SP500_NAMES = dict(zip(df["Symbol"], df["Name"]))

def get_top_stocks(top_n=5, gainers=True):
    """
    Returns top gainers or losers from SP500_TICKERS.
    """
    data = []
    for symbol in SP500_TICKERS:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            price = info.get("currentPrice")
            prev_close = info.get("previousClose")

            if price is None or prev_close is None:
                continue

            change_percent = ((price - prev_close) / prev_close) * 100
            data.append({
                "symbol": symbol,
                "name": SP500_NAMES.get(symbol, ""),
                "price": round(price, 2),
                "changePercent": round(change_percent, 2)
            })
        except Exception:
            continue

    sorted_data = sorted(data, key=lambda x: x["changePercent"], reverse=gainers)
    return sorted_data[:top_n]

@app.get("/stocks/gainers")
def top_gainers(n: int = 5):
    """
    Get top gainers from S&P 500.
    """
    return get_top_stocks(top_n=n, gainers=True)

@app.get("/stocks/losers")
def top_losers(n: int = 5):
    """
    Get top losers from S&P 500.
    """
    return get_top_stocks(top_n=n, gainers=False)

@app.get("/stocks/{symbol}")
def get_stock(symbol: str):
    """
    Get detailed info for a single stock.
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="1mo", interval="1d")
        latest = hist.tail(1).iloc[0].to_dict()

        return {
            "symbol": symbol,
            "name": info.get("shortName"),
            "currency": info.get("currency"),
            "price": info.get("currentPrice"),
            "day_open": info.get("open"),
            "day_high": info.get("dayHigh"),
            "day_low": info.get("dayLow"),
            "day_close": latest.get("Close"),
            "history": hist.reset_index().to_dict(orient="records")
        }
    except Exception as e:
        return {"error": str(e)}