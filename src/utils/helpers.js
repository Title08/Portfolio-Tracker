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
        const price = item.marketPrice || item.price;
        const usdVal = item.quantity * price;
        return sum + (usdVal * item.exchangeRate);
    }, 0);
};

export const isMarketOpen = () => {
    const now = new Date();

    const getMarketTime = (zone) => {
        const options = { timeZone: zone, hour12: false, hour: '2-digit', minute: '2-digit', weekday: 'short' };
        const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
        const get = (type) => parts.find(p => p.type === type).value;

        const h = parseInt(get('hour'), 10);
        const m = parseInt(get('minute'), 10);
        const day = get('weekday'); // Mon, Tue...

        return { minutes: h * 60 + m, day };
    };

    // US Market (NYSE): Mon-Fri 09:30 (570) - 16:00 (960) America/New_York
    const us = getMarketTime('America/New_York');
    const isUSOpen = !['Sat', 'Sun'].includes(us.day) && us.minutes >= 570 && us.minutes < 960;

    // Thai Market (SET): Mon-Fri 10:00 (600) - 16:30 (990) Asia/Bangkok
    const th = getMarketTime('Asia/Bangkok');
    const isTHOpen = !['Sat', 'Sun'].includes(th.day) && th.minutes >= 600 && th.minutes < 990;

    return isUSOpen || isTHOpen;
};
