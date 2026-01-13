import yfinance as yf
import re
from fastapi import HTTPException

# Regex to find stock tickers in title (e.g., NVDA, AAPL, MSFT in parentheses or standalone)
TICKER_PATTERN = re.compile(r'\b([A-Z]{2,5})\b|\(([A-Z]{2,5})\)')

# Common words to exclude from ticker matching
TICKER_EXCLUDES = {
    'CEO', 'CFO', 'COO', 'CTO', 'EPS', 'IPO', 'ETF', 'SEC', 'FDA', 'DOJ',
    'USA', 'IBM', 'AI', 'GDP', 'FED', 'THE', 'FOR', 'AND', 'NOT', 'ARE',
    'HAS', 'NEW', 'TOP', 'BIG', 'ALL', 'NOW', 'WHY', 'CAN', 'MAY', 'SAY',
    'KEY', 'BUY', 'SELL', 'HOLD', 'NYSE', 'NASDAQ', 'INDEX', 'DOW', 'JUST',
    'THIS', 'WHAT', 'HOW', 'UP', 'IS', 'IT', 'BE', 'OF', 'TO', 'IN', 'ON'
}

def extract_tickers_from_title(title: str) -> list:
    """Extract potential stock tickers from news title."""
    if not title:
        return []
    matches = TICKER_PATTERN.findall(title)
    tickers = []
    for match in matches:
        ticker = match[0] or match[1]  # Handle both capture groups
        if ticker and ticker not in TICKER_EXCLUDES and len(ticker) >= 2:
            tickers.append(ticker)
    return list(set(tickers))[:5]  # Dedupe and limit to 5

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
    """
    try:
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
        
        cat_data = TICKER_SETS.get(category.lower(), TICKER_SETS["general"])
        
        target_tickers = []
        if page == 0:
            target_tickers = cat_data["primary"]
        else:
            extended = cat_data["extended"]
            chunk_size = 3
            start_idx = (page - 1) * chunk_size
            
            if start_idx < len(extended):
                target_tickers = extended[start_idx : start_idx + chunk_size]
            else:
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
                    
                    uuid = item.get("uuid")
                    content = item.get('content', item)
                    title = content.get('title')
                    
                    key = uuid if uuid else title
                    
                    if key and key not in all_news_map:
                        if not content: content = item 
                            
                        link = content.get('link')
                        ctu = content.get('clickThroughUrl')
                        can = content.get('canonicalUrl')
                        
                        if not link:
                            if isinstance(ctu, dict): link = ctu.get('url')
                            elif isinstance(ctu, str): link = ctu
                        
                        if not link:
                            if isinstance(can, dict): link = can.get('url')
                            elif isinstance(can, str): link = can
                            
                        pub_time = content.get('providerPublishTime') or content.get('pubDate')
                        
                        thumb = None
                        thumb_data = content.get('thumbnail')
                        if thumb_data and isinstance(thumb_data, dict):
                            resolutions = thumb_data.get('resolutions', [])
                            if resolutions and isinstance(resolutions, list) and len(resolutions) > 0:
                                thumb = resolutions[-1].get('url') 
                        
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
                            "relatedTickers": extract_tickers_from_title(title),
                            "summary": content.get('summary')
                        }
            except Exception as e:
                continue

        processed_news = list(all_news_map.values())
        processed_news.sort(key=lambda x: x.get('providerPublishTime', 0) or 0, reverse=True)
        
        return processed_news

    except Exception as e:
        return []

def get_mini_chart(symbol: str):
    """
    Get mini chart data for a ticker: current price, change %, and 5-day sparkline.
    """
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="5d", interval="1d")
        
        if hist.empty:
            return None
        
        sparkline = hist['Close'].tolist()
        current_price = sparkline[-1] if sparkline else 0
        prev_close = sparkline[-2] if len(sparkline) >= 2 else current_price
        
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close > 0 else 0
        
        return {
            "symbol": symbol.upper(),
            "price": round(current_price, 2),
            "change": round(change, 2),
            "changePercent": round(change_percent, 2),
            "sparkline": [round(p, 2) for p in sparkline]
        }
    except Exception as e:
        print(f"Mini chart error for {symbol}: {e}")
        return None

def get_economic_calendar():
    """
    Fetch upcoming economic events with caching and fallback.
    Strategy:
    1. Check local cache (valid for 12 hours)
    2. Scrape ForexFactory
    3. Fallback to hardcoded data
    """
    import json
    import os
    import time
    from datetime import datetime, timedelta
    
    CACHE_FILE = "economic_calendar_cache.json"
    CACHE_DURATION = 12 * 60 * 60  # 12 hours in seconds
    
    # 1. Try Cache
    try:
        if os.path.exists(CACHE_FILE):
            file_mod_time = os.path.getmtime(CACHE_FILE)
            if time.time() - file_mod_time < CACHE_DURATION:
                with open(CACHE_FILE, 'r') as f:
                    cached_data = json.load(f)
                    # Return all cached data (including history)
                    print(f"Using cached economic calendar ({len(cached_data)} events)")
                    return cached_data[:500]
    except Exception as e:
        print(f"Cache read error: {e}")

    # 2. Try Scraping ForexFactory
    try:
        events = scrape_forexfactory()
        if events:
            # Save to cache
            try:
                with open(CACHE_FILE, 'w') as f:
                    json.dump(events, f)
            except Exception as e:
                print(f"Cache write error: {e}")
                
            return events[:200]
    except Exception as e:
        print(f"Scraping failed: {e}")

    # 3. Fallback
    print("Using fallback economic calendar")
    return get_economic_calendar_fallback()

def scrape_forexfactory():
    """
    Scrape economic calendar from ForexFactory for extended range.
    Range: Last 1 month + Next 3 months (Total 4 months)
    """
    import requests
    from bs4 import BeautifulSoup
    from datetime import datetime, timedelta
    import time
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    
    all_events = []
    
    # Generate list of 7 months: Last 3 + Current + Next 3
    today = datetime.now()
    months_to_scrape = []
    
    # helper to add months
    def add_months(d, x):
        new_year = d.year + (d.month + x - 1) // 12
        new_month = (d.month + x - 1) % 12 + 1
        return datetime(new_year, new_month, 1)

    # Scrape 7 months total (from 3 months ago)
    start_date = add_months(today, -3)
    for i in range(7):
        target_date = add_months(start_date, i)
        month_str = target_date.strftime("%b.%Y").lower() # e.g., oct.2025
        months_to_scrape.append((month_str, target_date.year))
        
    print(f"Scraping months: {[m[0] for m in months_to_scrape]}")

    for month_str, year in months_to_scrape:
        try:
            url = f"https://www.forexfactory.com/calendar?month={month_str}"
            print(f"Fetching {url}...")
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Parse this month's table
            rows = soup.select('tr.calendar__row')
            
            current_date_str = None
            
            for row in rows:
                # Check for new day
                date_cell = row.select_one('.calendar__date')
                if date_cell:
                    d_text = date_cell.get_text(strip=True)
                    if d_text:
                        # Format: "SunJan 12" -> "Jan 12"
                        try:
                            clean_date = d_text[3:].strip()
                            date_obj = datetime.strptime(f"{clean_date} {year}", "%b %d %Y")
                            current_date_str = date_obj.strftime("%Y-%m-%d")
                            current_date_display = date_obj.strftime("%b %d")
                            current_weekday = date_obj.strftime("%a")
                        except:
                            pass
                
                if not current_date_str:
                    continue
                    
                currency_el = row.select_one('.calendar__currency')
                if not currency_el or currency_el.get_text(strip=True) != 'USD':
                    continue
                    
                # Impact
                impact = 'low'
                impact_el = row.select_one('.calendar__impact span')
                if impact_el:
                     classes = str(impact_el.get('class', []))
                     if 'red' in classes: impact = 'high'
                     elif 'ora' in classes: impact = 'medium'
                     
                if impact == 'low': continue
                
                # Title
                title_el = row.select_one('.calendar__event-title')
                title = title_el.get_text(strip=True) if title_el else ""
                
                # Forecast/Prev/Actual
                forecast_el = row.select_one('.calendar__forecast')
                prev_el = row.select_one('.calendar__previous')
                actual_el = row.select_one('.calendar__actual')
                
                forecast = forecast_el.get_text(strip=True) if forecast_el else ""
                prev = prev_el.get_text(strip=True) if prev_el else ""
                actual = actual_el.get_text(strip=True) if actual_el else ""
                
                # Format description
                desc_parts = []
                if actual: desc_parts.append(f"Act: {actual}")
                if forecast: desc_parts.append(f"Est: {forecast}")
                if prev: desc_parts.append(f"Prev: {prev}")
                
                description = " | ".join(desc_parts)

                # Avoid duplicates if any
                event_data = {
                    "date": current_date_str,
                    "dateDisplay": current_date_display,
                    "weekday": current_weekday,
                    "title": title,
                    "impact": impact,
                    "country": "US",
                    "description": description
                }
                
                all_events.append(event_data)
            
            # Delay to be safe, but not after the last one
            if month_str != months_to_scrape[-1][0]:
                time.sleep(2.0)
                
        except Exception as e:
            print(f"Error scraping {month_str}: {e}")
            continue
            
    return all_events


def get_economic_calendar_fallback():
    """Fallback hardcoded economic calendar data."""
    from datetime import datetime, timedelta
    
    ECONOMIC_EVENTS = [
        (1, 10, 2026, "Jobs Report", "high", "US", "Non-Farm Payrolls"),
        (1, 15, 2026, "CPI Release", "high", "US", "Consumer Price Index"),
        (1, 28, 2026, "FOMC Meeting", "high", "US", "Fed Rate Decision"),
        (1, 30, 2026, "GDP Report", "high", "US", "Q4 GDP Advance"),
        (2, 7, 2026, "Jobs Report", "high", "US", "Non-Farm Payrolls"),
        (2, 12, 2026, "CPI Release", "high", "US", "Consumer Price Index"),
        (2, 27, 2026, "PCE Inflation", "high", "US", "Core PCE Index"),
        (3, 6, 2026, "Jobs Report", "high", "US", "Non-Farm Payrolls"),
        (3, 12, 2026, "CPI Release", "high", "US", "Consumer Price Index"),
        (3, 17, 2026, "FOMC Meeting", "high", "US", "Fed Rate Decision"),
        (3, 27, 2026, "GDP Report", "high", "US", "Q4 GDP Final"),
        (4, 3, 2026, "Jobs Report", "high", "US", "Non-Farm Payrolls"),
        (4, 10, 2026, "CPI Release", "high", "US", "Consumer Price Index"),
        (4, 30, 2026, "GDP Report", "high", "US", "Q1 GDP Advance"),
    ]
    
    today = datetime.now()
    end_date = today + timedelta(days=90)
    
    upcoming_events = []
    for month, day, year, title, impact, country, description in ECONOMIC_EVENTS:
        try:
            event_date = datetime(year, month, day)
            if today <= event_date <= end_date:
                upcoming_events.append({
                    "date": event_date.strftime("%Y-%m-%d"),
                    "dateDisplay": event_date.strftime("%b %d"),
                    "weekday": event_date.strftime("%a"),
                    "title": title,
                    "impact": impact,
                    "country": country,
                    "description": description
                })
        except ValueError:
            continue
    
    upcoming_events.sort(key=lambda x: x["date"])
    return upcoming_events

