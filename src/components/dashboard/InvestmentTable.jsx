
import { TrendingUp, ShoppingCart, DollarSign, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function InvestmentTable({ investments, totalValue, onBuyMore, onSell, onDelete }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl min-h-[400px] transition-all duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600 dark:text-emerald-500"><TrendingUp size={20} /></div>
                    <div><h3 className="font-bold text-lg text-slate-900 dark:text-white">Investment Portfolio</h3><p className="text-xs text-slate-500">Stocks, Crypto & Assets</p></div>
                </div>
                <div className="text-right"><span className="block text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalValue, 'THB')}</span><span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Cost Basis Valuation</span></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-100 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider transition-colors">
                            <th className="px-2 py-3 font-semibold">Asset</th>
                            <th className="px-2 py-3 font-semibold text-right">Qty</th>
                            <th className="px-2 py-3 font-semibold text-right">Avg Price</th>
                            <th className="px-2 py-3 font-semibold text-right">Price ($)</th>
                            <th className="px-2 py-3 font-semibold text-right">1D %</th>
                            <th className="px-2 py-3 font-semibold text-right">Val (USD)</th>
                            <th className="px-2 py-3 font-semibold text-right">PnL ($)</th>
                            <th className="px-2 py-3 font-semibold text-right">PnL (%)</th>
                            <th className="px-2 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-400">Avg Rate</th>
                            <th className="px-2 py-3 font-semibold text-right">Val (THB)</th>
                            <th className="px-2 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {investments.length === 0 ? (<tr><td colSpan="11" className="p-12 text-center text-slate-500 italic">No investments yet.</td></tr>) : (
                            investments.map((asset) => {
                                const costBasis = asset.price * asset.quantity;
                                const marketPrice = asset.marketPrice || asset.price;
                                const marketValue = marketPrice * asset.quantity;
                                const pnlUSD = marketValue - costBasis;
                                const pnlPercent = costBasis > 0 ? (pnlUSD / costBasis) * 100 : 0;
                                const isProfit = pnlUSD >= 0;
                                const pnlColor = isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                                const dayChange = asset.marketChangePercent || 0;
                                const dayChangeColor = dayChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

                                return (
                                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-2 py-3">
                                            <div className="font-semibold text-slate-900 dark:text-white">{asset.name}</div>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">{asset.symbol}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 rounded">{asset.type}</span>
                                                {asset.sector && <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">{asset.sector}</span>}
                                                {asset.industry && <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded truncate max-w-[150px]" title={asset.industry}>{asset.industry}</span>}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-right text-slate-900 dark:text-white font-mono font-medium">{asset.quantity.toFixed(4)}</td>
                                        <td className="px-2 py-3 text-right text-slate-500 dark:text-slate-400 font-mono text-sm">{formatCurrency(asset.price)}</td>
                                        <td className="px-2 py-3 text-right text-slate-900 dark:text-white font-mono text-sm">{formatCurrency(marketPrice)}</td>
                                        <td className={`px-2 py-3 text-right font-mono text-sm ${dayChangeColor}`}>
                                            {dayChange > 0 ? '+' : ''}{dayChange.toFixed(2)}%
                                        </td>
                                        <td className="px-2 py-3 text-right text-slate-600 dark:text-slate-200 font-mono font-medium">{formatCurrency(costBasis)}</td>
                                        <td className={`px-2 py-3 text-right font-mono font-medium ${pnlColor}`}>
                                            {pnlUSD > 0 ? '+' : ''}{formatCurrency(pnlUSD)}
                                        </td>
                                        <td className={`px-2 py-3 text-right font-mono font-medium ${pnlColor}`}>
                                            {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                        </td>
                                        <td className="px-2 py-3 text-right text-emerald-600/80 dark:text-emerald-500/80 font-mono text-sm">฿{parseFloat(asset.exchangeRate).toFixed(2)}</td>
                                        <td className="px-2 py-3 text-right text-slate-900 dark:text-white font-bold font-mono">{formatCurrency(marketValue * asset.exchangeRate, 'THB')}</td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => onBuyMore(asset)} className="bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white dark:text-blue-500 p-2 rounded transition-colors" title="Buy More"><ShoppingCart size={16} /></button>
                                                <button onClick={() => onSell(asset)} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:text-emerald-500 p-2 rounded transition-colors" title="Sell Asset"><DollarSign size={16} /></button>
                                                <button onClick={() => onDelete(asset.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded transition-all hover:bg-red-400/10" title="Delete Record"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
