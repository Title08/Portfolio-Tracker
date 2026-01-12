
import { Coins, DollarSign, ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function WalletList({ title, totalValue, items, currency, onDeposit, onWithdraw, onDelete }) {
    const isUSD = currency === 'USD';

    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${isUSD ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'}`}>
                        {isUSD ? <DollarSign size={18} /> : <Coins size={18} />}
                    </div>
                    <h3 className="font-bold text-slate-200">{title}</h3>
                </div>
                <div className="text-right">
                    <div className={`${isUSD ? 'text-blue-400' : 'text-pink-400'} font-mono font-bold`}>
                        {formatCurrency(totalValue, 'THB')}
                    </div>
                </div>
            </div>
            <div className="divide-y divide-slate-700/50">
                {items.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-700/20 group">
                        <div>
                            <div className="text-sm font-medium text-white">{item.name}</div>
                            {isUSD && <div className="text-[10px] text-emerald-500">Rate: ฿{parseFloat(item.exchangeRate).toFixed(2)}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-right mr-2">
                                <span className="font-mono text-slate-300 text-sm">{formatCurrency(item.quantity, currency)}</span>
                            </div>
                            <button onClick={() => onDeposit(item)} className="text-slate-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Deposit"><ArrowDownCircle size={16} /></button>
                            <button onClick={() => onWithdraw(item)} className="text-slate-500 hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Withdraw"><ArrowUpCircle size={16} /></button>
                            <button onClick={() => onDelete(item.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="p-4 text-center text-xs text-slate-500">No cash added</div>}
            </div>
        </div>
    );
}
