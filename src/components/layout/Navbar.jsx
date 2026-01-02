import React from 'react';
import { Briefcase, ArrowRightLeft, Plus } from 'lucide-react';

export default function Navbar({ onOpenExchange, onOpenAdd, onRefresh }) {
    return (
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 p-2 rounded-lg">
                            <Briefcase className="h-6 w-6 text-indigo-500" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Portfolio<span className="text-indigo-500">Tracker</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onRefresh} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400">
                            Refresh
                        </button>
                        <button onClick={onOpenExchange} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all border border-slate-700">
                            <ArrowRightLeft size={16} /> Exchange
                        </button>
                        <button onClick={onOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                            <Plus size={18} /> Add Item
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
