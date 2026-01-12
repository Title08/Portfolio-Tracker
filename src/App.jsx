
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';

// --- Components ---
// Layout
// Navbar moved to specific pages


// Modals
import AddAssetModal from './components/modals/AddAssetModal';
import ExchangeModal from './components/modals/ExchangeModal';
import SellModal from './components/modals/SellModal';
import TransactionModal from './components/modals/TransactionModal';
import ImportExportModal from './components/modals/ImportExportModal';
import AIAnalysisModal from './components/modals/AIAnalysisModal';
import SettingsModal from './components/modals/SettingsModal';

// --- Logic/Hooks ---
import { usePortfolio } from './hooks/usePortfolio';

/**
 * Main Application Component
 * 
 * Manages the high-level layout and modal states.
 * Data logic is delegated to the `usePortfolio` hook.
 */
export default function App() {
    // --- Data Management (Custom Hook) ---
    const {
        // Data
        assets,
        investments,
        usdWallets,
        thbWallets,
        investmentStats,

        // Calculated Totals
        totalInvTHB,
        totalUsdWalletTHB,
        totalThbWalletTHB,
        grandTotalTHB,

        // Actions
        refreshPrices,
        addAsset,
        exchangeCurrency,
        sellAsset,
        handleTransaction,
        deleteAsset,
        importAssets
    } = usePortfolio();

    // --- Local UI State (Modals) ---

    // Asset Management Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState('Investment'); // 'Investment' | 'Wallet'
    const [assetToEdit, setAssetToEdit] = useState(null);

    const [isSellOpen, setIsSellOpen] = useState(false);
    const [assetToSell, setAssetToSell] = useState(null);

    // Wallet/Currency Modals
    const [isExchangeOpen, setIsExchangeOpen] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [transactionWallet, setTransactionWallet] = useState(null);
    const [transactionType, setTransactionType] = useState('DEPOSIT'); // 'DEPOSIT' | 'WITHDRAW'

    // Feature Modals
    const [isSyncOpen, setIsSyncOpen] = useState(false);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [aiLanguage, setAiLanguage] = useState('en'); // 'en' or 'th'
    const [aiModel, setAiModel] = useState('qwen/qwen3-32b'); // Default model

    // --- Event Handlers ---

    /**
     * Handles adding or editing an asset/wallet.
     */
    const onAddAsset = (e, newAssetData, type, setError) => {
        const success = addAsset(newAssetData, type, setError);
        if (success) {
            setIsFormOpen(false);
            setAssetToEdit(null);
        }
    };

    /**
     * Handles currency exchange between wallets.
     */
    const onExchange = (e, exchangeData, setError) => {
        const success = exchangeCurrency(exchangeData, setError);
        if (success) setIsExchangeOpen(false);
    };

    /**
     * Handles selling an asset.
     */
    const onSell = (e, sellData, setError) => {
        const success = sellAsset(sellData, setError);
        if (success) setIsSellOpen(false);
    };

    /**
     * Handles deposits and withdrawals for wallets.
     */
    const onTransaction = (e, transactionData, setError) => {
        const success = handleTransaction(transactionData, setError);
        if (success) setIsTransactionOpen(false);
    };

    // --- Modal Openers ---

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

    // --- Render ---
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
                {/* Navigation Bar */}
                {/* Navigation Bar Removed from Global Layout */}


                <Routes>
                    <Route path="/" element={
                        <DashboardPage
                            grandTotalTHB={grandTotalTHB}
                            totalInvTHB={totalInvTHB}
                            totalUsdWalletTHB={totalUsdWalletTHB}
                            totalThbWalletTHB={totalThbWalletTHB}
                            investmentStats={investmentStats}
                            thbWallets={thbWallets}
                            usdWallets={usdWallets}
                            investments={investments}
                            openTransactionModal={openTransactionModal}
                            deleteAsset={deleteAsset}
                            openBuyMore={openBuyMore}
                            openSellModal={openSellModal}
                            // Navbar Handlers
                            onOpenExchange={() => setIsExchangeOpen(true)}
                            onOpenAdd={() => { setFormType('Investment'); setAssetToEdit(null); setIsFormOpen(true); }}
                            onRefresh={refreshPrices}
                            onOpenSync={() => setIsSyncOpen(true)}
                            onOpenAI={() => setIsAIOpen(true)}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                        />
                    } />

                    <Route path="/news" element={<NewsPage aiLanguage={aiLanguage} aiModel={aiModel} />} />
                </Routes>

                {/* --- Modals (Global) --- */}

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

                <AIAnalysisModal
                    isOpen={isAIOpen}
                    onClose={() => setIsAIOpen(false)}
                    portfolio={investments}
                />

                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    aiLanguage={aiLanguage}
                    setAiLanguage={setAiLanguage}
                    aiModel={aiModel}
                    setAiModel={setAiModel}
                />
            </div>
        </BrowserRouter>
    );
}
