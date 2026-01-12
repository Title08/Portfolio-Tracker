import { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function ExchangeModal({ isOpen, onClose, onExchange, thbWallets, usdWallets }) {
    const [exchangeData, setExchangeData] = useState({
        direction: 'THB_TO_USD',
        sourceId: '',
        destinationId: 'NEW',
        amount: '',
        rate: '35.00',
        description: ''
    });
    const [error, setError] = useState('');

    const handleExchangeChange = (e) => {
        setError('');
        const { name, value } = e.target;
        setExchangeData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onExchange(e, exchangeData, setError);
    };

    // Cleanup on close is handled by parent or useEffect here if strict reset needed
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-800 to-indigo-900/20">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-500/10 p-2 rounded text-emerald-500"><ArrowRightLeft size={20} /></div>
                        <h3 className="text-xl font-bold text-white">Currency Exchange</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="px-6 pt-4">
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg">
                        <button onClick={() => { setExchangeData(prev => ({ ...prev, direction: 'THB_TO_USD', sourceId: '', destinationId: 'NEW' })); setError(''); }} className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${exchangeData.direction === 'THB_TO_USD' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Buy USD (THB → USD)</button>
                        <button onClick={() => { setExchangeData(prev => ({ ...prev, direction: 'USD_TO_THB', sourceId: '', destinationId: 'NEW' })); setError(''); }} className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${exchangeData.direction === 'USD_TO_THB' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Sell USD (USD → THB)</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-semibold">From ({exchangeData.direction === 'THB_TO_USD' ? 'THB Source' : 'USD Source'})</label>
                        <select required name="sourceId" value={exchangeData.sourceId} onChange={handleExchangeChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="">-- Select Wallet --</option>
                            {exchangeData.direction === 'THB_TO_USD'
                                ? thbWallets.map(w => <option key={w.id} value={w.id}>{w.name} (Available: ฿{formatCurrency(w.quantity, 'THB').replace('THB', '')})</option>)
                                : usdWallets.map(w => <option key={w.id} value={w.id}>{w.name} (Available: {formatCurrency(w.quantity)})</option>)
                            }
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-semibold">Amount ({exchangeData.direction === 'THB_TO_USD' ? 'THB' : 'USD'})</label><input required type="number" step="any" name="amount" value={exchangeData.amount} onChange={handleExchangeChange} placeholder="1000" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                        <div className="space-y-1"><label className="text-xs text-emerald-400 uppercase font-semibold">Rate (THB/USD)</label><input required type="number" step="any" name="rate" value={exchangeData.rate} onChange={handleExchangeChange} placeholder="35.00" className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-semibold">To ({exchangeData.direction === 'THB_TO_USD' ? 'USD Destination' : 'THB Destination'})</label>
                        <select name="destinationId" value={exchangeData.destinationId} onChange={handleExchangeChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="NEW">+ Create New Wallet Entry</option>
                            {exchangeData.direction === 'THB_TO_USD'
                                ? usdWallets.map(w => <option key={w.id} value={w.id}>Merge into: {w.name} (Avg Rate: ฿{parseFloat(w.exchangeRate).toFixed(2)})</option>)
                                : thbWallets.map(w => <option key={w.id} value={w.id}>Merge into: {w.name}</option>)
                            }
                        </select>
                        {exchangeData.destinationId !== 'NEW' && exchangeData.direction === 'THB_TO_USD' && (<p className="text-[10px] text-emerald-400 mt-1">Note: This will average the exchange rate of the existing wallet.</p>)}
                    </div>
                    {error && (<div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" /><p className="text-xs text-red-200 font-medium">{error}</p></div>)}
                    <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 ${exchangeData.direction === 'THB_TO_USD' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`}><ArrowRightLeft size={18} /> Confirm</button>
                </form>
            </div>
        </div>
    );
}
