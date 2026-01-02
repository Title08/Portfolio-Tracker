import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/layout/Navbar';
import SummaryCard from './components/dashboard/SummaryCard';
import WalletList from './components/dashboard/WalletList';
import InvestmentTable from './components/dashboard/InvestmentTable';
import AddAssetModal from './components/modals/AddAssetModal';
import ExchangeModal from './components/modals/ExchangeModal';
import SellModal from './components/modals/SellModal';
import TransactionModal from './components/modals/TransactionModal';
import { consolidateAssets, calculateTotalTHB, formatCurrency } from './utils/helpers';
import { fetchLivePrices } from './utils/api';
import { ASSET_DB } from './constants/assets';

export default function App() {
    const [assets, setAssets] = useState(() => {
        const saved = localStorage.getItem('myPortfolio_v7');
        let initialAssets = saved ? JSON.parse(saved) : [
            { id: 1, name: 'Kasikorn Bank', symbol: 'KBANK', type: 'Cash', quantity: 50000, price: 1, exchangeRate: 1, currency: 'THB', category: 'Wallet' },
            { id: 2, name: 'USD Cash', symbol: 'USD', type: 'Cash', quantity: 1000, price: 1, exchangeRate: 35.50, currency: 'USD', category: 'Wallet' },
            { id: 3, name: 'Apple Inc.', symbol: 'AAPL', type: 'Stock', quantity: 10, price: 185.50, exchangeRate: 35.50, currency: 'USD', category: 'Investment' },
        ];
        return consolidateAssets(initialAssets);
    });

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState('Investment'); // Passed to modal
    const [assetToEdit, setAssetToEdit] = useState(null); // For "Buy More" pre-fill, although logic is slightly different

    const [isExchangeOpen, setIsExchangeOpen] = useState(false);

    const [isSellOpen, setIsSellOpen] = useState(false);
    const [assetToSell, setAssetToSell] = useState(null);

    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [transactionWallet, setTransactionWallet] = useState(null);
    const [transactionType, setTransactionType] = useState('DEPOSIT');


    useEffect(() => {
        localStorage.setItem('myPortfolio_v7', JSON.stringify(assets));
    }, [assets]);

    const investments = assets.filter(a => a.category === 'Investment');
    const usdWallets = assets.filter(a => a.category === 'Wallet' && a.currency === 'USD');
    const thbWallets = assets.filter(a => a.category === 'Wallet' && a.currency === 'THB');

    const totalInvTHB = calculateTotalTHB(investments);
    const totalUsdWalletTHB = calculateTotalTHB(usdWallets);
    const totalThbWalletTHB = calculateTotalTHB(thbWallets);
    const grandTotalTHB = totalInvTHB + totalUsdWalletTHB + totalThbWalletTHB;

    // --- Statistics Calculation ---
    const investmentStats = useMemo(() => {
        let totalCost = 0;
        let totalMarketVal = 0;
        let bestAsset = null;
        let worstAsset = null;

        investments.forEach(asset => {
            const cost = asset.price * asset.quantity;
            const marketPrice = asset.marketPrice || asset.price;
            const marketVal = marketPrice * asset.quantity;
            const pnl = marketVal - cost;
            const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

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

        return {
            totalCost,
            totalMarketVal,
            totalPnL,
            totalPnLPercent,
            bestAsset,
            worstAsset
        };
    }, [investments]);

    // --- Handlers ---
    const handleRefresh = async () => {
        const prices = await fetchLivePrices(assets);
        if (!prices) {
            alert("Failed to fetch prices. Ensure the Python API is running.");
            return;
        }

        const updatedAssets = assets.map(asset => {
            if (asset.category === 'Investment') {
                // Determine the key used in the API response (either symbol or yfSymbol override)
                const dbEntry = ASSET_DB[asset.symbol];
                const lookupKey = dbEntry && dbEntry.yfSymbol ? dbEntry.yfSymbol : asset.symbol;

                const newPrice = prices[lookupKey];
                if (newPrice && newPrice > 0) {
                    return { ...asset, marketPrice: newPrice };
                }
            }
            return asset;
        });
        setAssets(updatedAssets);
    };

    const handleAddAsset = (e, newAssetData, type, setError) => {
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

            if (!fundingSource) {
                setError('Please select a USD Wallet to pay from.');
                return;
            }

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

            } else {
                setError(`Insufficient funds in ${wallet.name}. Balance: ${formatCurrency(wallet.quantity)}`);
                return;
            }
        }

        setAssets(updatedAssets);
        setIsFormOpen(false);
        setAssetToEdit(null); // Clear edit state
    };

    const handleExchangeSubmit = (e, exchangeData, setError) => {
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
        setIsExchangeOpen(false);
    };

    const handleSellSubmit = (e, sellData, setError) => {
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
        setAssets(updatedAssets);
        setIsSellOpen(false);
    };

    const handleTransactionSubmit = (e, transactionData, setError) => {
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
        setIsTransactionOpen(false);
    };

    const handleDelete = (id) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    // Helper Wrappers for Events
    const openBuyMore = (asset) => {
        setFormType('Investment');
        setAssetToEdit({
            name: asset.name,
            symbol: asset.symbol,
            type: asset.type,
            quantity: '',
            price: asset.price,
            exchangeRate: '35.00'
        });
        setIsFormOpen(true);
    };

    const openSellModal = (asset) => {
        setAssetToSell(asset);
        setIsSellOpen(true);
    };

    const openTransactionModal = (type, wallet) => {
        setTransactionType(type);
        setTransactionWallet(wallet);
        setIsTransactionOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-20">
            <Navbar
                onOpenExchange={() => setIsExchangeOpen(true)}
                onOpenAdd={() => { setFormType('Investment'); setAssetToEdit(null); setIsFormOpen(true); }}
                onRefresh={handleRefresh}
            />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <SummaryCard
                    totalTHB={grandTotalTHB}
                    investmentsTotal={totalInvTHB}
                    usdWalletTotal={totalUsdWalletTHB}
                    thbWalletTotal={totalThbWalletTHB}
                    stats={investmentStats}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <WalletList
                            title="THB Wallet"
                            totalValue={totalThbWalletTHB}
                            items={thbWallets}
                            currency="THB"
                            onDeposit={(item) => openTransactionModal('DEPOSIT', item)}
                            onWithdraw={(item) => openTransactionModal('WITHDRAW', item)}
                            onDelete={(id) => handleDelete(id)}
                        />
                        <WalletList
                            title="USD Wallet"
                            totalValue={totalUsdWalletTHB}
                            items={usdWallets}
                            currency="USD"
                            onDeposit={(item) => openTransactionModal('DEPOSIT', item)}
                            onWithdraw={(item) => openTransactionModal('WITHDRAW', item)}
                            onDelete={(id) => handleDelete(id)}
                        />
                    </div>

                    <div className="lg:col-span-8">
                        <InvestmentTable
                            investments={investments}
                            totalValue={totalInvTHB}
                            onBuyMore={openBuyMore}
                            onSell={openSellModal}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </main>

            <AddAssetModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onAdd={handleAddAsset}
                usdWallets={usdWallets}
                initialType={formType}
                initialData={assetToEdit}
            />

            <ExchangeModal
                isOpen={isExchangeOpen}
                onClose={() => setIsExchangeOpen(false)}
                onExchange={handleExchangeSubmit}
                thbWallets={thbWallets}
                usdWallets={usdWallets}
            />

            <SellModal
                isOpen={isSellOpen}
                onClose={() => setIsSellOpen(false)}
                onSell={handleSellSubmit}
                asset={assetToSell}
            />

            <TransactionModal
                isOpen={isTransactionOpen}
                onClose={() => setIsTransactionOpen(false)}
                onTransaction={handleTransactionSubmit}
                wallet={transactionWallet}
                type={transactionType}
            />
        </div>
    );
}
