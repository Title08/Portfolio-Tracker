import React from 'react';
import Navbar from '../components/layout/Navbar';

import SummaryCard from '../components/dashboard/SummaryCard';
import WalletList from '../components/dashboard/WalletList';
import InvestmentTable from '../components/dashboard/InvestmentTable';

const DashboardPage = ({
    grandTotalTHB,
    totalInvTHB,
    totalUsdWalletTHB,
    totalThbWalletTHB,
    investmentStats,
    thbWallets,
    usdWallets,
    investments,
    openTransactionModal,
    deleteAsset,
    openBuyMore,
    openSellModal,
    // Navbar Handlers
    onOpenExchange,
    onOpenAdd,
    onRefresh,
    onOpenSync,
    onOpenAI
}) => {
    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            <Navbar
                onOpenExchange={onOpenExchange}
                onOpenAdd={onOpenAdd}
                onRefresh={onRefresh}
                onOpenSync={onOpenSync}
                onOpenAI={onOpenAI}
            />

            <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6">
                {/* Top Cards Row */}
                <SummaryCard
                    totalTHB={grandTotalTHB}
                    investmentsTotal={totalInvTHB}
                    usdWalletTotal={totalUsdWalletTHB}
                    thbWalletTotal={totalThbWalletTHB}
                    stats={investmentStats}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    <div className="lg:col-span-3 xl:col-span-3 space-y-6">
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

                    <div className="lg:col-span-9 xl:col-span-9">
                        <InvestmentTable
                            investments={investments}
                            totalValue={totalInvTHB}
                            onBuyMore={openBuyMore}
                            onSell={openSellModal}
                            onDelete={deleteAsset}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
