import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { COLORS } from '../../constants/assets';

export default function SummaryCard({ totalTHB, investmentsTotal, usdWalletTotal, thbWalletTotal, stats, history = [], dailyChangePercent = 0 }) {
    const chartData = useMemo(() => {
        return [
            { name: 'Investments', value: investmentsTotal },
            { name: 'USD Wallet', value: usdWalletTotal },
            { name: 'THB Wallet', value: thbWalletTotal }
        ].filter(i => i.value > 0);
    }, [investmentsTotal, usdWalletTotal, thbWalletTotal]);

    // Format history for Line Chart
    const lineChartData = useMemo(() => {
        if (!history || history.length === 0) return [];
        return history.map(h => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: h.value
        }));
    }, [history]);

    return (
        <div className="flex flex-col gap-6">
            {/* Top Row: Net Worth & Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Net Worth & Pie */}
                <div className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden transition-all duration-300">
                    <div className="z-10 relative">
                        <h2 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Net Worth (Est.)</h2>
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalTHB, 'THB')}</span>
                            {dailyChangePercent !== 0 && (
                                <span className={`flex items-center text-sm font-bold px-2 py-1 rounded-full ${dailyChangePercent >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                    {dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}% Today
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm mt-3 max-w-xs">Combined value of Stocks, USD Cash, and THB Cash.</p>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-40 w-40 md:h-48 md:w-48 flex-shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} formatter={(val) => formatCurrency(val, 'THB')} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text ? */}
                    </div>
                </div>

                {/* Line Chart (Performance) */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-bold uppercase flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" />
                            Live Performance
                        </h3>
                        <span className="text-[10px] text-slate-500 uppercase bg-slate-700/50 px-2 py-1 rounded">Real-time</span>
                    </div>

                    <div className="flex-1 min-h-[160px] w-full">
                        {lineChartData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <XAxis dataKey="time" hide={true} />
                                    <YAxis domain={['auto', 'auto']} hide={true} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                        formatter={(value) => [formatCurrency(value, 'THB'), 'Value']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }}
                                        animationDuration={500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic gap-2 opacity-60">
                                <Activity size={24} />
                                <span>Collecting data points...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Key Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Invested */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400"><DollarSign size={20} /></div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalCost)}</div>
                        <div className="text-xs text-slate-500 mt-1">Invested Capital</div>
                    </div>

                    {/* Total PnL */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${stats.totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                {stats.totalPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total PnL</span>
                        </div>
                        <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {stats.totalPnL >= 0 ? '+' : ''}{formatCurrency(stats.totalPnL)}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${stats.totalPnL >= 0 ? 'text-emerald-600/70 dark:text-emerald-500/70' : 'text-red-600/70 dark:text-red-500/70'}`}>
                            {stats.totalPnLPercent >= 0 ? '+' : ''}{stats.totalPnLPercent.toFixed(2)}% Return
                        </div>
                    </div>

                    {/* Best Performer */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400"><Activity size={20} /></div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Best Performer</span>
                        </div>
                        {stats.bestAsset ? (
                            <>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white truncate" title={stats.bestAsset.name}>{stats.bestAsset.name}</div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+{stats.bestAsset.pnlPercent.toFixed(2)}% Profit</div>
                            </>
                        ) : (
                            <div className="text-slate-500 italic text-sm">No Data</div>
                        )}
                    </div>

                    {/* Worst Performer */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400"><Activity size={20} /></div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Worst Performer</span>
                        </div>
                        {stats.worstAsset ? (
                            <>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white truncate" title={stats.worstAsset.name}>{stats.worstAsset.name}</div>
                                <div className={`text-xs mt-1 ${stats.worstAsset.pnlPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
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
