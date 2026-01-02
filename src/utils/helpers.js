export const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const consolidateAssets = (rawAssets) => {
    const investments = rawAssets.filter(a => a.category === 'Investment');
    const others = rawAssets.filter(a => a.category !== 'Investment');

    const mergedMap = new Map();

    investments.forEach(asset => {
        const key = asset.symbol; // Group by Symbol
        if (mergedMap.has(key)) {
            const existing = mergedMap.get(key);

            const totalQty = existing.quantity + asset.quantity;
            // Weighted Average Price Calculation
            const totalValUSD = (existing.quantity * existing.price) + (asset.quantity * asset.price);
            const avgPrice = totalQty > 0 ? totalValUSD / totalQty : 0;

            // Weighted Average Exchange Rate Calculation
            const totalValTHB = (existing.quantity * existing.price * existing.exchangeRate) + (asset.quantity * asset.price * asset.exchangeRate);
            const avgRate = totalValUSD > 0 ? totalValTHB / totalValUSD : existing.exchangeRate;

            mergedMap.set(key, {
                ...existing,
                quantity: totalQty,
                price: avgPrice,
                exchangeRate: avgRate
            });
        } else {
            mergedMap.set(key, { ...asset });
        }
    });

    return [...others, ...Array.from(mergedMap.values())];
};

export const calculateTotalTHB = (list) => {
    return list.reduce((sum, item) => {
        const usdVal = item.quantity * item.price;
        return sum + (usdVal * item.exchangeRate);
    }, 0);
};
