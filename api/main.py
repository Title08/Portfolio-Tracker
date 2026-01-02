import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

app = FastAPI(title="Portfolio Tracker API", description="API for fetching real-time financial data using yfinance.")

# Configure CORS to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Portfolio Tracker API is running"}

@app.get("/search")
def search_assets(q: str):
    """
    Search for assets using yfinance.
    
    Args:
        q (str): The search query (e.g., "AAPL", "Bitcoin").
        
    Returns:
        List[dict]: A list of search results with symbol, name, type, and currency.
    """
    if not q:
        return []
    
    try:
        tickers = yf.Search(q, max_results=10).quotes
        results = []
        for t in tickers:
            results.append({
                "symbol": t['symbol'],
                "name": t.get('shortname', t.get('longname', t['symbol'])),
                "type": t.get('quoteType', 'Unknown'),
                "exchDisp": t.get('exchDisp', ''),
                "currency": "USD" # yfinance search doesn't always return currency, default to check later
            })
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return []

@app.get("/info")
def get_asset_info(symbol: str):
    """
    Get detailed information about a specific asset.
    
    Args:
        symbol (str): The ticker symbol (e.g., "AAPL").
        
    Returns:
        dict: Asset details including current price, currency, sector, and industry.
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Determine price (prioritize fast access fields)
        price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose')
        
        return {
            "symbol": symbol,
            "name": info.get('shortName') or info.get('longName'),
            "price": price,
            "currency": info.get('currency', 'USD'),
            "sector": info.get('sector', 'Unknown'),
            "industry": info.get('industry', 'Unknown'),
            "type": info.get('quoteType', 'Unknown')
        }
    except Exception as e:
        print(f"Info error for {symbol}: {e}")
        raise HTTPException(status_code=404, detail="Asset not found")

@app.get("/prices")
def get_current_prices(symbols: str):
    """
    Fetch real-time prices for multiple symbols.
    
    Args:
        symbols (str): Comma-separated list of ticker symbols.
        
    Returns:
        dict: A mapping of symbols to their current market price.
    """
    if not symbols:
        return {}
        
    symbol_list = [s.strip().upper() for s in symbols.split(',')]
    prices = {}
    
    # Batch strategy: yfinance Tickers
    try:
        tickers = yf.Tickers(' '.join(symbol_list))
        
        for symbol in symbol_list:
            try:
                # Attempt to get fast price
                ticker = tickers.tickers[symbol]
                
                # Try fast_info first (faster, no full fetch)
                if hasattr(ticker, 'fast_info'):
                    price = ticker.fast_info.last_price
                    if price:
                        prices[symbol] = price
                        continue
                
                # Fallback to history (slower but reliable)
                hist = ticker.history(period="1d")
                if not hist.empty:
                    prices[symbol] = hist['Close'].iloc[-1]
                else:
                    # Last Resort: info
                    prices[symbol] = ticker.info.get('currentPrice', 0)
                    
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
                prices[symbol] = 0
                
        return prices
    except Exception as e:
        print(f"Batch fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
