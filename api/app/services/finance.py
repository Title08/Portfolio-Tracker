import yfinance as yf
from fastapi import HTTPException

def search_assets(q: str):
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
                "currency": "USD" 
            })
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return []

def get_asset_info(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
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

def get_current_prices(symbols_str: str):
    if not symbols_str:
        return {}
        
    symbol_list = [s.strip().upper() for s in symbols_str.split(',')]
    prices = {}
    
    try:
        tickers = yf.Tickers(' '.join(symbol_list))
        for symbol in symbol_list:
            try:
                ticker = tickers.tickers[symbol]
                if hasattr(ticker, 'fast_info'):
                    price = ticker.fast_info.last_price
                    if price:
                        prices[symbol] = price
                        continue
                
                hist = ticker.history(period="1d")
                if not hist.empty:
                    prices[symbol] = hist['Close'].iloc[-1]
                else:
                    prices[symbol] = ticker.info.get('currentPrice', 0)
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
                prices[symbol] = 0
        return prices
    except Exception as e:
        print(f"Batch fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
