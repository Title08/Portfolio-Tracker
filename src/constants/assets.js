export const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export const ASSET_DB = {
    'AAPL': { name: 'Apple Inc.', type: 'Stock' },
    'TSLA': { name: 'Tesla, Inc.', type: 'Stock' },
    'MSFT': { name: 'Microsoft Corp.', type: 'Stock' },
    'GOOGL': { name: 'Alphabet Inc.', type: 'Stock' },
    'AMZN': { name: 'Amazon.com', type: 'Stock' },
    'NVDA': { name: 'NVIDIA Corp.', type: 'Stock' },
    'META': { name: 'Meta Platforms', type: 'Stock' },
    // Crypto requires -USD suffix for yfinance
    'BTC': { name: 'Bitcoin', type: 'Crypto', yfSymbol: 'BTC-USD' },
    'ETH': { name: 'Ethereum', type: 'Crypto', yfSymbol: 'ETH-USD' },
    'SOL': { name: 'Solana', type: 'Crypto', yfSymbol: 'SOL-USD' },
    'BNB': { name: 'Binance Coin', type: 'Crypto', yfSymbol: 'BNB-USD' },
    'USDT': { name: 'Tether', type: 'Crypto', yfSymbol: 'USDT-USD' },
    'VOO': { name: 'Vanguard S&P 500', type: 'ETF' },
    'QQQ': { name: 'Invesco QQQ', type: 'ETF' },
};
