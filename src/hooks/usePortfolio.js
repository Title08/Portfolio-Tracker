import { useState, useEffect, useMemo, useCallback } from 'react';
import { consolidateAssets, calculateTotalTHB, formatCurrency, isMarketOpen } from '../utils/helpers';
import { fetchLivePrices } from '../services/api';
import { ASSET_DB } from '../constants/assets';
import { getAssets, saveAssets, getHistory, saveHistoryPoint, trimHistory, migrateFromLocalStorage } from '../utils/storage';

// Default assets for new users
const DEFAULT_ASSETS = [
    { id: 1, name: 'Kasikorn Bank', symbol: 'KBANK', type: 'Cash', quantity: 50000, price: 1, exchangeRate: 1, currency: 'THB', category: 'Wallet' },
    { id: 2, name: 'USD Cash', symbol: 'USD', type: 'Cash', quantity: 1000, price: 1, exchangeRate: 35.50, currency: 'USD', category: 'Wallet' },
    { id: 3, name: 'Apple Inc.', symbol: 'AAPL', type: 'Stock', quantity: 10, price: 185.50, exchangeRate: 35.50, currency: 'USD', category: 'Investment' },
];

export function usePortfolio() {
    // 1. Base State - Initialize from localStorage first (sync), then load from IndexedDB (async)
    const [assets, setAssets] = useState(() => {
        const saved = localStorage.getItem('myPortfolio_v7');
        let initialAssets = saved ? JSON.parse(saved) : DEFAULT_ASSETS;
        return consolidateAssets(initialAssets);
    });

    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('portfolioHistory_v1');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(true);

    // 2. Initialize from IndexedDB (async) and migrate if needed
    useEffect(() => {
        const initStorage = async () => {
            try {
                // Migrate data from localStorage to IndexedDB if needed
                await migrateFromLocalStorage();

                // Load assets from IndexedDB
                const savedAssets = await getAssets();
                if (savedAssets && savedAssets.length > 0) {
                    setAssets(consolidateAssets(savedAssets));
                }

                // Load history from IndexedDB
                const savedHistory = await getHistory();
                if (savedHistory && savedHistory.length > 0) {
                    setHistory(savedHistory);
                }
            } catch (error) {
                console.warn('IndexedDB initialization failed, using localStorage:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initStorage();
    }, []);

    // 3. Persist State Effects - Save to both IndexedDB and localStorage
    useEffect(() => {
        if (isLoading) return; // Don't save during initial load

        // Save to localStorage (sync, immediate)
        localStorage.setItem('myPortfolio_v7', JSON.stringify(assets));

        // Save to IndexedDB (async)
        saveAssets(assets).catch(console.error);
    }, [assets, isLoading]);

    useEffect(() => {
        if (isLoading) return;

        // Save to localStorage
        localStorage.setItem('portfolioHistory_v1', JSON.stringify(history));

        // Trim history in IndexedDB periodically
        if (history.length > 50) {
            trimHistory(50).catch(console.error);
        }
    }, [history, isLoading]);


    // 3. Derived State (Moved UP to avoid TDZ in effects)
    const investments = assets.filter(a => a.category === 'Investment');
    const usdWallets = assets.filter(a => a.category === 'Wallet' && a.currency === 'USD');
    const thbWallets = assets.filter(a => a.category === 'Wallet' && a.currency === 'THB');

    const totalInvTHB = calculateTotalTHB(investments);
    const totalUsdWalletTHB = calculateTotalTHB(usdWallets);
    const totalThbWalletTHB = calculateTotalTHB(thbWallets);
    const grandTotalTHB = totalInvTHB + totalUsdWalletTHB + totalThbWalletTHB;

    // 4. Helper Actions (Hoisted for use in Effects)
    const refreshPrices = async () => {
        const prices = await fetchLivePrices(assets);
        if (!prices) {
            console.error("Failed to fetch prices");
            return;
        }

        const updatedAssets = assets.map(asset => {
            if (asset.category === 'Investment') {
                const dbEntry = ASSET_DB[asset.symbol];
                const lookupKey = dbEntry && dbEntry.yfSymbol ? dbEntry.yfSymbol : asset.symbol;

                const priceData = prices[lookupKey];

                if (priceData && typeof priceData === 'object') {
                    const marketPrice = priceData.price;
                    const previousClose = priceData.previousClose;
                    let marketChange = priceData.change;
                    let marketChangePercent = priceData.changePercent;

                    if ((marketChange === null || marketChange === undefined) && previousClose && marketPrice) {
                        marketChange = marketPrice - previousClose;
                    }

                    if ((marketChangePercent === null || marketChangePercent === undefined) && previousClose && marketPrice) {
                        marketChangePercent = (marketChange / previousClose) * 100;
                    }

                    return {
                        ...asset,
                        marketPrice: marketPrice,
                        marketChange: marketChange,
                        marketChangePercent: marketChangePercent,
                        previousClose: previousClose
                    };
                }
                else if (typeof priceData === 'number' && priceData > 0) {
                    return { ...asset, marketPrice: priceData };
                }
            }
            return asset;
        });
        setAssets(updatedAssets);
    };

    // 5. Effects using Derived State and Actions

    // Auto Refresh Logic
    useEffect(() => {
        const initialRefresh = async () => {
            await refreshPrices();
        };

        const checkAndRefresh = async () => {
            if (isMarketOpen()) {
                await refreshPrices();
            }
        };

        initialRefresh();
        const intervalId = setInterval(checkAndRefresh, 15000);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update History on Value Change
    useEffect(() => {
        if (grandTotalTHB > 0) {
            setHistory(prev => {
                const now = Date.now();
                const newPoint = { timestamp: now, value: grandTotalTHB };

                // Limit history length
                const updated = [...prev, newPoint];
                if (updated.length > 50) return updated.slice(updated.length - 50);
                return updated;
            });
        }
    }, [grandTotalTHB]);

    // 6. Complex Stats Calculation
    const investmentStats = useMemo(() => {
        let totalCost = 0;
        let totalMarketVal = 0;
        let bestAsset = null;
        let worstAsset = null;
        let totalDailyChange = 0;

        investments.forEach(asset => {
            const cost = asset.price * asset.quantity;
            const marketPrice = asset.marketPrice || asset.price;
            const marketVal = marketPrice * asset.quantity;
            const pnl = marketVal - cost;
            const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

            if (asset.marketChange) {
                totalDailyChange += (asset.marketChange * asset.quantity);
            }

            totalCost += cost;
            totalMarketVal += marketVal;

            if (!bestAsset || pnlPercent > bestAsset.pnlPercent) {
                bestAsset = { name: asset.symbol, pnlPercent, pnl };
            }
            if (!worstAsset || pnlPercent < worstAsset.pnlPercent) {
                worstAsset = { name: asset.symbol, pnlPercent, pnl };
            }
        });

        const totalPnL = totalMarketVal - totalCost;
        const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

        const totalPreviousVal = totalMarketVal - totalDailyChange;
        const totalDailyChangePercent = totalPreviousVal > 0 ? (totalDailyChange / totalPreviousVal) * 100 : 0;

        return {
            totalCost,
            totalMarketVal,
            totalPnL,
            totalPnLPercent,
            bestAsset,
            worstAsset,
            totalDailyChange,
            totalDailyChangePercent
        };
    }, [investments]);

    // 7. User Actions
    const addAsset = (newAssetData, type, setError) => {
        if (!newAssetData.name || !newAssetData.quantity) return;

        let asset = {
            id: Date.now(),
            name: newAssetData.name,
            quantity: parseFloat(newAssetData.quantity),
            exchangeRate: 1,
            price: 1,
            currency: 'THB',
            category: 'Wallet',
            type: 'Cash',
            symbol: 'THB'
        };

        let updatedAssets = [...assets];

        if (type === 'THB') {
            asset.symbol = 'THB';
            asset.currency = 'THB';
            asset.price = 1;
            updatedAssets.push(asset);
        } else if (type === 'USD') {
            asset.symbol = 'USD';
            asset.currency = 'USD';
            asset.category = 'Wallet';
            asset.exchangeRate = parseFloat(newAssetData.exchangeRate);
            asset.price = 1;
            updatedAssets.push(asset);
        } else { // Investment Logic
            asset.category = 'Investment';
            asset.currency = 'USD';
            asset.symbol = newAssetData.symbol.toUpperCase();
            asset.type = newAssetData.type;
            asset.price = parseFloat(newAssetData.price);
            asset.sector = newAssetData.sector;
            asset.industry = newAssetData.industry;

            const fundingSource = newAssetData.fundingSource;

            if (fundingSource) {
                const walletId = parseInt(fundingSource);
                const wallet = assets.find(w => w.id === walletId);
                const costUSD = asset.quantity * asset.price;

                if (!wallet) {
                    setError('Selected wallet not found.');
                    return;
                }

                if (wallet.quantity >= costUSD) {
                    asset.exchangeRate = wallet.exchangeRate;

                    // Deduct from Wallet
                    updatedAssets = updatedAssets.map(a => {
                        if (a.id === walletId) {
                            return { ...a, quantity: a.quantity - costUSD };
                        }
                        return a;
                    });
                } else {
                    setError(`Insufficient funds in ${wallet.name}. Balance: ${formatCurrency(wallet.quantity)}`);
                    return;
                }
            } else {
                // No Wallet - External Source
                // Use the manually entered exchange rate
                asset.exchangeRate = parseFloat(newAssetData.exchangeRate);
                if (isNaN(asset.exchangeRate) || asset.exchangeRate <= 0) {
                    asset.exchangeRate = 35.0;
                }
            }

            // MERGE LOGIC
            const existingStockIndex = updatedAssets.findIndex(a => a.symbol === asset.symbol && a.category === 'Investment');

            if (existingStockIndex >= 0) {
                const existing = updatedAssets[existingStockIndex];
                const totalQty = existing.quantity + asset.quantity;

                const totalValUSD = (existing.quantity * existing.price) + (asset.quantity * asset.price);
                const avgPrice = totalQty > 0 ? totalValUSD / totalQty : 0;

                const totalValTHB = (existing.quantity * existing.price * existing.exchangeRate) + (asset.quantity * asset.price * asset.exchangeRate);
                const avgRate = totalValUSD > 0 ? totalValTHB / totalValUSD : existing.exchangeRate;

                updatedAssets[existingStockIndex] = {
                    ...existing,
                    quantity: totalQty,
                    price: avgPrice,
                    exchangeRate: avgRate
                };
            } else {
                updatedAssets.push(asset);
            }
        }

        setAssets(updatedAssets);
        return true; // Success
    };

    const exchangeCurrency = (exchangeData, setError) => {
        const sourceId = parseInt(exchangeData.sourceId);
        const sourceAsset = assets.find(a => a.id === sourceId);
        const amount = parseFloat(exchangeData.amount);
        const rate = parseFloat(exchangeData.rate);
        const direction = exchangeData.direction;
        const destId = exchangeData.destinationId;

        if (!sourceAsset || isNaN(amount) || isNaN(rate) || amount <= 0 || rate <= 0) return;

        if (sourceAsset.quantity < amount) {
            setError(`Insufficient funds. Available: ${sourceAsset.quantity.toLocaleString()}`);
            return;
        }

        let updatedAssets = assets.map(asset => {
            if (asset.id === sourceId) {
                return { ...asset, quantity: asset.quantity - amount };
            }
            return asset;
        });

        if (direction === 'THB_TO_USD') {
            const usdAmount = amount / rate;
            if (destId === 'NEW') {
                updatedAssets.push({
                    id: Date.now(),
                    name: exchangeData.description || `Exchanged from ${sourceAsset.name}`,
                    symbol: 'USD',
                    type: 'Cash',
                    quantity: usdAmount,
                    price: 1,
                    exchangeRate: rate, // Captured Rate
                    currency: 'USD',
                    category: 'Wallet'
                });
            } else {
                updatedAssets = updatedAssets.map(asset => {
                    if (asset.id === parseInt(destId)) {
                        const oldTotalCostTHB = asset.quantity * asset.exchangeRate;
                        const newTotalCostTHB = oldTotalCostTHB + (usdAmount * rate);
                        const newTotalQty = asset.quantity + usdAmount;
                        const newAvgRate = newTotalCostTHB / newTotalQty;
                        return { ...asset, quantity: newTotalQty, exchangeRate: newAvgRate };
                    }
                    return asset;
                });
            }
        } else {
            const thbAmount = amount * rate;
            if (destId === 'NEW') {
                updatedAssets.push({
                    id: Date.now(),
                    name: exchangeData.description || `Sold USD from ${sourceAsset.name}`,
                    symbol: 'THB',
                    type: 'Cash',
                    quantity: thbAmount,
                    price: 1,
                    exchangeRate: 1,
                    currency: 'THB',
                    category: 'Wallet'
                });
            } else {
                updatedAssets = updatedAssets.map(asset => {
                    if (asset.id === parseInt(destId)) {
                        return { ...asset, quantity: asset.quantity + thbAmount };
                    }
                    return asset;
                });
            }
        }
        setAssets(updatedAssets);
        return true; // Success
    };

    const sellAsset = (sellData, setError) => {
        const sellQty = parseFloat(sellData.quantity);
        const sellPrice = parseFloat(sellData.price);

        if (sellQty <= 0 || sellQty > sellData.currentQty) {
            setError(`Invalid quantity. You only have ${sellData.currentQty}`);
            return;
        }
        const totalProceedsUSD = sellQty * sellPrice;
        let updatedAssets = assets.map(a => {
            if (a.id === sellData.id) {
                return { ...a, quantity: a.quantity - sellQty };
            }
            return a;
        }).filter(a => a.quantity > 0);

        const usdWalletIndex = updatedAssets.findIndex(a => a.category === 'Wallet' && a.currency === 'USD');
        if (usdWalletIndex >= 0) {
            const usdWallet = updatedAssets[usdWalletIndex];
            const oldTotalCostTHB = usdWallet.quantity * usdWallet.exchangeRate;
            const newTotalCostTHB = oldTotalCostTHB + (totalProceedsUSD * sellData.originalRate);
            const newTotalQty = usdWallet.quantity + totalProceedsUSD;
            const newAvgRate = newTotalQty > 0 ? newTotalCostTHB / newTotalQty : usdWallet.exchangeRate;

            updatedAssets[usdWalletIndex] = {
                ...usdWallet,
                quantity: newTotalQty,
                exchangeRate: newAvgRate
            };
        } else {
            updatedAssets.push({
                id: Date.now(),
                name: `Sale: ${sellData.name}`,
                symbol: 'USD',
                type: 'Cash',
                quantity: totalProceedsUSD,
                price: 1,
                exchangeRate: sellData.originalRate,
                currency: 'USD',
                category: 'Wallet'
            });
        }
        setAssets(updatedAssets);
        return true; // Success
    };

    const handleTransaction = (transactionData, setError) => {
        const amount = parseFloat(transactionData.amount);
        if (isNaN(amount) || amount <= 0) return;
        if (transactionData.type === 'WITHDRAW' && amount > transactionData.currentQty) {
            setError(`Insufficient funds. Available: ${transactionData.currentQty.toLocaleString()}`);
            return;
        }

        const updatedAssets = assets.map(asset => {
            if (asset.id === transactionData.walletId) {
                let newQty = asset.quantity;
                if (transactionData.type === 'DEPOSIT') {
                    newQty += amount;
                } else {
                    newQty -= amount;
                }
                return { ...asset, quantity: newQty };
            }
            return asset;
        });
        setAssets(updatedAssets);
        return true; // Success
    };

    const deleteAsset = (id) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    const importAssets = (jsonData) => {
        try {
            const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!Array.isArray(parsed)) {
                throw new Error("Invalid data format: Expected an array.");
            }
            const isValid = parsed.every(item => item.id && item.name);
            if (!isValid) {
                throw new Error("Invalid data: Items missing required fields (id, name).");
            }
            setAssets(parsed);
            return { success: true };
        } catch (error) {
            console.error("Import failed:", error);
            return { success: false, message: error.message };
        }
    };

    return {
        assets,
        investments,
        usdWallets,
        thbWallets,
        totalInvTHB,
        totalUsdWalletTHB,
        totalThbWalletTHB,
        grandTotalTHB,
        investmentStats,
        history,
        totalDailyChangePercent: investmentStats.totalDailyChangePercent,
        refreshPrices,
        addAsset,
        exchangeCurrency,
        sellAsset,
        handleTransaction,
        deleteAsset,
        importAssets
    };
}
