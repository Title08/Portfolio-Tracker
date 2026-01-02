import { ASSET_DB } from '../constants/assets';

const API_BASE_URL = 'http://localhost:8000';

export const fetchLivePrices = async (assets) => {
    const symbolsToFetch = assets
        .filter(a => a.category === 'Investment')
        .map(a => {
            // Check if there's a specific yfinance symbol override in ASSET_DB
            const dbEntry = ASSET_DB[a.symbol];
            return dbEntry && dbEntry.yfSymbol ? dbEntry.yfSymbol : a.symbol;
        });

    if (symbolsToFetch.length === 0) return {};

    try {
        const query = symbolsToFetch.join(',');
        const response = await fetch(`${API_BASE_URL}/prices?symbols=${query}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch prices:", error);
        return null;
    }
};

export const searchAssets = async (query) => {
    if (!query) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error("Error searching assets:", error);
        return [];
    }
};

export const getAssetInfo = async (symbol) => {
    if (!symbol) return null;
    try {
        const response = await fetch(`${API_BASE_URL}/info?symbol=${encodeURIComponent(symbol)}`);
        if (!response.ok) throw new Error('Failed to fetch asset info');
        return await response.json();
    } catch (error) {
        console.error("Error fetching asset info:", error);
        return null;
    }
};
