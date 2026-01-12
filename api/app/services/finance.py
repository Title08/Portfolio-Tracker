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

def get_market_news(category: str = "general", page: int = 0):
    """
    Fetch aggregated market news with category filtering and basic pagination simulation.
    Page 0: Primary tickers for the category.
    Page > 0: Secondary/Extended tickers for the category to simulate 'load more'.
    """
    try:
        # Define Ticker Groups
        TICKER_SETS = {
            "general": {
                "primary": ["^GSPC", "^DJI", "^IXIC", "EURUSD=X"],
                "extended": ["GC=F", "CL=F", "^TNX", "^RUT", "DX-Y.NYB", "^FTSE", "^N225"]
            },
            "tech": {
                "primary": ["NVDA", "AAPL", "MSFT", "GOOGL", "AMD"],
                "extended": ["TSLA", "META", "AMZN", "INTC", "TSM", "AVGO", "QCOM", "CRM"]
            },
            "finance": {
                "primary": ["JPM", "BAC", "V", "MA", "GS"],
                "extended": ["MS", "WFC", "C", "BLK", "AXP", "USB", "PNC", "SCHW"]
            },
            "crypto": {
                "primary": ["BTC-USD", "ETH-USD", "SOL-USD", "COIN"],
                "extended": ["BNB-USD", "XRP-USD", "ADA-USD", "DOGE-USD", "MSTR", "MARA"]
            }
        }
        
        # Default to general if invalid category
        cat_data = TICKER_SETS.get(category.lower(), TICKER_SETS["general"])
        
        # Determine source tickers based on page
        # Page 0 -> Primary
        # Page 1+ -> Extended (Chunks of extended list could be better for true pagination, 
        # but for now, switching to extended implementation)
        
        target_tickers = []
        if page == 0:
            target_tickers = cat_data["primary"]
        else:
            # Simple pagination: split extended list into chunks
            extended = cat_data["extended"]
            chunk_size = 3
            start_idx = (page - 1) * chunk_size
            
            # If we run out of extended tickers, wrap around or return empty? 
            # Let's wrap around for "infinite" feel, or just stop. 
            # Let's just grab a chunk if available.
            if start_idx < len(extended):
                target_tickers = extended[start_idx : start_idx + chunk_size]
            else:
                # If exhausted, maybe just return nothing to stop scrolling
                return []


        if not target_tickers:
            return []

        all_news_map = {} 
        
        for symbol in target_tickers:
            try:
                ticker = yf.Ticker(symbol)
                news_items = ticker.news
                
                for item in news_items:
                    if not item: continue
                    
                    # Extract UUID or Title for deduplication
                    uuid = item.get("uuid")
                    content = item.get('content', item)
                    title = content.get('title')
                    
                    key = uuid if uuid else title
                    
                    if key and key not in all_news_map:
                        if not content: content = item 
                            
                        # Link resolution
                        link = content.get('link')
                        ctu = content.get('clickThroughUrl')
                        can = content.get('canonicalUrl')
                        
                        if not link:
                            if isinstance(ctu, dict): link = ctu.get('url')
                            elif isinstance(ctu, str): link = ctu
                        
                        if not link:
                            if isinstance(can, dict): link = can.get('url')
                            elif isinstance(can, str): link = can
                            
                        # Time resolution
                        # providerPublishTime is usually Unix timestamp (seconds)
                        pub_time = content.get('providerPublishTime') or content.get('pubDate')
                        
                        # Thumbnail resolution
                        thumb = None
                        thumb_data = content.get('thumbnail')
                        if thumb_data and isinstance(thumb_data, dict):
                            resolutions = thumb_data.get('resolutions', [])
                            if resolutions and isinstance(resolutions, list) and len(resolutions) > 0:
                                thumb = resolutions[-1].get('url') 
                        
                        # Publisher
                        publisher = content.get('publisher')
                        if isinstance(publisher, dict): 
                            publisher = publisher.get('title')

                        all_news_map[key] = {
                            "id": uuid,
                            "title": title,
                            "publisher": publisher,
                            "link": link,
                            "providerPublishTime": pub_time,
                            "type": item.get("type", "STORY"),
                            "thumbnail": thumb,
                            "relatedTickers": item.get("relatedTickers", []),
                            "summary": content.get('summary')
                        }
            except Exception as e:
                continue

        # Convert to list
        processed_news = list(all_news_map.values())
        
        # Sort by publish time descending
        processed_news.sort(key=lambda x: x.get('providerPublishTime', 0) or 0, reverse=True)
        
        return processed_news

    except Exception as e:
        return []
