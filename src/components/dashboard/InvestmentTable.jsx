import React from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function InvestmentTable({ investments, totalValue, onBuyMore, onSell, onDelete }) {
    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl min-h-[400px]">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><TrendingUp size={20} /></div>
                    <div><h3 className="font-bold text-lg text-white">Investment Portfolio</h3><p className="text-xs text-slate-500">Stocks, Crypto & Assets</p></div>
                </div>
                <div className="text-right"><span className="block text-2xl font-bold text-white">{formatCurrency(totalValue, 'THB')}</span><span className="text-xs text-emerald-400 font-mono">Cost Basis Valuation</span></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/30 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Asset</th>
                            <th className="p-4 font-semibold text-right">Qty</th>
                            <th className="p-4 font-semibold text-right">Avg Price</th>
                            <th className="p-4 font-semibold text-right">Val (USD)</th>
                            <th className="p-4 font-semibold text-right text-emerald-400">Avg Rate</th>
                            <th className="p-4 font-semibold text-right">Val (THB)</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {investments.length === 0 ? (<tr><td colSpan="7" className="p-12 text-center text-slate-500 italic">No investments yet.</td></tr>) : (
                            investments.map((asset) => (
                                <tr key={asset.id} className="hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{asset.name}</div>
                                        <div className="flex gap-2 mt-1 flex-wrap">
                                            <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded font-mono">{asset.symbol}</span>
                                            <span className="text-[10px] text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded">{asset.type}</span>
                                            {asset.sector && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">{asset.sector}</span>}
                                            {asset.industry && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded truncate max-w-[150px]" title={asset.industry}>{asset.industry}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-white font-mono font-medium">{asset.quantity.toFixed(4)}</td>
                                    <td className="p-4 text-right text-slate-400 font-mono text-sm">{formatCurrency(asset.price)}</td>
                                    <td className="p-4 text-right text-slate-200 font-mono font-medium">{formatCurrency(asset.price * asset.quantity)}</td>
                                    <td className="p-4 text-right text-emerald-500/80 font-mono text-sm">฿{parseFloat(asset.exchangeRate).toFixed(2)}</td>
                                    <td className="p-4 text-right text-white font-bold font-mono">{formatCurrency(asset.price * asset.quantity * asset.exchangeRate, 'THB')}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => onBuyMore(asset)} className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white p-2 rounded transition-colors" title="Buy More"><ShoppingCart size={16} /></button>
                                            <button onClick={() => onSell(asset)} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white p-2 rounded transition-colors" title="Sell Asset"><DollarSign size={16} /></button>
                                            <button onClick={() => onDelete(asset.id)} className="text-slate-500 hover:text-red-400 p-2 rounded transition-all hover:bg-red-400/10" title="Delete Record"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
