import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import requests

app = FastAPI()

# Enable CORS for React Frontend (default port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/")
def read_root():
    return {"status": "ok", "message": "Portfolio Tracker API is running"}

@app.get("/search")
def search_symbols(q: str):
    if not q:
        return []
    
    url = f"https://query2.finance.yahoo.com/v1/finance/search"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    params = {
        'q': q,
        'quotesCount': 10,
        'newsCount': 0,
        'listsCount': 0,
        'enableFuzzyQuery': False
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        if 'quotes' in data:
            return data['quotes']
        return []
    except Exception as e:
        print(f"Error searching: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/info")
def get_asset_info(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "website": info.get("website", ""),
            "logo_url": info.get("logo_url", "")
        }
    except Exception as e:
        print(f"Error fetching info for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prices")
def get_prices(symbols: str):
    """
    Fetch current prices for a comma-separated list of symbols.
    Example: /prices?symbols=AAPL,BTC-USD
    """
    if not symbols:
        return {}
    
    symbol_list = [s.strip().upper() for s in symbols.split(',')]
    
    try:
        # yfinance allows fetching multiple tickers at once
        tickers = yf.Tickers(' '.join(symbol_list))
        
        results = {}
        for symbol in symbol_list:
            try:
                # Try to get fast price first
                ticker = tickers.tickers[symbol]
                # info = ticker.info # Too slow
                # history = ticker.history(period="1d") # Faster
                
                # Use fast_info if available (newer versions of yfinance)
                if hasattr(ticker, 'fast_info'):
                     price = ticker.fast_info['last_price']
                else:
                     # Fallback to history for older versions or if fast_info fails
                     hist = ticker.history(period="1d")
                     if not hist.empty:
                         price = hist['Close'].iloc[-1]
                     else:
                         price = 0

                results[symbol] = price
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
                results[symbol] = 0 # Or null
                
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
