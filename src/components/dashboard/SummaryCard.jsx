import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { COLORS } from '../constants/assets';

export default function SummaryCard({ totalTHB, investmentsTotal, usdWalletTotal, thbWalletTotal }) {
    const chartData = useMemo(() => {
        return [
            { name: 'Investments', value: investmentsTotal },
            { name: 'USD Wallet', value: usdWalletTotal },
            { name: 'THB Wallet', value: thbWalletTotal }
        ].filter(i => i.value > 0);
    }, [investmentsTotal, usdWalletTotal, thbWalletTotal]);

    return (
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
    );
}
