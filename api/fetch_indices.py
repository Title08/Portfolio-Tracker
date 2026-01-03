import pandas as pd
import json
import requests
import io

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def fetch_table(url):
    try:
        r = requests.get(url, headers=HEADERS)
        r.raise_for_status()
        return pd.read_html(io.StringIO(r.text))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

def fetch_sp500():
    try:
        tables = fetch_table('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')
        if not tables: return pd.DataFrame()
        df = tables[0]
        return df[['Symbol', 'Security']].rename(columns={'Symbol': 'symbol', 'Security': 'name'})
    except Exception as e:
        print(f"Error parsing S&P 500: {e}")
        return pd.DataFrame()

def fetch_nasdaq100():
    try:
        tables = fetch_table('https://en.wikipedia.org/wiki/Nasdaq-100')
        for df in tables:
            if 'Ticker' in df.columns and 'Company' in df.columns:
                return df[['Ticker', 'Company']].rename(columns={'Ticker': 'symbol', 'Company': 'name'})
            if 'Symbol' in df.columns and 'Company' in df.columns:
                return df[['Symbol', 'Company']].rename(columns={'Symbol': 'symbol', 'Company': 'name'})
        return pd.DataFrame()
    except Exception as e:
        print(f"Error parsing Nasdaq 100: {e}")
        return pd.DataFrame()

def fetch_dow():
    try:
        tables = fetch_table('https://en.wikipedia.org/wiki/Dow_Jones_Industrial_Average')
        for df in tables:
            if 'Symbol' in df.columns and 'Company' in df.columns:
                return df[['Symbol', 'Company']].rename(columns={'Symbol': 'symbol', 'Company': 'name'})
        return pd.DataFrame()
    except Exception as e:
        print(f"Error parsing Dow Jones: {e}")
        return pd.DataFrame()

import yfinance as yf
import time

def fetch_yfinance_details(symbols):
    print(f"Fetching details for {len(symbols)} symbols using yfinance...")
    data = {}
    
    # Batch processing to avoid overwhelming or timeouts (though yfinance handles mass well usually)
    batch_size = 100
    chunks = [symbols[i:i + batch_size] for i in range(0, len(symbols), batch_size)]
    
    for i, chunk in enumerate(chunks):
        print(f"Processing batch {i+1}/{len(chunks)}...")
        try:
            tickers = yf.Tickers(" ".join(chunk))
            
            for sym in chunk:
                try:
                    # Accessing info triggers the download
                    info = tickers.tickers[sym].info
                    name = info.get('shortName') or info.get('longName') or info.get('shortName')
                    # Fallback to sector/industry if interesting, but user just wants name
                    if name:
                        data[sym] = {'name': name, 'type': 'Stock'}
                    else:
                        print(f"No name found for {sym}")
                        data[sym] = {'name': sym, 'type': 'Stock'} # Fallback
                except Exception as e:
                    # print(f"Error for {sym}: {e}")
                    # Keep empty to indicate failure or use a basic fallback?
                    # Let's use the symbol itself or skip? Better to have something.
                    data[sym] = {'name': sym, 'type': 'Stock'}
        except Exception as e:
            print(f"Batch error: {e}")
            
    return data

def main():
    print("Fetching indices list from Wikipedia (Source of Truth for Constituents)...")
    sp500 = fetch_sp500()
    print(f"S&P 500: {len(sp500)} found")
    
    nasdaq = fetch_nasdaq100()
    print(f"Nasdaq 100: {len(nasdaq)} found")
    
    dow = fetch_dow()
    print(f"Dow Jones: {len(dow)} found")

    # Combine unique symbols first
    unique_symbols = set()
    unique_symbols.update(sp500['symbol'].astype(str).tolist())
    unique_symbols.update(nasdaq['symbol'].astype(str).tolist())
    unique_symbols.update(dow['symbol'].astype(str).tolist())
    
    # Filter out weird symbols if any
    unique_symbols = {s for s in unique_symbols if isinstance(s, str) and len(s) < 10}
    
    print(f"Total unique symbols to fetch: {len(unique_symbols)}")
    
    # Fetch details from yfinance
    enriched_data = fetch_yfinance_details(list(unique_symbols))
    
    print(f"Successfully enriched {len(enriched_data)} assets")

    with open('indices_data.json', 'w') as f:
        json.dump(enriched_data, f, indent=4)
    print("Saved to indices_data.json")

if __name__ == "__main__":
    main()
