import { useState, useEffect } from 'react';
import { X, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function TransactionModal({ isOpen, onClose, onTransaction, wallet, type = 'DEPOSIT' }) {
    const [transactionData, setTransactionData] = useState({
        type: 'DEPOSIT',
        walletId: null,
        walletName: '',
        currency: '',
        amount: '',
        currentQty: 0
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && wallet) {
            setTransactionData({
                type: type,
                walletId: wallet.id,
                walletName: wallet.name,
                currency: wallet.currency,
                amount: '',
                currentQty: wallet.quantity
            });
            setError('');
        }
    }, [isOpen, wallet, type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onTransaction(e, transactionData, setError);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
                <div className={`p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center ${transactionData.type === 'DEPOSIT' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded ${transactionData.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-orange-500/10 text-orange-600 dark:text-orange-500'}`}>
                            {transactionData.type === 'DEPOSIT' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{transactionData.type === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-2">
                        <h4 className="text-slate-900 dark:text-white font-semibold text-sm">{transactionData.walletName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current Balance: {transactionData.currency === 'THB' ? formatCurrency(transactionData.currentQty, 'THB') : formatCurrency(transactionData.currentQty)}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Amount</label>
                        <div className="relative">
                            <input required type="number" step="any" value={transactionData.amount} onChange={(e) => { setTransactionData({ ...transactionData, amount: e.target.value }); setError(''); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-4 pr-12 py-3 text-slate-900 dark:text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" autoFocus />
                            <span className="absolute right-4 top-3.5 text-slate-500 font-bold text-sm">{transactionData.currency}</span>
                        </div>
                    </div>
                    {error && (<div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" /><p className="text-xs text-red-600 dark:text-red-200 font-medium">{error}</p></div>)}
                    <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 ${transactionData.type === 'DEPOSIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                        {transactionData.type === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdraw'}
                    </button>
                </form>
            </div>
        </div>
    );
}
