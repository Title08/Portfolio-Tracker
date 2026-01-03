import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchAssets } from '../../services/api';

export default function SymbolSearch({ onSelect, onInputChange, required = false }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    const isSelectionRef = useRef(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (isSelectionRef.current) {
                isSelectionRef.current = false;
                return;
            }

            if (query.length >= 1) {
                setIsLoading(true);
                const data = await searchAssets(query);
                setResults(data);
                setIsLoading(false);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (item) => {
        isSelectionRef.current = true;
        setQuery(item.symbol);
        setShowDropdown(false);
        onSelect(item);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    required={required}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (onInputChange) onInputChange(e.target.value);
                    }}
                    placeholder="Search e.g. AAPL, BTC-USD"
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg pl-10 pr-4 py-2 text-white uppercase focus:ring-indigo-500 focus:outline-none placeholder:normal-case"
                />
                <div className="absolute left-3 top-2.5 text-emerald-500">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </div>
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {results.map((item) => (
                        <button
                            key={item.symbol}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-white block">{item.symbol}</span>
                                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">{item.typeDisp || 'Asset'}</span>
                            </div>
                            <div className="text-xs text-slate-400 truncate">{item.shortname || item.longname}</div>
                            <div className="text-[10px] text-slate-500">{item.exchDisp}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
