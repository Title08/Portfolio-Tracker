
import { Coins, DollarSign, ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function WalletList({ title, totalValue, items, currency, onDeposit, onWithdraw, onDelete }) {
    const isUSD = currency === 'USD';

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${isUSD ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500' : 'bg-pink-500/10 text-pink-600 dark:text-pink-500'}`}>
                        {isUSD ? <DollarSign size={18} /> : <Coins size={18} />}
                    </div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
                </div>
                <div className="text-right">
                    <div className={`${isUSD ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'} font-mono font-bold`}>
                        {formatCurrency(totalValue, 'THB')}
                    </div>
                </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {items.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/20 group transition-colors">
                        <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                            {isUSD && <div className="text-[10px] text-emerald-600 dark:text-emerald-500">Rate: ฿{parseFloat(item.exchangeRate).toFixed(2)}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-right mr-2">
                                <span className="font-mono text-slate-600 dark:text-slate-300 text-sm">{formatCurrency(item.quantity, currency)}</span>
                            </div>
                            <button onClick={() => onDeposit(item)} className="text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Deposit"><ArrowDownCircle size={16} /></button>
                            <button onClick={() => onWithdraw(item)} className="text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Withdraw"><ArrowUpCircle size={16} /></button>
                            <button onClick={() => onDelete(item.id)} className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="p-4 text-center text-xs text-slate-500">No cash added</div>}
            </div>
        </div>
    );
}
