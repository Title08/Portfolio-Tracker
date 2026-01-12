import { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function SellModal({ isOpen, onClose, onSell, asset }) {
    const [sellData, setSellData] = useState({
        id: null,
        name: '',
        quantity: '',
        price: '',
        currentQty: 0,
        originalRate: 0
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && asset) {
            setSellData({
                id: asset.id,
                name: asset.name,
                quantity: asset.quantity, // Default to selling all? Or empty? User's original code had quantity: asset.quantity
                price: asset.price,
                currentQty: asset.quantity,
                originalRate: asset.exchangeRate
            });
            setError('');
        }
    }, [isOpen, asset]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSell(e, sellData, setError);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-emerald-900/30 to-slate-800">
                    <div className="flex items-center gap-2"><div className="bg-emerald-500/10 p-2 rounded text-emerald-500"><DollarSign size={20} /></div><h3 className="text-xl font-bold text-white">Sell Asset</h3></div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 mb-4"><h4 className="text-white font-semibold">{sellData.name}</h4><p className="text-xs text-slate-400">Available Quantity: {sellData.currentQty}</p></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-semibold">Sell Quantity</label><input required type="number" step="any" value={sellData.quantity} onChange={(e) => { setSellData({ ...sellData, quantity: e.target.value }); setError(''); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                        <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-semibold">Selling Price ($)</label><input required type="number" step="any" value={sellData.price} onChange={(e) => { setSellData({ ...sellData, price: e.target.value }); setError(''); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                        <div className="flex justify-between items-center mb-1"><span className="text-sm text-blue-300">Total Proceeds (USD):</span><span className="text-xl font-bold text-white font-mono">{sellData.quantity && sellData.price ? formatCurrency(sellData.quantity * sellData.price) : '$0.00'}</span></div>
                        <p className="text-[10px] text-blue-400 text-right mt-1 flex items-center justify-end gap-1"><Wallet size={10} /> Will be deposited to USD Wallet</p>
                    </div>
                    {error && (<div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" /><p className="text-xs text-red-200 font-medium">{error}</p></div>)}
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"><DollarSign size={18} /> Confirm Sell</button>
                </form>
            </div>
        </div>
    );
}
