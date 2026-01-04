import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import SummaryCard from './components/dashboard/SummaryCard';
import WalletList from './components/dashboard/WalletList';
import InvestmentTable from './components/dashboard/InvestmentTable';
import AddAssetModal from './components/modals/AddAssetModal';
import ExchangeModal from './components/modals/ExchangeModal';
import SellModal from './components/modals/SellModal';
import TransactionModal from './components/modals/TransactionModal';
import ImportExportModal from './components/modals/ImportExportModal';
import { usePortfolio } from './hooks/usePortfolio';

export default function App() {
    const {
        assets, // Needed for modals lookup if necessary
        investments,
        usdWallets,
        thbWallets,
        totalInvTHB,
        totalUsdWalletTHB,
        totalThbWalletTHB,
        grandTotalTHB,
        investmentStats,
        refreshPrices,
        addAsset,
        exchangeCurrency,
        sellAsset,
        handleTransaction,
        deleteAsset,
        importAssets
    } = usePortfolio();

    // UI State (Modals)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState('Investment');
    const [assetToEdit, setAssetToEdit] = useState(null);

    const [isExchangeOpen, setIsExchangeOpen] = useState(false);

    const [isSellOpen, setIsSellOpen] = useState(false);
    const [assetToSell, setAssetToSell] = useState(null);

    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [transactionWallet, setTransactionWallet] = useState(null);
    const [transactionType, setTransactionType] = useState('DEPOSIT');

    const [isSyncOpen, setIsSyncOpen] = useState(false);

    // UI Handlers
    const onAddAsset = (e, newAssetData, type, setError) => {
        const success = addAsset(newAssetData, type, setError);
        if (success) {
            setIsFormOpen(false);
            setAssetToEdit(null);
        }
    };

    const onExchange = (e, exchangeData, setError) => {
        const success = exchangeCurrency(exchangeData, setError);
        if (success) setIsExchangeOpen(false);
    };

    const onSell = (e, sellData, setError) => {
        const success = sellAsset(sellData, setError);
        if (success) setIsSellOpen(false);
    };

    const onTransaction = (e, transactionData, setError) => {
        const success = handleTransaction(transactionData, setError);
        if (success) setIsTransactionOpen(false);
    };

    const openBuyMore = (asset) => {
        setFormType('Investment');
        setAssetToEdit({
            name: asset.name,
            symbol: asset.symbol,
            type: asset.type,
            quantity: '', // Reset quantity for new buy
            price: asset.price,
            exchangeRate: '35.00',
            fundingSource: '' // Explicitly reset
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
                onRefresh={refreshPrices}
                onOpenSync={() => setIsSyncOpen(true)}
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
                            onDelete={(id) => deleteAsset(id)}
                        />
                        <WalletList
                            title="USD Wallet"
                            totalValue={totalUsdWalletTHB}
                            items={usdWallets}
                            currency="USD"
                            onDeposit={(item) => openTransactionModal('DEPOSIT', item)}
                            onWithdraw={(item) => openTransactionModal('WITHDRAW', item)}
                            onDelete={(id) => deleteAsset(id)}
                        />
                    </div>

                    <div className="lg:col-span-8">
                        <InvestmentTable
                            investments={investments}
                            totalValue={totalInvTHB}
                            onBuyMore={openBuyMore}
                            onSell={openSellModal}
                            onDelete={deleteAsset}
                        />
                    </div>
                </div>
            </main>

            <AddAssetModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onAdd={onAddAsset}
                usdWallets={usdWallets}
                initialType={formType}
                initialData={assetToEdit}
            />

            <ExchangeModal
                isOpen={isExchangeOpen}
                onClose={() => setIsExchangeOpen(false)}
                onExchange={onExchange}
                thbWallets={thbWallets}
                usdWallets={usdWallets}
            />

            <SellModal
                isOpen={isSellOpen}
                onClose={() => setIsSellOpen(false)}
                onSell={onSell}
                asset={assetToSell}
            />

            <TransactionModal
                isOpen={isTransactionOpen}
                onClose={() => setIsTransactionOpen(false)}
                onTransaction={onTransaction}
                wallet={transactionWallet}
                type={transactionType}
            />

            <ImportExportModal
                isOpen={isSyncOpen}
                onClose={() => setIsSyncOpen(false)}
                assets={assets}
                onImport={importAssets}
            />
        </div>
    );
}
