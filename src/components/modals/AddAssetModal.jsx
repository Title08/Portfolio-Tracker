import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { ASSET_DB } from '../../constants/assets';
import SymbolSearch from '../common/SymbolSearch';
import { getAssetInfo } from '../../services/api';

export default function AddAssetModal({ isOpen, onClose, onAdd, usdWallets, initialType = 'Investment', initialData = null }) {
    const [formType, setFormType] = useState(initialType);
    const [fundingSource, setFundingSource] = useState('');
    const [newAsset, setNewAsset] = useState({
        name: '',
        symbol: '',
        type: 'Stock',
        quantity: '',
        price: '',
        totalCost: '',
        exchangeRate: '35.00',
        sector: '',
        industry: ''
    });
    const [error, setError] = useState('');

    // Reset/Initialize when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormType(initialType);
            const savedRate = localStorage.getItem('lastReqExchangeRate') || '35.00';

            if (initialData) {
                // If editing, calculate total cost from qty * price if missing
                const cost = initialData.totalCost || (initialData.quantity && initialData.price ? (initialData.quantity * initialData.price).toFixed(2) : '');
                setNewAsset({ ...initialData, totalCost: cost });
            } else {
                setNewAsset({ name: '', symbol: '', type: 'Stock', quantity: '', price: '', totalCost: '', exchangeRate: savedRate, sector: '', industry: '' });
            }
            setFundingSource('');
            setError('');
        }
    }, [isOpen, initialType, initialData]);

    const handleInputChange = (e) => {
        setError('');
        const { name, value } = e.target;

        let updates = { [name]: value };

        if (name === 'symbol') {
            const upperVal = value.toUpperCase();
            const detected = ASSET_DB[upperVal];
            if (detected) {
                setNewAsset(prev => ({ ...prev, symbol: upperVal, name: detected.name, type: detected.type }));
                return;
            }
            updates.symbol = upperVal;
        }
        else if (name === 'price') {
            // Price Changed: Update Total Cost (Cost = Price * Qty)
            const price = parseFloat(value);
            const qty = parseFloat(newAsset.quantity);
            if (!isNaN(price) && !isNaN(qty)) {
                updates.totalCost = (price * qty).toFixed(2);
            }
        }
        else if (name === 'quantity') {
            // Quantity Changed: Update Total Cost (Cost = Price * Qty)
            const qty = parseFloat(value);
            const price = parseFloat(newAsset.price);
            if (!isNaN(price) && !isNaN(qty)) {
                updates.totalCost = (price * qty).toFixed(2);
            }
        }
        else if (name === 'totalCost') {
            // Total Cost Changed: Update Quantity (Qty = Cost / Price)
            const cost = parseFloat(value);
            const price = parseFloat(newAsset.price);
            if (!isNaN(cost) && !isNaN(price) && price > 0) {
                // Use more decimals for precision, especially if crypto
                updates.quantity = (cost / price).toFixed(7);
                // Remove trailing zeros for cleaner look if possible, but keep string for input
                updates.quantity = parseFloat(updates.quantity).toString();
            }
        }

        setNewAsset(prev => ({ ...prev, ...updates }));
    };

    const handleSymbolSelect = async (item) => {
        setNewAsset(prev => ({
            ...prev,
            symbol: item.symbol,
            name: item.shortname || item.longname || prev.name,
            type: item.typeDisp === 'Cryptocurrency' ? 'Crypto' : 'Stock',
            // Reset info while fetching
            sector: '',
            industry: ''
        }));

        // Fetch detailed info
        const info = await getAssetInfo(item.symbol);
        if (info) {
            setNewAsset(prev => ({
                ...prev,
                sector: info.sector,
                industry: info.industry
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Save exchange rate preference if using external source
        if ((formType === 'Investment' && !fundingSource) || formType === 'USD') {
            if (newAsset.exchangeRate) {
                localStorage.setItem('lastReqExchangeRate', newAsset.exchangeRate);
            }
        }

        onAdd(e, { ...newAsset, fundingSource }, formType, setError);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
                <div className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Asset</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg mb-6">
                        <button onClick={() => { setFormType('Investment'); setError(''); }} className={`py-2 text-sm font-medium rounded-md transition-all ${formType === 'Investment' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>Investment</button>
                        <button onClick={() => { setFormType('USD'); setError(''); }} className={`py-2 text-sm font-medium rounded-md transition-all ${formType === 'USD' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>USD Cash</button>
                        <button onClick={() => { setFormType('THB'); setError(''); }} className={`py-2 text-sm font-medium rounded-md transition-all ${formType === 'THB' ? 'bg-pink-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>THB Cash</button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                    {formType === 'Investment' && (
                        <div className="space-y-1">
                            <label className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1">Symbol</label>
                            <SymbolSearch
                                value={newAsset.symbol}
                                disabled={!!initialData?.symbol}
                                onSelect={handleSymbolSelect}
                                onInputChange={(val) => handleInputChange({ target: { name: 'symbol', value: val } })}
                                required
                            />
                            {/* Show badges if info detected */}
                            {(newAsset.sector || newAsset.industry) && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {newAsset.sector && <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{newAsset.sector}</span>}
                                    {newAsset.industry && <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">{newAsset.industry}</span>}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="space-y-1"><label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Name</label><input required name="name" value={newAsset.name} onChange={handleInputChange} placeholder="Asset Name" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    {formType === 'Investment' && (<div className="space-y-1"><label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Type</label><select name="type" value={newAsset.type} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-indigo-500 focus:outline-none"><option value="Stock">Stock</option><option value="Crypto">Crypto</option><option value="ETF">ETF</option></select></div>)}

                    {/* Investment Fields: Price, Quantity, Total Cost */}
                    {formType === 'Investment' ? (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Price (USD)</label>
                                <input required type="number" step="any" name="price" value={newAsset.price} onChange={handleInputChange} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Quantity</label>
                                    <input required type="number" step="any" name="quantity" value={newAsset.quantity} onChange={handleInputChange} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Cost (USD)</label>
                                    <input required type="number" step="any" name="totalCost" value={newAsset.totalCost} onChange={handleInputChange} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Standard View for Cash
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{formType === 'THB' ? 'Amount (THB)' : 'Quantity'}</label>
                            <input required type="number" step="any" name="quantity" value={newAsset.quantity} onChange={handleInputChange} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    )}

                    {formType === 'Investment' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-600 dark:text-slate-300 uppercase font-bold">Pay With (USD Wallet)</label>
                                <select value={fundingSource} onChange={(e) => { setFundingSource(e.target.value); setError(''); }} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                                    <option value="">External Source (No Wallet)</option>
                                    {usdWallets.map(w => <option key={w.id} value={w.id}>{w.name} (Available: ${formatCurrency(w.quantity).replace('$', '')})</option>)}
                                </select>
                                {fundingSource ? (
                                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300">
                                        Total Cost: <b>{newAsset.totalCost ? formatCurrency(newAsset.totalCost) : '$0.00'}</b> will be deducted.
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 dark:bg-slate-700/30 p-2 rounded text-[10px] text-slate-500 dark:text-slate-400">
                                        Asset will be added without deducting from any USD wallet. Please ensure Exchange Rate is correct.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {(formType === 'USD' || (formType === 'Investment' && !fundingSource)) && (
                        <div className="space-y-1">
                            <label className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Exchange Rate (THB/USD)</label>
                            <input required type="number" step="any" name="exchangeRate" value={newAsset.exchangeRate} onChange={handleInputChange} placeholder="35.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/40 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                    )}
                    {error && (<div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" /><p className="text-xs text-red-600 dark:text-red-200 font-medium">{error}</p></div>)}
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg mt-2 transition-colors">Save Item</button>
                </form>
            </div>
        </div>
    );
}
