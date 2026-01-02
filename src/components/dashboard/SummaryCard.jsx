import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { COLORS } from '../../constants/assets';

export default function SummaryCard({ totalTHB, investmentsTotal, usdWalletTotal, thbWalletTotal, stats }) {
    const chartData = useMemo(() => {
        return [
            { name: 'Investments', value: investmentsTotal },
            { name: 'USD Wallet', value: usdWalletTotal },
            { name: 'THB Wallet', value: thbWalletTotal }
        ].filter(i => i.value > 0);
    }, [investmentsTotal, usdWalletTotal, thbWalletTotal]);

    return (
        <div className="flex flex-col gap-6">
            {/* Top Row: Net Worth & Chart */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Net Worth (Estimated)</h2>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalTHB, 'THB')}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Combined value of Stocks, USD Cash, and THB Cash</p>
                </div>
                <div className="h-32 w-full md:w-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} formatter={(val) => formatCurrency(val, 'THB')} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row: Key Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Invested */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><DollarSign size={20} /></div>
                            <span className="text-slate-400 text-xs font-bold uppercase">Total Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalCost)}</div>
                        <div className="text-xs text-slate-500 mt-1">Invested Capital</div>
                    </div>

                    {/* Total PnL */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${stats.totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {stats.totalPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <span className="text-slate-400 text-xs font-bold uppercase">Total PnL</span>
                        </div>
                        <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stats.totalPnL >= 0 ? '+' : ''}{formatCurrency(stats.totalPnL)}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${stats.totalPnL >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                            {stats.totalPnLPercent >= 0 ? '+' : ''}{stats.totalPnLPercent.toFixed(2)}% Return
                        </div>
                    </div>

                    {/* Best Performer */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Activity size={20} /></div>
                            <span className="text-slate-400 text-xs font-bold uppercase">Best Performer</span>
                        </div>
                        {stats.bestAsset ? (
                            <>
                                <div className="text-2xl font-bold text-white">{stats.bestAsset.name}</div>
                                <div className="text-xs text-emerald-400 mt-1">+{stats.bestAsset.pnlPercent.toFixed(2)}% Profit</div>
                            </>
                        ) : (
                            <div className="text-slate-500 italic text-sm">No Data</div>
                        )}
                    </div>

                    {/* Worst Performer */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Activity size={20} /></div>
                            <span className="text-slate-400 text-xs font-bold uppercase">Worst Performer</span>
                        </div>
                        {stats.worstAsset ? (
                            <>
                                <div className="text-2xl font-bold text-white">{stats.worstAsset.name}</div>
                                <div className={`text-xs mt-1 ${stats.worstAsset.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {stats.worstAsset.pnlPercent.toFixed(2)}% Return
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-500 italic text-sm">No Data</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
