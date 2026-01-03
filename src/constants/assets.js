import indicesData from './indices_db.json';

export const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

// Manual overrides or additions not in the scraped list
const MANUAL_DB = {
    // Top Tech (ensure they are present or overridden if needed)
    'AAPL': { name: 'Apple Inc.', type: 'Stock' },
    'TSLA': { name: 'Tesla, Inc.', type: 'Stock' },
    'MSFT': { name: 'Microsoft Corp.', type: 'Stock' },
    'GOOGL': { name: 'Alphabet Inc.', type: 'Stock' },
    'AMZN': { name: 'Amazon.com', type: 'Stock' },
    'NVDA': { name: 'NVIDIA Corp.', type: 'Stock' },
    'META': { name: 'Meta Platforms', type: 'Stock' },
    'CRWV': { name: 'CoreWeave, Inc.', type: 'Stock' },

    // Indices & ETFs
    '^GSPC': { name: 'S&P 500 Index', type: 'Index' },
    '^NDX': { name: 'NASDAQ 100 Index', type: 'Index' },
    '^DJI': { name: 'Dow Jones Industrial Average', type: 'Index' },
    'DIA': { name: 'SPDR Dow Jones ETF', type: 'ETF' },
    'SPY': { name: 'SPDR S&P 500 ETF', type: 'ETF' },
    'VOO': { name: 'Vanguard S&P 500', type: 'ETF' },
    'QQQ': { name: 'Invesco QQQ', type: 'ETF' },

    // Crypto (requires -USD suffix logic in API, but here we store display info)
    'BTC': { name: 'Bitcoin', type: 'Crypto', yfSymbol: 'BTC-USD' },
    'ETH': { name: 'Ethereum', type: 'Crypto', yfSymbol: 'ETH-USD' },
    'SOL': { name: 'Solana', type: 'Crypto', yfSymbol: 'SOL-USD' },
    'BNB': { name: 'Binance Coin', type: 'Crypto', yfSymbol: 'BNB-USD' },
    'USDT': { name: 'Tether', type: 'Crypto', yfSymbol: 'USDT-USD' },
};

// Merge: Manual overrides take precedence
export const ASSET_DB = {
    ...indicesData,
    ...MANUAL_DB
};
