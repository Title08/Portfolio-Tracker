import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, AreaChart, Area, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { COLORS } from '../../constants/assets';

export default function SummaryCard({ totalTHB, investmentsTotal, usdWalletTotal, thbWalletTotal, stats, history = [], dailyChangePercent = 0 }) {
    const [activeWidget, setActiveWidget] = useState(0); // 0 = Live, 1 = Daily
    const [dailyHistory, setDailyHistory] = useState([]);
    const [timeRange, setTimeRange] = useState('1M');

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

    // Load and save daily history
    useEffect(() => {
        const saved = localStorage.getItem('portfolioDaily_v1');
        if (saved) setDailyHistory(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (totalTHB <= 0) return;
        const today = new Date().toISOString().split('T')[0];

        setDailyHistory(prev => {
            const existingIndex = prev.findIndex(d => d.date === today);
            let updated;
            if (existingIndex >= 0) {
                updated = [...prev];
                updated[existingIndex] = { date: today, value: totalTHB };
            } else {
                updated = [...prev, { date: today, value: totalTHB }];
            }
            if (updated.length > 365) updated = updated.slice(-365);
            localStorage.setItem('portfolioDaily_v1', JSON.stringify(updated));
            return updated;
        });
    }, [totalTHB]);

    // Filter daily data based on time range
    const filteredDailyData = useMemo(() => {
        if (dailyHistory.length === 0) return [];
        const now = new Date();
        let cutoffDate = new Date();

        switch (timeRange) {
            case '1W': cutoffDate.setDate(now.getDate() - 7); break;
            case '1M': cutoffDate.setMonth(now.getMonth() - 1); break;
            case '3M': cutoffDate.setMonth(now.getMonth() - 3); break;
            case '1Y': cutoffDate.setFullYear(now.getFullYear() - 1); break;
            default: cutoffDate = new Date(0);
        }

        return dailyHistory
            .filter(d => new Date(d.date) >= cutoffDate)
            .map(d => ({
                ...d,
                displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }));
    }, [dailyHistory, timeRange]);

    // Daily performance metrics
    const dailyMetrics = useMemo(() => {
        if (filteredDailyData.length < 2) return null;
        const first = filteredDailyData[0].value;
        const last = filteredDailyData[filteredDailyData.length - 1].value;
        const change = last - first;
        const changePercent = first > 0 ? (change / first) * 100 : 0;
        return { change, changePercent };
    }, [filteredDailyData]);

    const widgets = [
        { id: 'live', label: 'Live', icon: Activity },
        { id: 'daily', label: 'Daily', icon: Calendar }
    ];

    const timeRanges = ['1W', '1M', '3M', '1Y'];

    // Swipe gesture handling
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeWidget < widgets.length - 1) {
            setActiveWidget(prev => prev + 1);
        }
        if (isRightSwipe && activeWidget > 0) {
            setActiveWidget(prev => prev - 1);
        }
    };

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
                    </div>
                </div>

                {/* iPhone-style Widget Switcher */}
                <div
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col transition-all duration-300 relative overflow-hidden touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Widget Tabs */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {widgets.map((w, idx) => (
                                <button
                                    key={w.id}
                                    onClick={() => setActiveWidget(idx)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeWidget === idx
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <w.icon size={12} />
                                    {w.label}
                                </button>
                            ))}
                        </div>

                        {/* Time Range (only for Daily) */}
                        {activeWidget === 1 && (
                            <div className="flex gap-1">
                                {timeRanges.map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${timeRange === range
                                            ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeWidget === 0 && (
                            <span className="text-[10px] text-slate-500 uppercase bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">Real-time</span>
                        )}
                    </div>

                    {/* Subtitle */}
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-slate-600 dark:text-slate-300 text-sm font-bold">
                            {activeWidget === 0 ? 'Live Performance' : 'Daily Performance'}
                        </h3>
                        {activeWidget === 1 && dailyMetrics && (
                            <span className={`text-xs font-bold ${dailyMetrics.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {dailyMetrics.change >= 0 ? '+' : ''}{dailyMetrics.changePercent.toFixed(2)}%
                            </span>
                        )}
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 min-h-[160px] w-full relative">
                        {/* Live Performance Chart */}
                        <div className={`absolute inset-0 transition-all duration-300 ${activeWidget === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
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
                                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }} animationDuration={500} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic gap-2 opacity-60">
                                    <Activity size={24} />
                                    <span>Collecting data points...</span>
                                </div>
                            )}
                        </div>

                        {/* Daily Performance Chart */}
                        <div className={`absolute inset-0 transition-all duration-300 ${activeWidget === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            {filteredDailyData.length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={filteredDailyData}>
                                        <defs>
                                            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={dailyMetrics?.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={dailyMetrics?.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                        <XAxis dataKey="displayDate" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
                                        <YAxis domain={['auto', 'auto']} hide={true} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                                            labelStyle={{ color: '#94a3b8' }}
                                            formatter={(value) => [formatCurrency(value, 'THB'), 'Value']}
                                        />
                                        <Area type="monotone" dataKey="value" stroke={dailyMetrics?.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={2} fill="url(#colorDaily)" animationDuration={500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic gap-2 opacity-60">
                                    <Calendar size={24} />
                                    <span>Not enough daily data yet</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Widget Dots Indicator */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {widgets.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveWidget(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${activeWidget === idx ? 'bg-emerald-500 w-4' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
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
